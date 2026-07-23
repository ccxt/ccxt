---
title: "Handbuch"
description: "Die ccxt-Bibliothek ist eine Sammlung verfügbarer Krypto-Börsen oder Börsenklassen. Jede Klasse implementiert die öffentliche und private API für eine bestimmte Krypto…"
---

# Übersicht

Die ccxt-Bibliothek ist eine Sammlung verfügbarer Krypto-*Börsen* oder Börsenklassen. Jede Klasse implementiert die öffentliche und private API für eine bestimmte Kryptobörse. Alle Börsen leiten von der Basisklasse Exchange ab und teilen eine Reihe gemeinsamer Methoden. Um über die ccxt-Bibliothek auf eine bestimmte Börse zuzugreifen, müssen Sie eine Instanz der entsprechenden Börsenklasse erstellen. Unterstützte Börsen werden regelmäßig aktualisiert und neue Börsen werden laufend hinzugefügt.

Die Struktur der Bibliothek lässt sich wie folgt skizzieren:

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

Vollständige öffentliche und private HTTP REST APIs für alle Börsen sind in JavaScript, Python, PHP, C#, Go und Java implementiert. WebSocket-Implementierungen sind in [CCXT Pro](https://ccxt.pro) verfügbar und unterstützen WebSocket-Streams.

- [**Börsen**](#exchanges)
- [**Märkte**](#markets)
- [**Implizite API**](#implicit-api)
- [**Einheitliche API**](#unified-api)
- [**Öffentliche API**](#public-api)
- [**Private API**](#private-api)
- [**Fehlerbehandlung**](#error-handling)
- [**Fehlerbehebung**](#troubleshooting)
- [**CCXT Pro**](#ccxt-pro)

## Social

- <sub>[![Twitter](https://img.shields.io/twitter/follow/ccxt_official?style=social)](https://twitter.com/ccxt_official)</sub> Folgen Sie uns auf Twitter
- <sub>[![Medium](https://img.shields.io/badge/read-our%20blog-black?logo=medium)](https://medium.com/@ccxt)</sub> Lesen Sie unseren Blog auf Medium
- <sub>[![Discord](https://img.shields.io/discord/690203284119617602?logo=discord&logoColor=white)](https://discord.gg/dhzSKYU)</sub> Treten Sie unserem Discord bei
- <sub>[![Telegram Chat](https://img.shields.io/badge/CCXT-Chat-blue?logo=telegram)](https://t.me/ccxt_chat)</sub> CCXT-Chat auf Telegram (technischer Support)

- Ankündigungskanäle:
- - <sub>[![Telegram](https://img.shields.io/badge/CCXT-Channel-blue?logo=telegram)](https://t.me/ccxt_announcements)</sub>
- - <sub>[![Discord](https://img.shields.io/badge/CCXT-Channel-blue?logo=discord)](https://discord.com/channels/690203284119617602/1057748769690619984)</sub>


# Börsen

- [Instanziierung](#instantiation)
- [Börsenstruktur](#exchange-structure)
- [Rate Limit](#rate-limit)
<!--- init list -->Die CCXT-Bibliothek unterstützt derzeit die folgenden 108 Kryptowährungs-Börsenmärkte und Handels-APIs:

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

Neben der Durchführung grundlegender Market- und Limit-Orders bieten einige Börsen Margin-Trading (Hebel), verschiedene Derivate (wie Futures-Kontrakte und Optionen) sowie [Dark Pools](https://en.wikipedia.org/wiki/Dark_pool), [OTC](https://en.wikipedia.org/wiki/Over-the-counter_(finance)) (außerbörslicher Handel), Händler-APIs und vieles mehr.

## Instanziierung

Um sich mit einer Börse zu verbinden und mit dem Handel zu beginnen, müssen Sie eine Börsenklasse aus der ccxt-Bibliothek instanziieren.

Um die vollständige Liste der IDs unterstützter Börsen programmgesteuert abzurufen:


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


Eine Börse kann wie in den folgenden Beispielen gezeigt instanziiert werden:


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

Die ccxt-Bibliothek in PHP verwendet eingebaute UTC/GMT-Zeitfunktionen, daher müssen Sie `date.timezone` in Ihrer php.ini setzen oder die Funktion [date_default_timezone_set()](http://php.net/manual/en/function.date-default-timezone-set.php) aufrufen, bevor Sie die PHP-Version der Bibliothek verwenden. Die empfohlene Zeitzoneneinstellung ist `"UTC"`.

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


### Funktionen

Große Börsen verfügen über die `.features`-Eigenschaft, in der Sie sehen können, welche Methoden und Funktionalitäten für jeden Markttyp unterstützt werden (wenn eine Methode auf `null/undefined` gesetzt ist, bedeutet das, dass die Methode von der Börse "nicht unterstützt" wird).

*Diese Funktion befindet sich derzeit in der Entwicklung und könnte unvollständig sein; melden Sie gerne alle Probleme, die Sie darin finden.*

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


### Überschreiben von Börsen-Eigenschaften bei der Instanziierung

Die meisten Börsen-Eigenschaften sowie spezifische Optionen können bei der Instanziierung der Börsenklasse oder danach überschrieben werden, wie unten gezeigt:


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


### Überschreiben von Börsen-Methoden

In allen von CCXT unterstützten Sprachen können Sie Instanzmethoden zur Laufzeit überschreiben:


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


### Testnets und Sandbox-Umgebungen

Einige Börsen bieten auch separate APIs zu Testzwecken an, die es Entwicklern ermöglichen, virtuelles Geld kostenlos zu handeln und ihre Ideen zu testen. Diese APIs werden als _"Testnets", "Sandboxes" oder "Staging-Umgebungen"_ (mit virtuellen Test-Assets) bezeichnet, im Gegensatz zu _"Mainnets" und "Produktionsumgebungen"_ (mit echten Assets). Meistens ist eine Sandbox-API ein Klon einer Produktions-API, also buchstäblich dieselbe API, nur mit einer anderen URL zum Börsenserver.

CCXT vereinheitlicht diesen Aspekt und ermöglicht es dem Benutzer, zur Sandbox der Börse zu wechseln (sofern von der jeweiligen Börse unterstützt).
Um zur Sandbox zu wechseln, muss `exchange.setSandboxMode (true)` oder `exchange.set_sandbox_mode(true)` **unmittelbar nach dem Erstellen der Börse vor jedem anderen Aufruf** aufgerufen werden!


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


- `exchange.setSandboxMode (true) / exchange.set_sandbox_mode (True)` muss Ihr erster Aufruf unmittelbar nach dem Erstellen der Börse sein (vor allen anderen Aufrufen)
- Um die [API-Schlüssel](#authentication) für die Sandbox zu erhalten, muss sich der Benutzer auf der Sandbox-Website der jeweiligen Börse registrieren und ein Sandbox-Schlüsselpaar erstellen
- **Sandbox-Schlüssel sind nicht mit Produktionsschlüsseln austauschbar!**

## Börsenstruktur

Jede Börse verfügt über eine Reihe von Eigenschaften und Methoden, von denen die meisten durch Übergabe eines assoziativen Arrays von Parametern an einen Börsenkonstruktor überschrieben werden können. Sie können auch eine Unterklasse erstellen und alles überschreiben.

Hier ist eine Übersicht der generischen Börsen-Eigenschaften mit beispielhaft hinzugefügten Werten:

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

### Börsen-Eigenschaften

Nachfolgend finden Sie eine detaillierte Beschreibung jeder der Basisbörsen-Eigenschaften:

- `id`: Jede Börse hat eine Standard-ID. Die ID wird für nichts verwendet; sie ist ein String-Literal zur Identifikation von Börsen-Instanzen auf Benutzerseite. Sie können mehrere Verweise auf dieselbe Börse haben und diese durch IDs unterscheiden. Standard-IDs sind alle Kleinbuchstaben und entsprechen den Börsennamen.

- `name`: Dies ist ein String-Literal, das den menschenlesbaren Börsennamen enthält.

- `countries`: Ein Array von String-Literalen mit zweistelligen ISO-Ländercodes, aus denen die Börse operiert.

- `urls['api']`: Die einzelne String-Literal-Basis-URL für API-Aufrufe oder ein assoziatives Array separater URLs für private und öffentliche APIs.

- `urls['www']`: Die Haupt-HTTP-Website-URL.

- `urls['doc']`: Eine einzelne String-URL-Verknüpfung zur Originaldokumentation für die Börsen-API auf deren Website oder ein Array von Links zu Dokumentationen.

- `version`: Ein String-Literal, das den Versionsbezeichner für die aktuelle Börsen-API enthält. Die ccxt-Bibliothek hängt diesen Versionsstring bei jeder Anfrage an die API-Basis-URL an. Sie müssen ihn nicht ändern, es sei denn, Sie implementieren eine neue Börsen-API. Der Versionsbezeichner ist in der Regel ein numerischer String, der in einigen Fällen mit dem Buchstaben 'v' beginnt, wie z. B. v1.1. Überschreiben Sie ihn nicht, es sei denn, Sie implementieren Ihre eigene neue Krypto-Börsenklasse.

- `api`: Ein assoziatives Array mit einer Definition aller API-Endpunkte, die von einer Kryptobörse bereitgestellt werden. Die API-Definition wird von ccxt verwendet, um automatisch aufrufbare Instanzmethoden für jeden verfügbaren Endpunkt zu erstellen.

- `has`: Dies ist ein assoziatives Array von Börsenfähigkeiten (z. B. `fetchTickers`, `fetchOHLCV` oder `CORS`).

- `timeframes`: Ein assoziatives Array von Zeitrahmen, die von der fetchOHLCV-Methode der Börse unterstützt werden. Dies wird nur befüllt, wenn die Eigenschaft `has['fetchOHLCV']` den Wert true hat.

- `timeout`: Ein Timeout in Millisekunden für einen Anfrage-Antwort-Roundtrip (Standard-Timeout ist 10000 ms = 10 Sekunden). Wenn die Antwort in dieser Zeit nicht empfangen wird, wirft die Bibliothek eine `RequestTimeout`-Ausnahme. Sie können den Standard-Timeout-Wert beibehalten oder ihn auf einen vernünftigen Wert setzen. Ewig ohne Timeout zu hängen ist sicherlich keine Option. Im Allgemeinen müssen Sie diese Option nicht überschreiben.

- `rateLimit`: Das Rate-Limit in Millisekunden. Dieser Wert gibt die Anzahl der Millisekunden an, die zwischen aufeinanderfolgenden Anfragen gewartet werden soll, um innerhalb der Rate-Limits der Börse zu bleiben. Wenn `rateLimit` beispielsweise 1000 ist, bedeutet das, dass 1 Anfrage pro Sekunde erlaubt ist. Der eingebaute Rate-Limiter ist standardmäßig aktiviert und kann durch Setzen der Eigenschaft `enableRateLimit` auf false deaktiviert werden.

- `enableRateLimit`: Ein boolescher Wert (true/false), der den eingebauten Rate-Limiter aktiviert und aufeinanderfolgende Anfragen drosselt. Diese Einstellung ist standardmäßig `true` (aktiviert). **Der Benutzer ist verpflichtet, ein eigenes [Rate-Limiting](#rate-limit) zu implementieren oder den eingebauten Rate-Limiter aktiviert zu lassen, um eine Sperrung durch die Börse zu vermeiden**.

- `userAgent`: Ein Objekt zum Setzen des HTTP-User-Agent-Headers. Die ccxt-Bibliothek setzt ihren User-Agent standardmäßig. Einige Börsen mögen das möglicherweise nicht. Wenn Sie Schwierigkeiten haben, eine Antwort von einer Börse zu erhalten, und den User-Agent deaktivieren oder den Standard verwenden möchten, setzen Sie diesen Wert auf false, undefined oder einen leeren String. Der Wert von `userAgent` kann durch die unten stehende HTTP-`headers`-Eigenschaft überschrieben werden.

- `headers`: Ein assoziatives Array von HTTP-Headern und deren Werten. Der Standardwert ist leer `{}`. Alle Header werden allen Anfragen vorangestellt. Wenn der `User-Agent`-Header innerhalb von `headers` gesetzt ist, überschreibt er den in der obigen `userAgent`-Eigenschaft gesetzten Wert.

- `verbose`: Ein boolesches Flag, das angibt, ob HTTP-Anfragen in stdout protokolliert werden sollen (das verbose-Flag ist standardmäßig false). Python-Benutzer haben eine alternative Möglichkeit des DEBUG-Loggings mit einem standardmäßigen Python-Logger, der durch Hinzufügen dieser zwei Zeilen am Anfang ihres Codes aktiviert wird:
  ```python
  import logging
  logging.basicConfig(level=logging.DEBUG)
  ```
- `returnResponseHeaders`: Wenn auf `true` gesetzt, werden die HTTP-Antwort-Header der Börse in der `responseHeaders`-Eigenschaft innerhalb des `info`-Feldes des zurückgegebenen Ergebnisses für REST-API-Aufrufe einbezogen. Dies kann nützlich sein, um auf Metadaten wie Rate-Limit-Informationen oder börsenspezifische Header zuzugreifen. Standardmäßig ist dies `false` und Header sind nicht in der Antwort enthalten. Hinweis: Dies wird nur unterstützt, wenn die Antwort ein Objekt und keine Liste oder Zeichenkette ist.

- `markets`: Ein assoziatives Array von Märkten, indiziert nach gängigen Handelspaaren oder Symbolen. Märkte sollten vor dem Zugriff auf diese Eigenschaft geladen werden. Märkte sind nicht verfügbar, bis Sie die Methode `loadMarkets() / load_markets()` auf der Börsen-Instanz aufrufen.

- `symbols`: Ein nicht-assoziatives Array (eine Liste) von Symbolen, die bei einer Börse verfügbar sind, in alphabetischer Reihenfolge sortiert. Dies sind die Schlüssel der `markets`-Eigenschaft. Symbole werden aus Märkten geladen und neu geladen. Diese Eigenschaft ist eine praktische Abkürzung für alle Marktschlüssel.

- `currencies`: Ein assoziatives Array (ein Dict) von Währungen nach Codes (normalerweise 3 oder 4 Buchstaben), die bei einer Börse verfügbar sind. Währungen werden aus Märkten geladen und neu geladen.

- `markets_by_id`: Ein assoziatives Array von Arrays von Märkten, indiziert nach börsenspezifischen IDs. Typischerweise ein Array der Länge eins, es sei denn, es gibt mehrere Märkte mit derselben marketId. Märkte sollten vor dem Zugriff auf diese Eigenschaft geladen werden.

- `apiKey`: Dies ist Ihr öffentlicher API-Schlüssel als String-Literal. Die meisten Börsen erfordern die [Einrichtung von API-Schlüsseln](#api-keys-setup).

- `secret`: Ihr privater geheimer API-Schlüssel als String-Literal. Die meisten Börsen erfordern diesen ebenfalls zusammen mit dem apiKey.

- `password`: Ein String-Literal mit Ihrem Passwort/Ihrer Passphrase. Einige Börsen erfordern diesen Parameter für den Handel, aber die meisten nicht.

- `uid`: Eine eindeutige ID Ihres Kontos. Dies kann ein String-Literal oder eine Zahl sein. Einige Börsen erfordern dies ebenfalls für den Handel, aber die meisten nicht.

- `requiredCredentials`: Ein vereinheitlichtes assoziatives Dictionary, das anzeigt, welche der oben genannten API-Anmeldeinformationen für das Senden privater API-Aufrufe an die zugrunde liegende Börse erforderlich sind (eine Börse kann einen bestimmten Satz von Schlüsseln erfordern).

- `options`: Ein börsenspezifisches assoziatives Dictionary mit speziellen Schlüsseln und Optionen, die von der zugrunde liegenden Börse akzeptiert und in CCXT unterstützt werden.

- `precisionMode`: Der Dezimalpräzisions-Zählmodus der Börse; lesen Sie mehr über [Präzision und Limits](#precision-and-limits).

- Für Proxies – `proxyUrl`, `httpUrl`, `httpsUrl`, `socksProxy`, `wsProxy`, `wssProxy`, `wsSocksProxy`: Eine URL eines bestimmten Proxys. Weitere Details finden Sie im Abschnitt [Proxy](#proxy).

Siehe diesen Abschnitt zu [Überschreiben von Börsen-Eigenschaften](#overriding-exchange-properties-upon-instantiation).

#### Börsen-Metadaten

- `has`: Ein assoziatives Array mit Flags für Börsenfähigkeiten, einschließlich der folgenden:

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

    Die Bedeutung jedes Flags, das die Verfügbarkeit dieser oder jener Methode anzeigt, ist:

    - Ein Wert von `undefined` / `None` / `null` bedeutet, dass die Methode derzeit nicht in ccxt implementiert ist (entweder hat ccxt sie noch nicht vereinheitlicht oder die Methode ist von der Börsen-API nativ nicht verfügbar)
    - Boolesches `false` bedeutet speziell, dass der Endpunkt von der Börsen-API nativ nicht verfügbar ist
    - Boolesches `true` bedeutet, dass der Endpunkt von der Börsen-API nativ verfügbar und in der ccxt-Bibliothek vereinheitlicht ist
    - Der String `'emulated'` bedeutet, dass der Endpunkt von der Börsen-API nativ nicht verfügbar ist, aber von der ccxt-Bibliothek (so weit wie möglich) aus anderen verfügbaren true-Methoden rekonstruiert wird

    Eine vollständige Liste aller Börsen und ihrer unterstützten Methoden finden Sie in diesem Beispiel: https://github.com/ccxt/ccxt/blob/master/examples/js/exchange-capabilities.js

## Rate-Limit

Börsen erlegen in der Regel das sogenannte *Rate-Limit* auf. Börsen merken sich und verfolgen Ihre Benutzeranmeldedaten und Ihre IP-Adresse und erlauben Ihnen nicht, die API zu häufig abzufragen. Sie balancieren ihre Last und kontrollieren den Datenverkehr, um API-Server vor (D)DoS-Angriffen und Missbrauch zu schützen.

**WARNUNG: Bleiben Sie unter dem Rate-Limit, um eine Sperrung zu vermeiden!**

Die meisten Börsen erlauben **bis zu 1 oder 2 Anfragen pro Sekunde**. Börsen können Ihren Zugang zu ihrer API vorübergehend einschränken oder Sie für einen gewissen Zeitraum sperren, wenn Sie zu viele Anfragen stellen.

**Die Eigenschaft `exchange.rateLimit` ist auf einen sicheren Standardwert gesetzt, der nicht optimal ist. Einige Börsen können unterschiedliche Rate-Limits für verschiedene Endpunkte haben. Es liegt am Benutzer, `rateLimit` entsprechend den anwendungsspezifischen Anforderungen anzupassen.**

Die CCXT-Bibliothek verfügt über experimentelle integrierte Rate-Limiter-Algorithmen, die das notwendige Drosseln im Hintergrund transparent für den Benutzer durchführen. **WARNUNG: Benutzer sind für mindestens eine Art von Rate-Limiting verantwortlich: entweder durch Implementierung eines benutzerdefinierten Algorithmus oder durch Verwendung des integrierten Rate-Limiters.**

CCXT verfügt über die folgenden integrierten Rate-Limiting-Algorithmen:

- **Leaky Bucket (Standard)**: Funktioniert, indem Anfragen in eine Warteschlange gestellt und mit einer gleichmäßigen, festen Rate freigegeben werden. Anfrageschübe werden über die Zeit geglättet, anstatt sofort ausgeführt zu werden, was hilft, die Rate-Limits der Börse nicht zu überschreiten, während kurze Aktivitätsspitzen dennoch problemlos bewältigt werden können.
- **Fensterbasiert (optional)**: Wenn der Benutzer die Option `{ 'rateLimiterAlgorithm': 'rollingWindow' }` angibt, wechselt ccxt vom Leaky-Bucket-Modell zu einem fensterbasierten Rate-Limiter (die Größe des Fensters kann durch Angabe von `rollingWindowSize: X0000` angepasst werden; CCXT verwendet standardmäßig 60s als Fenstergröße). Ein fensterbasierter Limiter erzwingt eine maximale Anzahl von Anfragen innerhalb eines festen Zeitfensters (zum Beispiel N Anfragen pro X Millisekunden). Sobald das Limit erreicht ist, werden weitere Anfragen verzögert, bis das aktuelle Fenster abläuft.

Sie können den integrierten Rate-Limiter mit der Eigenschaft `.enableRateLimit` ein-/ausschalten, wie folgt:


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


Falls Ihre Aufrufe ein Rate-Limit treffen oder Nonce-Fehler auftreten, wirft die ccxt-Bibliothek eine `InvalidNonce`-Ausnahme oder in manchen Fällen einen der folgenden Typen:

- `DDoSProtection`
- `ExchangeNotAvailable`
- `ExchangeError`
- `InvalidNonce`

Ein späterer Wiederholungsversuch ist in der Regel ausreichend, um damit umzugehen.

### Hinweise zum Rate-Limiter
#### Ein Rate-Limiter pro Börseninstanz

Der Rate-Limiter ist eine Eigenschaft der Börseninstanz, das heißt, jede Börseninstanz hat ihren eigenen Rate-Limiter, der von den anderen Instanzen nichts weiß. In vielen Fällen sollte der Benutzer dieselbe Börseninstanz im gesamten Programm wiederverwenden. Verwenden Sie nicht mehrere Instanzen derselben Börse mit demselben API-Schlüsselpaar von derselben IP-Adresse.

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

Verwenden Sie die Börseninstanz so oft wie möglich wieder, wie unten gezeigt:

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

Da der Rate-Limiter zur Börseninstanz gehört, wird der Rate-Limiter beim Zerstören der Börseninstanz ebenfalls zerstört. Zu den häufigsten Fallstricken beim Rate-Limiting gehört das wiederholte Erstellen und Verwerfen der Börseninstanz. Wenn Sie in Ihrem Programm die Börseninstanz erstellen und zerstören (zum Beispiel innerhalb einer Funktion, die mehrmals aufgerufen wird), setzen Sie den Rate-Limiter effektiv immer wieder zurück, was schließlich die Rate-Limits bricht. Wenn Sie die Börseninstanz jedes Mal neu erstellen, anstatt sie wiederzuverwenden, versucht CCXT jedes Mal, die Märkte zu laden. Daher erzwingen Sie das Laden der Märkte immer wieder, wie im Abschnitt [Märkte laden](#loading-markets) erläutert. Der Missbrauch des Märkte-Endpunkts wird schließlich auch den Rate-Limiter brechen.

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

Brechen Sie diese Regel nicht, es sei denn, Sie verstehen wirklich die innere Funktionsweise des Rate-Limiters und sind zu 100 % sicher, dass Sie wissen, was Sie tun. Um sicher zu bleiben, verwenden Sie die Börseninstanz stets in Ihrer gesamten Funktions- und Methodenkette wieder, wie unten gezeigt:

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

### DDoS-Schutz durch Cloudflare / Incapsula

Einige Börsen sind durch [Cloudflare](https://www.cloudflare.com) oder [Incapsula](https://www.incapsula.com) [DDoS](https://en.wikipedia.org/wiki/Denial-of-service_attack)-geschützt. Ihre IP kann in Zeiten hoher Last vorübergehend gesperrt werden. Manchmal schränken sie sogar ganze Länder und Regionen ein. In diesem Fall geben ihre Server in der Regel eine Seite zurück, die einen HTTP-40x-Fehler anzeigt oder einen AJAX-Test Ihres Browsers / Captcha-Test ausführt und das Neuladen der Seite für mehrere Sekunden verzögert. Anschließend wird Ihr Browser/Fingerabdruck vorübergehend zugelassen und einer Whitelist hinzugefügt oder erhält zur weiteren Verwendung ein HTTP-Cookie.

Die häufigsten Symptome für ein DDoS-Schutzproblem, ein Rate-Limiting-Problem oder ein standortbasiertes Filterproblem:
- `RequestTimeout`-Ausnahmen bei allen Arten von Börsenmethoden
- `ExchangeError` oder `ExchangeNotAvailable` mit HTTP-Fehlercodes 400, 403, 404, 429, 500, 501, 503 usw.
- DNS-Auflösungsprobleme, SSL-Zertifikatsprobleme und Konnektivitätsprobleme auf niedrigerem Level
- Erhalt einer HTML-Vorlagenseite anstelle von JSON von der Börse

Wenn Sie DDoS-Schutzfehler feststellen und eine bestimmte Börse nicht erreichen können, dann:

- verwenden Sie einen [Proxy](#proxy) (dies ist jedoch weniger reaktionsschnell)
- bitten Sie den Börsen-Support, Sie auf eine Whitelist zu setzen
- versuchen Sie eine alternative IP in einer anderen geografischen Region
- betreiben Sie Ihre Software in einem verteilten Netzwerk von Servern
- betreiben Sie Ihre Software in der Nähe der Börse (gleiches Land, gleiche Stadt, gleiches Rechenzentrum, gleiches Server-Rack, gleicher Server)
- ...

## Maximale Anfragekapazität

Bei asynchroner Programmierung erlaubt CCXT die Planung einer unbegrenzten Anzahl von Anfragen. Es gibt jedoch eine Begrenzung der Warteschlangenlänge, die standardmäßig auf maximal 1000 gleichzeitige Anfragen gesetzt ist. Wenn Sie versuchen, mehr als das einzureihen, erhalten Sie den Fehler: "throttle queue is over maxCapacity".

In den meisten Fällen deutet eine so hohe Anzahl ausstehender Aufgaben auf ein suboptimales Design hin, da neue Anfragen verzögert werden, bis die vorhandenen Aufgaben abgeschlossen sind.

Dennoch können Benutzer, die diese Einschränkung umgehen möchten, die Standard-maxCapacity bei der Instanziierung erhöhen, wie unten gezeigt:

```
ex = ccxt.binance({'options': {'maxRequestsQueue': 9999}})
```

# Märkte

- [Währungsstruktur](#currency-structure)
- [Marktstruktur](#market-structure)
- [Präzision und Limits](#precision-and-limits)
- [Märkte laden](#loading-markets)
- [Symbole und Markt-IDs](#symbols-and-market-ids)
- [Markt-Cache-Neuladen erzwingen](#market-cache-force-reload)

Jede Börse ist ein Ort zum Handeln von Wertgegenständen. Die Börsen können unterschiedliche Begriffe verwenden, um diese zu bezeichnen: _„eine Währung"_, _„ein Vermögenswert"_, _„eine Münze"_, _„ein Token"_, _„Aktie"_, _„Rohstoff"_, _„Krypto"_, „Fiat" usw. Ein Ort zum Tauschen eines Vermögenswerts gegen einen anderen wird üblicherweise als _„ein Markt"_, _„ein Symbol"_, _„ein Handelspaar"_, _„ein Kontrakt"_ usw. bezeichnet.

Im Sinne der ccxt-Bibliothek bietet jede Börse mehrere **Märkte** an. Jeder Markt wird durch zwei oder mehr **Währungen** definiert. Die Menge der Märkte unterscheidet sich von Börse zu Börse und eröffnet Möglichkeiten für börsen- und marktübergreifende Arbitrage.

## Währungsstruktur

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

Jede Währung ist ein assoziatives Array (auch als Dictionary bezeichnet) mit den folgenden Schlüsseln:

- `id`. Die Zeichenketten- oder numerische ID der Währung innerhalb der Börse. Währungs-IDs werden intern in Börsen verwendet, um Münzen während des Anfrage-/Antwortvorgangs zu identifizieren.
- `code`. Eine Großbuchstaben-Zeichenkettendarstellung einer bestimmten Währung. Währungscodes werden verwendet, um innerhalb der ccxt-Bibliothek auf Währungen zu verweisen (unten erläutert).
- `name`. Ein menschenlesbarer Name der Währung (kann eine Mischung aus Groß- und Kleinbuchstaben sein).
- `fee`. Der Auszahlungsgebührenwert, wie von der Börse angegeben. In den meisten Fällen bedeutet dies einen pauschalen Festbetrag, der in derselben Währung bezahlt wird. Wenn die Börse dies nicht über öffentliche Endpunkte angibt, kann `fee` `undefined/None/null` oder nicht vorhanden sein.
- `active`. Ein boolescher Wert, der angibt, ob Handel oder Finanzierung (Einzahlung oder Auszahlung) für diese Währung derzeit möglich ist. Mehr dazu hier: [`active`-Status](#active-status).
- `info`. Ein assoziatives Array nicht allgemeiner Markteigenschaften, einschließlich Gebühren, Kurse, Limits und anderer allgemeiner Marktinformationen. Das interne Info-Array ist für jeden bestimmten Markt unterschiedlich; sein Inhalt hängt von der Börse ab.
- `precision`. Präzision, die von Börsen bei Werten akzeptiert wird, wenn auf diese Währung verwiesen wird. Der Wert dieser Eigenschaft hängt von [`exchange.precisionMode`](#precision-mode) ab.
- `limits`. Die Mindest- und Höchstwerte für Beträge (Volumen), Auszahlungen und Einzahlungen.

## Netzwerkstruktur

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

Jedes Netzwerk ist ein assoziatives Array (auch als Dictionary bezeichnet) mit den folgenden Schlüsseln:

- `id`. Die Zeichenketten- oder numerische ID des Netzwerks innerhalb der Börse. Netzwerk-IDs werden intern in Börsen verwendet, um Netzwerke während des Anfrage-/Antwortvorgangs zu identifizieren.
- `network`. Eine Großbuchstaben-Zeichenkettendarstellung eines bestimmten Netzwerks. Netzwerke werden verwendet, um innerhalb der ccxt-Bibliothek auf Netzwerke zu verweisen.
- `name`. Ein menschenlesbarer Name des Netzwerks (kann eine Mischung aus Groß- und Kleinbuchstaben sein).
- `fee`. Der Auszahlungsgebührenwert, wie von der Börse angegeben. In den meisten Fällen bedeutet dies einen pauschalen Festbetrag, der in derselben Währung bezahlt wird. Wenn die Börse dies nicht über öffentliche Endpunkte angibt, kann `fee` `undefined/None/null` oder nicht vorhanden sein.
- `active`. Ein boolescher Wert, der angibt, ob Handel oder Finanzierung (Einzahlung oder Auszahlung) für diese Währung derzeit möglich ist. Mehr dazu hier: [`active`-Status](#active-status).
- `info`. Ein assoziatives Array nicht allgemeiner Markteigenschaften, einschließlich Gebühren, Kurse, Limits und anderer allgemeiner Marktinformationen. Das interne Info-Array ist für jeden bestimmten Markt unterschiedlich; sein Inhalt hängt von der Börse ab.
- `precision`. Präzision, die von Börsen bei Werten akzeptiert wird, wenn auf diese Währung verwiesen wird. Der Wert dieser Eigenschaft hängt von [`exchange.precisionMode`](#precision-mode) ab.
- `limits`. Die Mindest- und Höchstwerte für Beträge (Volumen), Auszahlungen und Einzahlungen.

## Marktstruktur

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

Jeder Markt ist ein assoziatives Array (auch als Dictionary bezeichnet) mit den folgenden Schlüsseln:

- `id`. Die Zeichenketten- oder numerische ID des Marktes oder Handelsinstruments innerhalb der Börse. Markt-IDs werden intern in Börsen verwendet, um Handelspaare während des Anfrage-/Antwortvorgangs zu identifizieren.
- `symbol`. Eine Großbuchstaben-Zeichenkettendarstellung eines bestimmten Handelspaars oder Instruments. Dies wird üblicherweise als `BaseCurrency/QuoteCurrency` mit einem Schrägstrich geschrieben, wie in `BTC/USD`, `LTC/CNY` oder `ETH/EUR` usw. Symbole werden verwendet, um innerhalb der ccxt-Bibliothek auf Märkte zu verweisen (unten erläutert).
- `base`. Ein einheitlicher Großbuchstaben-Zeichenkettencode der Basis-Fiat- oder Kryptowährung. Dies ist der standardisierte Währungscode, der verwendet wird, um in CCXT und in der einheitlichen CCXT-API auf diese Währung oder diesen Token zu verweisen – es ist die Sprache, die CCXT versteht.
- `quote`. Ein einheitlicher Großbuchstaben-Zeichenkettencode der notierten Fiat- oder Kryptowährung.
- `baseId`. Eine börsespezifische ID der Basiswährung für diesen Markt, nicht einheitlich. Kann eine beliebige Zeichenkette sein, buchstäblich. Diese wird unter Verwendung der Sprache, die die Börse versteht, an die Börse übermittelt.
- `quoteId`. Eine börsespezifische ID der Kurswährung, nicht einheitlich.
- `active`. Ein boolescher Wert, der angibt, ob der Handel auf diesem Markt derzeit möglich ist. Mehr dazu hier: [`active`-Status](#active-status).
- `maker`. Float, 0.0015 = 0,15 %. Maker-Gebühren werden bezahlt, wenn Sie der Börse Liquidität bereitstellen, das heißt, Sie *market-machen* eine Order und jemand anderes füllt sie. Maker-Gebühren sind in der Regel niedriger als Taker-Gebühren. Gebühren können negativ sein, was bei Derivatebörsen sehr verbreitet ist. Eine negative Gebühr bedeutet, dass die Börse dem Benutzer für den Handel auf diesem Markt eine Rückvergütung (Belohnung) zahlt (beachten Sie, dass „Taker"- und „Maker"-Gebühren öffentlich verfügbar sind und Ihr VIP-Level/Volumen/usw. nicht berücksichtigen. Verwenden Sie [`fetchTradingFees`](#fee-schedule), um die für Ihr Konto spezifischen Gebühren zu erhalten).
- `taker`. Float, 0.002 = 0,2 %. Taker-Gebühren werden bezahlt, wenn Sie *Liquidität von der Börse nehmen* und die Order eines anderen erfüllen.
- `percentage`. Ein boolescher true/false-Wert, der angibt, ob `taker` und `maker` Multiplikatoren oder feste Pauschalbeträge sind.
- `tierBased`. Ein boolescher true/false-Wert, der angibt, ob die Gebühr von Ihrer Handelsstufe abhängt (in der Regel Ihr gehandeltes Volumen über einen Zeitraum).
- `info`. Ein assoziatives Array nicht allgemeiner Markteigenschaften, einschließlich Gebühren, Kurse, Limits und anderer allgemeiner Marktinformationen. Das interne Info-Array ist für jeden bestimmten Markt unterschiedlich; sein Inhalt hängt von der Börse ab.
- `precision`. Präzision, die von Börsen bei Orderwerten bei der Orderplatzierung für Preis, Menge und Kosten akzeptiert wird. (Der Wert innerhalb dieser Eigenschaft hängt von [`exchange.precisionMode`](#precision-mode) ab.)
- `limits`. Die Mindest- und Höchstwerte für Preise, Mengen (Volumen) und Kosten (wobei Kosten = Preis × Menge).
- `optionType`. Der Typ der Option: `call`-Option steht für eine Option mit dem Recht zum Kauf und `put` für eine Option mit dem Recht zum Verkauf.
- `strike`. Preis, zu dem eine Option gekauft oder verkauft werden kann, wenn sie ausgeübt wird.

## Aktiver Status

Das Flag `active` wird typischerweise in [`currencies`](#currency-structure) und [`markets`](#market-structure) verwendet. Die Börsen können ihm eine leicht unterschiedliche Bedeutung geben. Ist eine Währung inaktiv, liefern die meisten der entsprechenden Ticker, Orderbücher und anderen verwandten Endpunkte leere Antworten, lauter Nullen, keine Daten oder veraltete Informationen. Der Benutzer sollte prüfen, ob die Währung `active` ist, und [die Märkte regelmäßig neu laden](#market-cache-force-reload).

Hinweis: Der Wert `false` für die Eigenschaft `active` garantiert nicht immer, dass alle möglichen Funktionen wie Handel, Abhebung oder Einzahlung an der Börse deaktiviert sind. Ebenso wenig garantiert der Wert `true`, dass all diese Funktionen an der Börse aktiviert sind. Prüfen Sie die Dokumentation der jeweiligen Börsen und den Code in CCXT, um die genaue Bedeutung des Flags `active` für die entsprechende Börse zu erfahren. Dieses Flag wird noch nicht von allen Märkten unterstützt oder implementiert und kann fehlen.

**WARNUNG! Die Informationen über Gebühren sind experimentell, instabil und können unvollständig oder gar nicht verfügbar sein.**

## Präzision und Limits

**Verwechseln Sie `limits` nicht mit `precision`!** Präzision hat nichts mit Mindestlimits zu tun. Eine Präzision von `0.01` bedeutet nicht zwangsläufig, dass das Mindestlimit für einen Markt `0.01` ist. Das Gegenteil gilt ebenso: Ein Mindestlimit von `0.01` bedeutet nicht zwangsläufig, dass die Präzision `0.01` ist.

Beispiele:

1.
```
market['limits']['amount']['min'] == 0.05 &&
market['precision']['amount'] == 0.0001 &&
market['precision']['price'] == 0.01
```

  - Der *Betragswert* sollte >= 0.05 sein:
    ```diff
    + good: 0.05, 0.051, 0.0501, 0.0502, ..., 0.0599, 0.06, 0.0601, ...
    - bad: 0.04, 0.049, 0.0499
    ```
  - *Präzision des Betrags* sollte bis zu 4 Stellen nach dem Dezimalkomma betragen (0.0001):
    ```diff
    + good: 0.05, 0.0501, ..., 0.06, ..., 0.0719, ...
    - bad: 0.05001, 0.05000, 0.06001
    ```
  - *Präzision des Preises* sollte bis zu 2 Stellen nach dem Dezimalkomma betragen (0.01):
    ```diff
    + good: 1.6, 1.61, 123.01, ..., 1234.56, ...
    - bad: 1.601, ..., 123.012, ..., 1234.567
    ```
  - 

2. `(market['precision']['amount'] == -1)`

    Eine negative *Präzision* kann theoretisch nur auftreten, wenn der `precisionMode` der Börse `SIGNIFICANT_DIGIT` oder `DECIMAL_PRECISION` ist. Das bedeutet, dass der Betrag ein ganzzahliges Vielfaches von 10 (zur angegebenen absoluten Potenz) sein muss:
    ```diff
    + good: 10, 50, ..., 110, ... 1230, ..., 1000000, ..., 1234560, ...
    - bad: 9.5, ... 10.1, ..., 11, ... 200.71, ...
    ```
    Im Falle von `-2` wären die akzeptablen Werte Vielfache von `100` (z. B. 100, 200, ...) und so weiter.


#### Präzisionsmodus

Unterstützte Präzisionsmodi in `exchange['precisionMode']` sind:

- `TICK_SIZE` – Fast alle Börsen verwenden diesen Präzisionsmodus. In diesem Modus bezeichnen die Zahlen in `market_or_currency['precision']` die minimalen Präzisionsbrüche (Fließkommazahlen) zum Runden oder Abschneiden.
- `SIGNIFICANT_DIGITS` – Zählt nur von Null verschiedene Stellen; einige Börsen (`bitfinex` und vielleicht einige andere) implementieren diesen Modus zum Zählen von Dezimalstellen. In diesem Präzisionsmodus bezeichnen die Zahlen in `market_or_currency['precision']` den N-ten Platz der letzten signifikanten (von Null verschiedenen) Dezimalstelle nach dem Dezimalkomma.
- `DECIMAL_PLACES` (**VERALTET, CCXT verwendet diesen Modus nirgendwo mehr**) – Zählt alle Stellen. In diesem Präzisionsmodus bezeichnen die Zahlen in `market_or_currency['precision']` die Anzahl der Dezimalstellen nach dem Dezimalkomma für weiteres Runden oder Abschneiden.

### Hinweise zu Präzision und Limits

Der Benutzer muss alle Limits und Präzisionsanforderungen einhalten! Die Werte der Order müssen die folgenden Bedingungen erfüllen:

- Order `amount` >= `limits['amount']['min']`
- Order `amount` <= `limits['amount']['max']`
- Order `price` >= `limits['price']['min']`
- Order `price` <= `limits['price']['max']`
- Order `cost` (`amount * price`) >= `limits['cost']['min']`
- Order `cost` (`amount * price`) <= `limits['cost']['max']`
- Präzision von `amount` muss <= `precision['amount']` sein
- Präzision von `price` muss <= `precision['price']` sein

Die obigen Werte können bei einigen Börsen fehlen, die keine Informationen zu Limits über ihre API bereitstellen oder dies noch nicht implementiert haben.

### Methoden zum Formatieren von Dezimalzahlen

Jede Börse hat ihre eigenen Modi zum Runden, Zählen und Auffüllen.

Unterstützte Rundungsmodi sind:

- `ROUND` – Rundet die letzten Dezimalstellen auf die Präzision
- `TRUNCATE` – Schneidet die Stellen nach einer bestimmten Präzision ab

Der Dezimal-Präzisionszählmodus ist in der Eigenschaft `exchange.precisionMode` verfügbar.

#### Auffüllmodus

Unterstützte Auffüllmodi sind:

- `NO_PADDING` – Standard für die meisten Fälle
- `PAD_WITH_ZERO` – Fügt Nullzeichen bis zur Präzision an

#### Formatieren auf Präzision

In den meisten Fällen muss sich der Benutzer nicht um die Präzisionsformatierung kümmern, da CCXT dies für den Benutzer übernimmt, wenn Orders aufgegeben oder Auszahlungsanfragen gesendet werden, sofern der Benutzer die unter [Präzision und Limits](#precision-and-limits) beschriebenen Regeln befolgt. In einigen Fällen können jedoch Details zur Präzisionsformatierung wichtig sein, sodass die folgenden Methoden im Anwendungscode nützlich sein können.

Die Basisklasse der Börse enthält die Methode `decimalToPrecision`, um die Formatierung von Werten auf die erforderliche Dezimalpräzision mit Unterstützung verschiedener Rundungs-, Zähl- und Auffüllmodi zu erleichtern.


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


Beispiele zur Verwendung von `decimalToPrecision` zum Formatieren von Zeichenketten und Fließkommazahlen finden Sie in den folgenden Dateien:

- Typescript: https://github.com/ccxt/ccxt/blob/master/ts/src/test/base/functions/test.number.ts
- JavaScript: https://github.com/ccxt/ccxt/blob/master/js/src/test/base/functions/test.number.js
- Python: https://github.com/ccxt/ccxt/blob/master/python/ccxt/test/base/test_number.py
- PHP: https://github.com/ccxt/ccxt/blob/master/php/test/base/test_number.php

**Python WARNUNG! Die Methode `decimal_to_precision` ist anfällig für `getcontext().prec`!**

Zur Vereinfachung für Benutzer implementiert die CCXT-Basisbörsenklasse auch die folgenden Methoden:


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


Jede Börse hat ihre eigenen Präzisionseinstellungen; die obigen Methoden helfen dabei, diese Werte gemäß den börsenspezifischen Präzisionsregeln zu formatieren, auf eine Art und Weise, die portabel und unabhängig von der zugrundeliegenden Börse ist. Damit dies möglich ist, müssen Märkte und Währungen vor dem Formatieren von Werten geladen sein.

**Stellen Sie sicher, dass Sie [die Märkte mit `exchange.loadMarkets()`](#loading-markets) laden, bevor Sie diese Methoden aufrufen!**

Zum Beispiel:


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


Weitere praktische Beispiele, die das Verhalten von `exchange.precisionMode` beschreiben:

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

## Märkte laden

In den meisten Fällen müssen Sie die Liste der Märkte und Handelssymbole für eine bestimmte Börse laden, bevor Sie auf andere API-Methoden zugreifen. Wenn Sie vergessen, Märkte zu laden, erledigt die ccxt-Bibliothek dies automatisch beim ersten Aufruf der vereinheitlichten API. Sie sendet dann zwei HTTP-Anfragen sequenziell – zunächst für die Märkte und dann eine zweite für andere Daten. Aus diesem Grund dauert Ihr erster Aufruf einer vereinheitlichten CCXT-API-Methode wie fetchTicker, fetchBalance usw. länger als die nachfolgenden Aufrufe, da dabei mehr Arbeit anfällt, nämlich das Laden der Marktinformationen von der Börsen-API. Weitere Details finden Sie unter [Hinweise zum Ratenbegrenzer](#notes-on-rate-limiter).

Um Märkte im Voraus manuell zu laden, rufen Sie die Methode `loadMarkets ()` / `load_markets ()` auf einer Börseninstanz auf. Sie gibt ein assoziatives Array von Märkten zurück, das nach Handelssymbol indiziert ist. Wenn Sie mehr Kontrolle über die Ausführung Ihrer Logik wünschen, wird empfohlen, Märkte vorab manuell zu laden.


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


Neben den Marktinformationen lädt der Aufruf `loadMarkets()` auch die Währungen von der Börse und speichert die Informationen in den Eigenschaften `.markets` bzw. `.currencies` zwischen.

Der Benutzer kann den Cache auch umgehen und vereinheitlichte Methoden zum direkten Abrufen dieser Informationen von den Börsenendpunkten aufrufen: `fetchMarkets()` und `fetchCurrencies()`. Die Verwendung dieser Methoden wird Endbenutzern jedoch nicht empfohlen. Der empfohlene Weg zum Vorladen von Märkten ist der Aufruf der vereinheitlichten Methode `loadMarkets()`. Neue Börsenintegrationen müssen diese Methoden jedoch implementieren, wenn die zugrundeliegende Börse über entsprechende API-Endpunkte verfügt.

### Märkte zwischen Börseninstanzen teilen

Um die Speichernutzung zu optimieren und redundante API-Aufrufe zu reduzieren, können Sie Marktdaten zwischen mehreren Instanzen derselben Börse teilen. Dies ist besonders nützlich, wenn mehrere Börseninstanzen erstellt werden oder wenn bereits geladene Marktdaten wiederverwendet werden sollen.


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


**Vorteile des Marktdaten-Teilens:**
- **Speichereffizienz**: Mehrere Börseninstanzen teilen dieselben Marktobjekte im Speicher
- **Leistung**: Eliminiert redundante API-Aufrufe für Marktdaten
- **Ressourcenschonung**: Reduziert Netzwerkanfragen und API-Ratenlimitnutzung
- **Persistenz**: Marktdaten bleiben verfügbar, auch wenn einzelne Börseninstanzen zerstört werden

**Alternative einfache Zuweisung:**

Wenn Sie eine direkte Eigenschaftszuweisung bevorzugen, können Sie Märkte auch durch direkte Zuweisung der Eigenschaft `markets` teilen:

```javascript
// Simple direct assignment (ensure both exchanges are of same type)
exchange2.markets = exchange1.markets;
exchange2.symbols = exchange1.symbols;  // Also copy symbols for full functionality
```

Die Verwendung der Methode `setMarketsFromExchange()` wird jedoch empfohlen, da sie:
- Überprüft, dass beide Börsen vom gleichen Typ sind
- Sicherstellt, dass alle zugehörigen Marktdaten ordnungsgemäß kopiert werden
- Bessere Fehlerbehandlung bietet

**Wichtige Hinweise:**
- Teilen Sie Märkte nur zwischen Instanzen desselben Börsentyps
- Das Teilen von Märkten ist am effektivsten, wenn beide Instanzen dieselben API-Zugangsdaten und Konfigurationen verwenden
- Die geteilten Marktobjekte bleiben im Speicher, solange mindestens eine Referenz existiert
- Sowohl die Methode `setMarketsFromExchange()` als auch die direkte Zuweisung erstellen geteilte Referenzen, keine Kopien

## Symbole und Markt-IDs

Ein Währungscode ist ein Code aus drei bis fünf Buchstaben, wie `BTC`, `ETH`, `USD`, `GBP`, `CNY`, `JPY`, `DOGE`, `RUB`, `ZEC`, `XRP`, `XMR` usw. Einige Börsen haben exotische Währungen mit längeren Codes.

Ein Symbol ist üblicherweise ein Zeichenkettenliteral in Großbuchstaben, das ein Paar gehandelter Währungen mit einem Schrägstrich dazwischen benennt. Die erste Währung vor dem Schrägstrich wird üblicherweise *Basiswährung* genannt, die nach dem Schrägstrich *Kurswährung*. Beispiele für ein Symbol sind: `BTC/USD`, `DOGE/LTC`, `ETH/EUR`, `DASH/XRP`, `BTC/CNY`, `ZEC/XMR`, `ETH/JPY`.

Markt-IDs werden während des REST-Anfrage-Antwort-Prozesses verwendet, um Handelspaare innerhalb von Börsen zu referenzieren. Der Satz der Markt-IDs ist pro Börse eindeutig und kann nicht börsenübergreifend verwendet werden. Zum Beispiel kann das BTC/USD-Paar/der BTC/USD-Markt auf verschiedenen bekannten Börsen unterschiedliche IDs haben, wie `btcusd`, `BTCUSD`, `XBTUSD`, `btc/usd`, `42` (numerische ID), `BTC/USD`, `Btc/Usd`, `tBTCUSD`, `XXBTZUSD`. Sie müssen sich keine Markt-IDs merken oder verwenden; sie dienen internen HTTP-Anfrage-Antwort-Zwecken innerhalb von Börsenimplementierungen.

Die ccxt-Bibliothek abstrahiert ungewöhnliche Markt-IDs zu Symbolen, die in einem einheitlichen Format standardisiert sind. Symbole sind nicht dasselbe wie Markt-IDs. Jeder Markt wird durch ein entsprechendes Symbol referenziert. Symbole sind börsenübergreifend einheitlich, was sie für Arbitrage und viele andere Zwecke geeignet macht.

Manchmal bemerkt der Benutzer möglicherweise ein Symbol wie `'XBTM18'` oder `'.XRPUSDM20180101'` oder andere *„exotische/seltene Symbole"*. Das Symbol **muss** keinen Schrägstrich enthalten und kein Währungspaar sein. Die Zeichenkette im Symbol hängt wirklich vom Typ des Marktes ab (ob es sich um einen Spotmarkt oder einen Terminmarkt, einen Darkpool-Markt oder einen abgelaufenen Markt handelt usw.). Es wird dringend davon abgeraten, die Symbolzeichenkette zu parsen; man sollte sich nicht auf das Symbolformat verlassen, sondern stattdessen Markteigenschaften verwenden.

Marktstrukturen sind nach Symbolen und IDs indiziert. Die Basis-Exchange-Klasse verfügt außerdem über eingebaute Methoden für den Zugriff auf Märkte anhand von Symbolen. Die meisten API-Methoden erfordern, dass ein Symbol als erstes Argument übergeben wird. Oft ist es erforderlich, ein Symbol anzugeben, wenn aktuelle Preise abgefragt, Aufträge erteilt usw. werden.

Meistens arbeiten Benutzer mit Marktsymbolen. Beim Zugriff auf nicht vorhandene Schlüssel in diesen Dicts wird eine Standard-Userland-Exception ausgelöst.

### Methoden für Märkte und Währungen


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


### Einheitlichkeit der Benennung

Es gibt eine gewisse Begriffsambiguität über verschiedene Exchanges hinweg, die bei neuen Händlern zu Verwirrung führen kann. Einige Exchanges bezeichnen Märkte als *Paare*, während andere Exchanges Symbole als *Produkte* bezeichnen. Im Sinne der ccxt-Bibliothek enthält jede Exchange einen oder mehrere Handelsmärkte. Jeder Markt hat eine ID und ein Symbol. Die meisten Symbole sind Paare aus Basiswährung und Kurswährung.

``` → Markets → Symbols → Currencies```

Historisch gesehen wurden verschiedene symbolische Namen verwendet, um dieselben Handelspaare zu bezeichnen. Einige Kryptowährungen (wie Dash) haben ihren Namen während ihrer laufenden Lebensdauer sogar mehr als einmal geändert. Zur Konsistenz über Exchanges hinweg führt die ccxt-Bibliothek die folgenden bekannten Substitutionen für Symbole und Währungen durch:

- `XBT → BTC`: `XBT` ist neuer, aber `BTC` ist unter Exchanges verbreiteter und klingt mehr nach Bitcoin ([mehr lesen](https://www.google.ru/search?q=xbt+vs+btc)).
- `BCC → BCH`: Die Bitcoin-Cash-Fork wird häufig mit zwei verschiedenen symbolischen Namen bezeichnet: `BCC` und `BCH`. Der Name `BCC` ist für Bitcoin Cash mehrdeutig, er wird mit BitConnect verwechselt. Die ccxt-Bibliothek konvertiert `BCC` in `BCH`, wo es angemessen ist (einige Exchanges und Aggregatoren verwechseln sie).
- `DRK → DASH`: `DASH` war Darkcoin und wurde dann zu Dash ([mehr lesen](https://minergate.com/blog/dashcoin-and-dash/)).
- `BCHABC → BCH`: Am 15. November 2018 gabelte sich Bitcoin Cash zum zweiten Mal, sodass es nun `BCH` (für BCH ABC) und `BSV` (für BCH SV) gibt.
- `BCHSV → BSV`: Dies ist eine gängige Substitutionszuordnung für die Bitcoin Cash SV-Fork (einige Exchanges nennen sie `BSV`, andere `BCHSV`, wir verwenden ersteres).
- `DSH → DASH`: Verwechseln Sie Symbole und Währungen nicht. `DSH` (Dashcoin) ist nicht dasselbe wie `DASH` (Dash). Einige Exchanges haben `DASH` inkonsistent als `DSH` bezeichnet, die ccxt-Bibliothek nimmt auch dafür eine Korrektur vor (`DSH → DASH`), jedoch nur bei bestimmten Exchanges, die diese beiden Währungen verwechseln, während die meisten Exchanges beide korrekt haben. Denken Sie daran: `DASH/BTC` ist nicht dasselbe wie `DSH/BTC`.
- `XRB` → `NANO`: `NANO` ist der neuere Code für RaiBlocks, daher ersetzt die CCXT Unified API das ältere `XRB` durch `NANO`, wo nötig. https://hackernoon.com/nano-rebrand-announcement-9101528a7b76
- `USD` → `USDT`: Einige Exchanges, wie Bitfinex, HitBTC und einige andere, bezeichnen die Währung in ihren Listings als `USD`, aber diese Märkte handeln tatsächlich `USDT`. Die Verwirrung kann durch eine 3-Buchstaben-Beschränkung bei Symbolnamen entstehen oder hat andere Gründe. In Fällen, in denen die gehandelte Währung tatsächlich `USDT` und nicht `USD` ist, führt die CCXT-Bibliothek die Konvertierung `USD` → `USDT` durch. Beachten Sie jedoch, dass einige Exchanges sowohl `USD`- als auch `USDT`-Symbole haben; Kraken beispielsweise hat ein `USDT/USD`-Handelspaar.

#### Hinweise zur Einheitlichkeit der Benennung

Jede Exchange hat ein assoziatives Array von Substitutionen für symbolische Kryptowährungs-Codes in der `exchange.commonCurrencies`-Eigenschaft, wie z. B.:
```
'commonCurrencies' : {
    'XBT': 'BTC',
    'OPTIMISM': 'OP',
    // ... etc
}
```
wobei der Schlüssel den tatsächlichen Namen repräsentiert, mit dem die Exchange-Engine auf diese Münze verweist, und der Wert repräsentiert, wie Sie über ccxt darauf verweisen möchten.

Manchmal bemerkt der Benutzer exotische Symbolnamen mit gemischter Groß-/Kleinschreibung und Leerzeichen im Code. Die Logik hinter diesen Namen wird durch die Regeln zur Lösung von Konflikten bei der Benennung und Währungscodierung erklärt, wenn eine oder mehrere Währungen denselben symbolischen Code bei verschiedenen Exchanges haben:

- Zunächst sammeln wir alle verfügbaren Informationen von den Exchanges selbst über die betreffenden Währungscodes. Sie haben normalerweise irgendwo in ihrer API oder ihren Dokumentationen, Wissensdatenbanken oder anderswo auf ihren Websites eine Beschreibung ihrer Münzlisting.
- Wenn wir jede einzelne Kryptowährung hinter dem Währungscode identifiziert haben, suchen wir sie auf [CoinMarketCap](https://coinmarketcap.com).
- Die Währung mit der größten Marktkapitalisierung gewinnt den Währungscode und behält ihn. Zum Beispiel steht HOT oft für entweder `Holo` oder `Hydro Protocol`. In diesem Fall behält `Holo` den Code `HOT`, und `Hydro Protocol` erhält seinen Namen als Code, wörtlich `Hydro Protocol`. Es kann also Handelspaare mit Symbolen wie `HOT/USD` (für `Holo`) und `Hydro Protocol/USD` geben – das sind zwei verschiedene Märkte.
- Ist die Marktkapitalisierung einer bestimmten Münze unbekannt oder reicht sie nicht aus, um den Gewinner zu bestimmen, berücksichtigen wir auch Handelsvolumina und andere Faktoren.
- Wenn der Gewinner feststeht, werden alle anderen konkurrierenden Währungen über `.commonCurrencies` bei den betreffenden Exchanges ordnungsgemäß umbenannt und ersetzt. **Beachten Sie, dass dies vor dem Aufruf von '.loadMarkets()' definiert werden muss!**
- Leider ist dies ein laufender Prozess, da täglich neue Währungen gelistet und von Zeit zu Zeit neue Exchanges hinzugefügt werden, sodass dies im Allgemeinen ein nie endender Prozess der Selbstkorrektur in einer sich schnell ändernden Umgebung ist, praktisch im *„Live-Modus"*. Wir sind dankbar für alle gemeldeten Konflikte und Unstimmigkeiten, die Sie möglicherweise finden.

#### Fragen zur Einheitlichkeit der Benennung

_Ist es möglich, dass sich Symbole ändern?_

Kurz gesagt: Ja, manchmal, aber selten. Symbolische Zuordnungen können geändert werden, wenn dies absolut erforderlich und nicht zu vermeiden ist. Alle bisherigen symbolischen Änderungen standen jedoch im Zusammenhang mit der Lösung von Konflikten oder Forks. Bisher gab es in CCXT keinen Präzedenzfall, dass die Marktkapitalisierung einer Münze eine andere Münze mit demselben symbolischen Code überholt hat.

_Können wir darauf vertrauen, dass dieselbe Krypto immer mit demselben Symbol aufgelistet wird?_

Mehr oder weniger ) Zunächst ist diese Bibliothek ein laufendes Projekt, das versucht, sich an die sich ständig verändernde Realität anzupassen, daher kann es Konflikte geben, die wir in Zukunft durch Änderung einiger Zuordnungen beheben werden. Letztendlich besagt die Lizenz „keine Garantien, Nutzung auf eigenes Risiko". Wir ändern symbolische Zuordnungen jedoch nicht willkürlich überall, weil wir die Konsequenzen verstehen und wir uns selbst auf die Bibliothek verlassen möchten und es überhaupt nicht mögen, die Rückwärtskompatibilität zu brechen.

Falls es vorkommt, dass ein Symbol eines wichtigen Tokens geforkt wird oder geändert werden muss, liegt die Kontrolle weiterhin in den Händen der Benutzer. Die `exchange.commonCurrencies`-Eigenschaft kann [bei der Initialisierung oder später überschrieben werden](#overriding-exchange-properties-upon-instantiation), genau wie jede andere Exchange-Eigenschaft. Bei einem bedeutenden Token posten wir normalerweise Anweisungen, wie das alte Verhalten durch Hinzufügen einiger Zeilen zu den Konstruktorparametern beibehalten werden kann.

#### Konsistenz von Basis- und Kurswährungen

Es hängt von der verwendeten Exchange ab, aber bei einigen gibt es ein umgekehrtes (inkonsistentes) Paar von `base` und `quote`. Sie haben Basis und Quote tatsächlich vertauscht (gewechselte/umgekehrte Seiten). In diesem Fall werden Sie einen Unterschied zwischen den geparsten `base`- und `quote`-Währungswerten und den ungeparsten `info` in der Marktunterstruktur feststellen.

Für diese Exchanges nimmt ccxt eine Korrektur vor, indem es die Seiten von Basis- und Kurswährungen beim Parsen von Exchange-Antworten wechselt und normalisiert. Diese Logik ist finanziell und terminologisch korrekt. Wenn Sie weniger Verwirrung möchten, merken Sie sich folgende Regel: **Die Basis steht immer vor dem Schrägstrich, die Quote steht immer nach dem Schrägstrich, bei jedem Symbol und jedem Markt**.

```text
base currency ↓
             BTC / USDT
             ETH / BTC
            DASH / ETH
                    ↑ quote currency
```

#### Konventionen zur Benennung von Kontrakten

Wir laden derzeit Spot-Märkte mit dem einheitlichen `BASE/QUOTE`-Symbolschema in die `.markets`-Zuordnung, indiziert nach Symbol. Dies würde einen Namenskonflikt für Futures und andere Derivate verursachen, die dasselbe Symbol wie ihre Spot-Markt-Entsprechungen haben. Um beide Markttypen in `.markets` unterzubringen, verlangen wir, dass die Symbole zwischen „Future"- und „Spot"-Märkten unterschiedlich sind, ebenso wie die Symbole zwischen „linearen" und „inversen" Kontrakten unterschiedlich sein müssen.

**Bitte beachten Sie diese Ankündigung: [Unified contract naming conventions](https://github.com/ccxt/ccxt/issues/10931)**

CCXT unterstützt die folgenden Arten von Derivatkontrakten:

- `future` – für ablaufende Futures-Kontrakte mit einem Liefer-/Abrechnungsdatum [](https://en.wikipedia.org/wiki/Futures_contract)
- `swap` – für unbefristete Swap-Futures ohne Lieferdatum [](https://en.wikipedia.org/wiki/Perpetual_futures)
- `option` – für Optionskontrakte (https://en.wikipedia.org/wiki/Option_contract)

##### Future

Ein Future-Marktsymbol besteht aus der Basiswährung, der Kurswährung, der Abrechnungswährung und einer beliebigen Kennung. Meistens ist die Kennung das Abrechnungsdatum des Future-Kontrakts im Format `JJMMTT`:

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

##### Perpetual Swap (Perpetual Future)

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

##### Option

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

### Einheitliche Netzwerke

| Netzwerk | CCXT-Code  |
|---------------------------------------|--------------|
| Bitcoin                               | BTC          |
| Ethereum                              | ETH (für Ethereum) / ERC20 (für Token)          |
| Ripple                                | XRP          |
| Litecoin                              | LTC          |
| Dogecoin                              | DOGE         |
| Stellar                               | XLM          |
| Tron                                  | TRX (für TRX) / TRC20 (für Token)         |
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

## Markt-Cache-Neuladen erzwingen

`loadMarkets () / load_markets ()` ist ebenfalls eine nicht-reine Methode mit dem Nebeneffekt, das Array der Märkte auf der Exchange-Instanz zu speichern. Sie müssen sie nur einmal pro Exchange aufrufen. Alle nachfolgenden Aufrufe derselben Methode geben das lokal gespeicherte (gecachte) Array der Märkte zurück.

Wenn die Märkte einer Exchange geladen sind, können Sie jederzeit über die `markets`-Eigenschaft auf Marktinformationen zugreifen. Diese Eigenschaft enthält ein assoziatives Array von Märkten, indiziert nach Symbol. Wenn Sie die Liste der Märkte nach dem Laden neu laden müssen, übergeben Sie das Flag reload = true erneut an dieselbe Methode.


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


# Implizite API

- [API-Methoden / Endpunkte](#api-methods--endpoints)
- [Implizite API-Methoden](#implicit-api-methods)
- [Öffentliche/Private API](#publicprivate-api)
- [Synchrone vs. asynchrone Aufrufe](#synchronous-vs-asynchronous-calls)
- [Parameter an API-Methoden übergeben](#passing-parameters-to-api-methods)

## API-Methoden / Endpunkte

Jede Exchange bietet eine Reihe von API-Methoden an. Jede Methode der API wird als *Endpunkt* bezeichnet. Endpunkte sind HTTP-URLs zum Abfragen verschiedener Arten von Informationen. Alle Endpunkte geben JSON als Antwort auf Client-Anfragen zurück.

Üblicherweise gibt es einen Endpunkt zum Abrufen einer Liste von Märkten von einer Exchange, einen Endpunkt zum Abrufen eines Orderbuchs für einen bestimmten Markt, einen Endpunkt zum Abrufen des Handelsverlaufs, Endpunkte zum Aufgeben und Stornieren von Orders, für Ein- und Auszahlungen usw. Im Grunde hat jede Art von Aktion, die Sie auf einer bestimmten Exchange durchführen können, eine separate Endpunkt-URL, die von der API angeboten wird.

Da sich der Satz der Methoden von Exchange zu Exchange unterscheidet, implementiert die ccxt-Bibliothek Folgendes:
- eine öffentliche und private API für alle möglichen URLs und Methoden
- eine einheitliche API, die eine Teilmenge gemeinsamer Methoden unterstützt

Die Endpunkt-URLs sind in der `api`-Eigenschaft für jede Exchange vordefiniert. Sie müssen diese nicht überschreiben, es sei denn, Sie implementieren eine neue Exchange-API (zumindest sollten Sie wissen, was Sie tun).

Die meisten exchange-spezifischen API-Methoden sind implizit, d. h. sie sind nirgendwo im Code explizit definiert. Die Bibliothek implementiert einen deklarativen Ansatz zur Definition impliziter (nicht-einheitlicher) API-Methoden von Exchanges.

## Implizite API-Methoden

Jede Methode der API hat in der Regel ihren eigenen Endpunkt. Die Bibliothek definiert alle Endpunkte für jede bestimmte Exchange in der `.api`-Eigenschaft. Bei der Konstruktion einer Exchange wird innerhalb von `defineRestApi()/define_rest_api()` für jeden Endpunkt aus der Liste der `.api`-Endpunkte eine implizite *Magic*-Methode (auch *partielle Funktion* oder *Closure* genannt) auf der Exchange-Instanz erstellt. Dies wird universell für alle Exchanges durchgeführt. Jede generierte Methode ist sowohl in der `camelCase`- als auch in der `under_score`-Schreibweise zugänglich.

Die Endpunktdefinition ist eine **vollständige Liste ALLER API-URLs**, die von einer Exchange bereitgestellt werden. Diese Liste wird bei der Instanziierung der Exchange in aufrufbare Methoden umgewandelt. Jede URL in der API-Endpunktliste erhält eine entsprechende aufrufbare Methode. Dies geschieht automatisch für alle Exchanges, daher unterstützt die ccxt-Bibliothek **alle möglichen URLs**, die von Krypto-Exchanges angeboten werden.

Jede implizite Methode erhält einen eindeutigen Namen, der aus der `.api`-Definition konstruiert wird. Zum Beispiel wird ein privater HTTPS PUT `https://api.exchange.com/order/{id}/cancel`-Endpunkt eine entsprechende Exchange-Methode mit dem Namen `.privatePutOrderIdCancel()`/`.private_put_order_id_cancel()` haben. Ein öffentlicher HTTPS GET `https://api.exchange.com/market/ticker/{pair}`-Endpunkt würde zur entsprechenden Methode `.publicGetTickerPair()`/`.public_get_ticker_pair()` führen, und so weiter.

Eine implizite Methode nimmt ein Dictionary von Parametern entgegen, sendet die Anfrage an die Exchange und gibt ein exchange-spezifisches JSON-Ergebnis von der API **so wie es ist, ungeparst** zurück. Um einen Parameter zu übergeben, fügen Sie ihn dem Dictionary explizit unter einem Schlüssel hinzu, der dem Namen des Parameters entspricht. Für die obigen Beispiele würde dies wie `.privatePutOrderIdCancel ({ id: '41987a2b-...' })` und `.publicGetTickerPair ({ pair: 'BTC/USD' })` aussehen.

Die empfohlene Vorgehensweise beim Arbeiten mit Exchanges ist nicht die Verwendung exchange-spezifischer impliziter Methoden, sondern die Verwendung der einheitlichen ccxt-Methoden. Die exchange-spezifischen Methoden sollten als Fallback verwendet werden, wenn eine entsprechende einheitliche Methode (noch) nicht verfügbar ist.

Um eine Liste aller verfügbaren Methoden mit einer Exchange-Instanz zu erhalten, einschließlich impliziter Methoden und einheitlicher Methoden, können Sie einfach Folgendes tun:

```text
console.log (new ccxt.kraken ())   // JavaScript
print(dir(ccxt.kraken()))           # Python
var_dump (new \ccxt\kraken ()); // PHP
```

## Öffentliche/Private API

API-URLs werden oft in zwei Gruppen von Methoden unterteilt, die als *öffentliche API* für Marktdaten und *private API* für Handel und Kontozugriff bezeichnet werden. Diese Gruppen von API-Methoden werden in der Regel mit dem Wort 'public' oder 'private' als Präfix versehen.

Eine öffentliche API wird für den Zugriff auf Marktdaten verwendet und erfordert keinerlei Authentifizierung. Die meisten Exchanges stellen Marktdaten offen für alle bereit (im Rahmen ihrer Rate-Limits). Mit der ccxt-Bibliothek kann jeder sofort auf Marktdaten zugreifen, ohne sich bei Exchanges registrieren oder Kontoschlüssel und Passwörter einrichten zu müssen.

Öffentliche APIs umfassen Folgendes:

- Instrumente/Handelspaare
- Kursfeeds (Wechselkurse)
- Orderbücher (L1, L2, L3...)
- Handelsverlauf (geschlossene Orders, Transaktionen, Ausführungen)
- Ticker (Spot / 24h-Preis)
- OHLCV-Serien für Charts
- andere öffentliche Endpunkte

Die private API wird hauptsächlich für den Handel und den Zugriff auf kontospezifische private Daten verwendet und erfordert daher Authentifizierung. Sie müssen die privaten API-Schlüssel von den Exchanges beziehen. Dies bedeutet häufig die Registrierung auf einer Exchange-Website und das Erstellen von API-Schlüsseln für Ihr Konto. Die meisten Exchanges verlangen persönliche Informationen oder eine Identifizierung. Einige Exchanges erlauben den Handel erst nach Abschluss der KYC-Verifizierung.
Private APIs ermöglichen Folgendes:

- persönliche Kontoinformationen verwalten
- Kontostände abfragen
- durch Market-Orders und Limit-Orders handeln
- Einzahlungsadressen erstellen und Konten aufladen
- Auszahlung von Fiat- und Krypto-Guthaben beantragen
- persönliche offene / geschlossene Orders abfragen
- Positionen im Margin-/Hebelhandel abfragen
- Hauptbuchverlauf abrufen
- Guthaben zwischen Konten übertragen
- Merchant-Services nutzen

Einige Exchanges bieten dieselbe Logik unter verschiedenen Namen an. Zum Beispiel wird eine öffentliche API auch oft als *market data*, *basic*, *market*, *mapi*, *api*, *price* usw. bezeichnet. All diese Bezeichnungen meinen eine Reihe von Methoden für den Zugriff auf öffentlich verfügbare Daten. Eine private API wird auch oft als *trading*, *trade*, *tapi*, *exchange*, *account* usw. bezeichnet.

Einige wenige Exchanges stellen auch eine Merchant-API bereit, mit der Sie Rechnungen erstellen und Krypto- und Fiat-Zahlungen von Ihren Kunden akzeptieren können. Diese Art von API wird oft als *merchant*, *wallet*, *payment*, *ecapi* (für E-Commerce) bezeichnet.

Um eine Liste aller verfügbaren Methoden mit einer Exchange-Instanz zu erhalten, können Sie einfach Folgendes tun:

```text
console.log (new ccxt.kraken ())   // JavaScript
print(dir(ccxt.kraken()))           # Python
var_dump (new \ccxt\kraken ()); // PHP
```

**nur für Kontrakte und nur für Margin**

- Methoden in dieser Dokumentation, die als **nur für Kontrakte** oder **nur für Margin** dokumentiert sind, sind ausschließlich für den Kontrakthandel bzw. den Margin-Handel vorgesehen. Sie funktionieren möglicherweise auch beim Handel auf anderen Markttypen, geben aber höchstwahrscheinlich irrelevante Informationen zurück.

## Synchrone vs. asynchrone Aufrufe


#### **Javascript**

In der JavaScript-Version von CCXT sind alle Methoden asynchron und geben [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) zurück, die mit einem dekodierten JSON-Objekt aufgelöst werden. In CCXT verwenden wir die moderne *async/await*-Syntax für die Arbeit mit Promises. Wenn Sie mit dieser Syntax nicht vertraut sind, können Sie [hier](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) mehr darüber lesen.

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

Die ccxt-Bibliothek unterstützt den asynchronen Gleichzeitigkeitsmodus in Python 3.5+ mit async/await-Syntax. Die asynchrone Python-Version verwendet reines [asyncio](https://docs.python.org/3/library/asyncio.html) mit [aiohttp](http://aiohttp.readthedocs.io). Im asynchronen Modus verfügen Sie über dieselben Eigenschaften und Methoden, aber die meisten Methoden sind mit einem async-Schlüsselwort dekoriert. Wenn Sie den asynchronen Modus verwenden möchten, sollten Sie gegen das `ccxt.async_support`-Unterpaket verlinken, wie im folgenden Beispiel:

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

CCXT unterstützt PHP-Versionen 8+. Die Bibliothek verfügt sowohl über eine synchrone als auch eine asynchrone Version. Um die synchrone Version zu verwenden, nutzen Sie den `\ccxt`-Namespace (d. h. `new ccxt\binance()`) und um die asynchrone Version zu verwenden, nutzen Sie den `\ccxt\async`-Namespace (d. h. `new ccxt\async\binance()`). Die asynchrone Version verwendet im Hintergrund die [ReactPHP](https://reactphp.org/)-Bibliothek. Im asynchronen Modus verfügen Sie über dieselben Eigenschaften und Methoden, aber jede Netzwerk-API-Methode sollte mit dem `\React\Async\await`-Schlüsselwort dekoriert werden und Ihr Skript sollte in einem ReactPHP-Wrapper sein:
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

Weitere Beispiele finden Sie im Verzeichnis `examples/php`; suchen Sie nach Dateinamen, die das Wort `async` enthalten. Stellen Sie außerdem sicher, dass Sie die erforderlichen Abhängigkeiten mit `composer require recoil/recoil clue/buzz-react react/event-loop recoil/react react/http` installiert haben. Schließlich bietet [dieser Artikel](https://sergeyzhuk.me/2018/10/26/from-promise-to-coroutines/) eine gute Einführung in die hier verwendeten Methoden. Obwohl die syntaktische Änderung einfach ist (d. h. nur die Verwendung eines `yield`-Schlüsselworts vor relevanten Methoden), hat Gleichzeitigkeit erhebliche Auswirkungen auf das Gesamtdesign Ihres Codes.

#### **Go**

In Go ist jede Netzwerkmethode synchron und gibt ein `(value, error)`-Paar zurück — es gibt keine asynchrone Variante. Überprüfen Sie immer den zurückgegebenen `error`, bevor Sie den Wert verwenden:

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

In C# ist jede Netzwerkmethode asynchron und gibt ein `Task<T>` zurück, das Sie mit `await` erwarten. Die einheitlichen Methoden verwenden natives `async`/`await`:

```csharp
// C#

var exchange = new Kraken();
var ticker = await exchange.FetchTicker("ETH/BTC");
Console.WriteLine(exchange.id + " " + ticker.last);
```

#### **Java**

In Java hat jede Exchange ihre eigene typisierte Unterklasse. Jede typisierte Methode wird sowohl mit einer blockierenden synchronen Überladung als auch mit einer nicht-blockierenden `CompletableFuture`-zurückgebenden asynchronen Überladung geliefert — symmetrisch für REST `fetch*` / `fetch*Async` und WS `watch*` / `watch*Async`:

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

Dasselbe synchrone/asynchrone Paar gilt für die Pro-Klassen (WebSocket) — `watchTicker` blockiert für ein Update; `watchTickerAsync` gibt ein `CompletableFuture<Ticker>` zurück, das beim nächsten Update abgeschlossen wird:

```java
import io.github.ccxt.exchanges.pro.Binance;

var ws = new Binance();
ws.loadMarkets(false);

// WS — synchronous (blocks for one update)
Ticker tick = ws.watchTicker("BTC/USDT");

// WS — asynchronous (composable with allOf, anyOf, thenApply, ...)
CompletableFuture<Ticker> stream = ws.watchTickerAsync("BTC/USDT", null);
```


### Zurückgegebene JSON-Objekte

Alle öffentlichen und privaten API-Methoden geben rohe dekodierte JSON-Objekte in der Antwort der Exchanges zurück, so wie sie sind, unverändert. Die einheitliche API gibt JSON-dekodierte Objekte in einem gemeinsamen Format und einheitlich strukturiert über alle Exchanges hinweg zurück.

## Parameter an API-Methoden übergeben

Der Satz aller möglichen API-Endpunkte unterscheidet sich von Exchange zu Exchange. Die meisten Methoden akzeptieren ein einzelnes assoziatives Array (oder ein Python-Dict) von Schlüssel-Wert-Parametern. Die Parameter werden wie folgt übergeben:

```text
bitso.publicGetTicker ({ book: 'eth_mxn' })                 // JavaScript
ccxt.zaif().public_get_ticker_pair ({ 'pair': 'btc_jpy' })  # Python
$luno->public_get_ticker (array ('pair' => 'XBTIDR'));      // PHP
```

Die einheitlichen Methoden von Exchanges können verschiedene `params` erwarten und akzeptieren, die ihre Funktionalität beeinflussen, wie:

```python
params = {'type':'margin', 'isIsolated': 'TRUE'}  # --------------┑
# params will go as the last argument to the unified method       |
#                                                                 v
binance.create_order('BTC/USDT', 'limit', 'buy', amount, price, params)
```

Eine Exchange akzeptiert keine Parameter von einer anderen Exchange — sie sind nicht austauschbar. Die Liste der akzeptierten Parameter wird von jeder spezifischen Exchange definiert.

Um herauszufinden, welche Parameter an eine einheitliche Methode übergeben werden können:

- entweder öffnen Sie die [exchange-spezifische Implementierungsdatei](https://github.com/ccxt/ccxt/tree/master/js) und suchen nach der gewünschten Funktion (d. h. `createOrder`), um die Details der `params`-Verwendung zu überprüfen und herauszufinden
- oder gehen Sie zur API-Dokumentation der Exchange und lesen Sie die Liste der Parameter für Ihre spezifische Funktion oder Ihren Endpunkt (d. h. `order`)

Eine vollständige Liste der akzeptierten Methodenparameter für jede Börse finden Sie in der [API-Dokumentation](#exchanges).

### Namenskonventionen für API-Methoden

Ein Börsenmethodenname ist eine zusammengesetzte Zeichenkette, bestehend aus Typ (öffentlich oder privat), HTTP-Methode (GET, POST, PUT, DELETE) und dem Endpunkt-URL-Pfad, wie in den folgenden Beispielen:

| Methodenname                 | Basis-API-URL                  | Endpunkt-URL                   |
|------------------------------|--------------------------------|--------------------------------|
| publicGetIdOrderbook         | https://bitbay.net/API/Public  | {id}/orderbook                 |
| publicGetPairs               | https://bitlish.com/api        | pairs                          |
| publicGetJsonMarketTicker    | https://www.bitmarket.net      | json/{market}/ticker           |
| privateGetUserMargin         | https://bitmex.com             | user/margin                    |
| privatePostTrade             | https://btc-x.is/api           | trade                          |
| tapiCancelOrder              | https://yobit.net              | tapi/CancelOrder               |
| ...                          | ...                            | ...                            |

Die CCXT-Bibliothek unterstützt sowohl die CamelCase-Schreibweise (bevorzugt in JavaScript) als auch die Unterstrich-Schreibweise (bevorzugt in Python und PHP), daher können alle Methoden in beiden Schreibweisen oder Codierungsstilen in jeder Sprache aufgerufen werden. Beide Schreibweisen funktionieren in JavaScript, Python und PHP:

```text
exchange.methodName ()  // camelcase pseudocode
exchange.method_name()  // underscore pseudocode
```

Um eine Liste aller verfügbaren Methoden einer Börseninstanz zu erhalten, können Sie einfach Folgendes tun:

```text
console.log (new ccxt.kraken ())   // JavaScript
print(dir(ccxt.hitbtc()))           # Python
var_dump (new \ccxt\okcoin ()); // PHP
```

# Unified API

- [Unified-API-Parameter überschreiben](#overriding-unified-api-params)
- [Paginierung](#pagination)
- [Automatische Paginierung](#automatic-pagination)

Die vereinheitlichte CCXT-API ist eine Teilmenge von Methoden, die allen Börsen gemeinsam sind. Sie enthält derzeit die folgenden Methoden:

- `fetchMarkets ()`: Ruft eine Liste aller verfügbaren Märkte von einer Börse ab und gibt ein Array von Market-Objekten zurück, wie in der [Marktstruktur](#market-structure) definiert (mit Eigenschaften wie `symbol`, `base`, `quote` usw.). Einige Börsen haben keine Möglichkeit, eine Marktliste über ihre Online-API zu beziehen. Für diese ist die Marktliste fest einprogrammiert.
- `fetchCurrencies ()`: Ruft alle verfügbaren Währungen von einer Börse ab und gibt ein assoziatives Wörterbuch der Währungen zurück (Objekte mit Eigenschaften wie `code`, `name` usw.). Einige Börsen haben keine Möglichkeit, Währungen über ihre Online-API zu beziehen. Für diese werden die Währungen aus Marktpaaren extrahiert oder fest einprogrammiert.
- `loadMarkets ([reload])`: Gibt die Liste der Märkte als ein nach Symbol indiziertes Objekt zurück und speichert es mit der Börseninstanz zwischen. Gibt gecachte Märkte zurück, wenn diese bereits geladen wurden, sofern nicht das Flag `reload = true` gesetzt ist.
- `fetchOrderBook (symbol, limit = undefined, params = {})`: Ruft das L2/L3-Orderbuch für ein bestimmtes Markt-Handelssymbol ab.
- `fetchStatus (params = {})`: Gibt Informationen zum Börsenstatus zurück, entweder aus den im Börseobjekt fest einprogrammierten Daten oder über die API, sofern verfügbar.
- `fetchL2OrderBook (symbol, limit = undefined, params)`: Orderbuch der Stufe 2 (preisaggregiert) für ein bestimmtes Symbol.
- `fetchTrades (symbol, since, limit, params)`: Ruft aktuelle Trades für ein bestimmtes Handelssymbol ab.
- `fetchTicker (symbol)`: Ruft die neuesten Ticker-Daten anhand des Handelssymbols ab.
- `fetchBalance ()`: Ruft den Kontostand ab.
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

## Unified-API-Parameter überschreiben

Beachten Sie, dass die meisten Methoden der Unified API ein optionales `params`-Argument akzeptieren. Es handelt sich um ein assoziatives Array (ein Wörterbuch, standardmäßig leer), das die Parameter enthält, die Sie überschreiben möchten. Der Inhalt von `params` ist börsenspezifisch; konsultieren Sie die API-Dokumentation der Börsen für unterstützte Felder und Werte. Verwenden Sie das `params`-Wörterbuch, wenn Sie eine benutzerdefinierte Einstellung oder einen optionalen Parameter an Ihre Unified-Abfrage übergeben müssen.


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


## Paginierung

Die meisten vereinheitlichten Methoden geben entweder ein einzelnes Objekt oder ein einfaches Array (eine Liste) von Objekten zurück (Trades, Orders, Transaktionen usw.). Jedoch werden sehr wenige Börsen (wenn überhaupt) alle Orders, alle Trades, alle OHLCV-Kerzen oder alle Transaktionen auf einmal zurückgeben. Meistens `limit`ieren ihre APIs die Ausgabe auf eine bestimmte Anzahl der neuesten Objekte. **SIE KÖNNEN NICHT ALLE OBJEKTE VOM BEGINN DER ZEIT BIS ZUM GEGENWÄRTIGEN MOMENT IN NUR EINEM AUFRUF ABRUFEN**. Praktisch gesehen werden sehr wenige Börsen das tolerieren oder erlauben.

Um historische Orders oder Trades abzurufen, muss der Benutzer die Daten in Abschnitten oder „Seiten" von Objekten durchlaufen. Paginierung bedeutet oft *„portionsweises Abrufen von Daten nacheinander"* in einer Schleife.

In den meisten Fällen sind Benutzer **verpflichtet, mindestens eine Art von Paginierung zu verwenden**, um konsistent die erwarteten Ergebnisse zu erhalten. Wenn der Benutzer keine Paginierung anwendet, geben die meisten Methoden den Standardwert der Börse zurück, der entweder vom Beginn der Historie an starten oder eine Teilmenge der neuesten Objekte sein kann. Das Standardverhalten (ohne Paginierung) ist börsenspezifisch! Die Paginierungsmittel werden insbesondere bei folgenden Methoden verwendet:

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

Bei Methoden, die Listen von Objekten zurückgeben, können Börsen einen oder mehrere Paginierungstypen anbieten. CCXT vereinheitlicht standardmäßig die **datumsbasierte Paginierung**, mit Zeitstempeln **in Millisekunden** in der gesamten Bibliothek.


### Automatische Paginierung

*Warnung: Dies ist eine experimentelle Funktion und kann in einigen Fällen unerwartete/falsche Ergebnisse liefern.*

Vor Kurzem hat CCXT eine Möglichkeit eingeführt, durch mehrere Ergebnisse automatisch zu paginieren, indem einfach das Flag `paginate` innerhalb von `params` angegeben wird, was diese Arbeit aus dem Anwendungsbereich des Benutzers verlagert. Die meisten führenden Börsen unterstützen dies, und weitere werden in Zukunft hinzugefügt, aber der einfachste Weg, es zu überprüfen, besteht darin, in der Methodendokumentation nach dem Parameter *pagination* zu suchen. Wie immer gibt es Ausnahmen, und einige Endpunkte bieten möglicherweise keine Möglichkeit zur Paginierung über einen Zeitstempel oder einen Cursor, und in diesen Fällen kann CCXT nichts dagegen tun.


Derzeit gibt es drei verschiedene Paginierungsarten:
- **dynamisch/zeitbasiert**: Verwendet die Parameter `until` und `since`, um durch dynamische Ergebnisse wie (Trades, Orders, Transaktionen usw.) zu paginieren. Da wir a priori nicht wissen, wie viele Einträge zum Abrufen verfügbar sind, wird eine Anfrage nach der anderen gestellt, bis wir das Ende der Daten oder die maximale Anzahl von Paginierungsaufrufen erreichen (konfigurierbar über eine Option).
- **deterministisch**: Wenn wir die Grenzen jeder Seite vorab berechnen können, werden die Anfragen gleichzeitig für maximale Leistung ausgeführt. Dies gilt für OHLCV, Finanzierungsraten und Open Interest und berücksichtigt auch die Option `paginationCalls`.
- **cursorbasiert**: Wenn die Börse einen Cursor in der Antwort bereitstellt, extrahieren wir den Cursor und führen die nachfolgende Anfrage durch, bis das Ende der Daten erreicht oder die maximale Anzahl von Paginierungsaufrufen erreicht ist.

Der Benutzer kann die verwendete Paginierungsmethode nicht auswählen; sie hängt von der jeweiligen Implementierung ab und berücksichtigt die Funktionen der Börsen-API.

#### Paginierungsparameter

Wir können keine unbegrenzte Anzahl von Anfragen ausführen, und einige davon könnten aus verschiedenen Gründen einen Fehler auslösen, daher haben wir einige Optionen, die es dem Benutzer ermöglichen, diese Variablen und andere Paginierungsspezifika zu steuern.

*Alle folgenden Optionen sollten innerhalb von `params` angegeben werden; Sie können die Beispiele unten prüfen.*

- **paginate**: (**boolean**) Gibt an, dass der Benutzer durch verschiedene Seiten paginieren möchte, um mehr Daten zu erhalten. Standard ist *false*.
- **paginationCalls**: (**integer**) Ermöglicht dem Benutzer, die maximale Anzahl von Anfragen zur Paginierung der Daten zu steuern. Aufgrund der Ratenbegrenzungen sollte dieser Wert nicht zu hoch sein. Standard ist 10.
- **maxRetries**: (**integer**) Wie oft soll der Paginierungsmechanismus bei einem Fehler einen erneuten Versuch unternehmen. Standard ist 3.
- **paginationDirection**: (**string**) Gilt nur für die dynamische Paginierung und kann entweder *forward* (Paginierung von einem Zeitpunkt in der Vergangenheit vorwärts) oder *backward* (vom neuesten Zeitpunkt rückwärts paginieren) sein. Wenn *forward* ausgewählt ist, muss auch ein *since*-Parameter angegeben werden. Standard ist *backward*.
- **maxEntriesPerRequest**: (**integer**): Die maximale Anzahl von Einträgen pro Anfrage, damit wir die pro Aufruf abgerufenen Daten maximieren können. Sie variiert von Endpunkt zu Endpunkt, und CCXT füllt diesen Wert für Sie aus, aber Sie können ihn bei Bedarf überschreiben.

#### Beispiele

```python

trades = await binance.fetch_trades("BTC/USDT", params = {"paginate": True}) # dynamic/time-based

ohlcv = await binance.fetch_ohlcv("BTC/USDT", params = {"paginate": True, "paginationCalls": 5}) # deterministic-pagination will perform 5 requests

trades = await binance.fetch_trades("BTC/USDT", since = 1664812416000, params = {"paginate": True, "paginationDirection": "forward"}) # dynamic/time-based pagination starting from 1664812416000

ledger = await bybit.fetch_ledger(params = {"paginate": True}) # bybit returns a cursor so the pagination will be cursor-based

funding_rates = await binance.fetch_funding_rate_history("BTC/USDT:USDT", params = {"paginate": True, "maxEntriesPerRequest": 50}) # customizes the number of entries per request

```


### Arbeiten mit Datumsangaben und Zeitstempeln

Alle vereinheitlichten Zeitstempel in der CCXT-Bibliothek sind ganze Zahlen **in Millisekunden**, sofern nicht ausdrücklich anders angegeben.

Nachfolgend finden Sie die Methoden zum Arbeiten mit UTC-Datumsangaben und Zeitstempeln sowie zur Konvertierung zwischen ihnen:

```javascript
exchange.parse8601 ('2018-01-01T00:00:00Z') == 1514764800000 // integer in milliseconds, Z = UTC
exchange.iso8601 (1514764800000) == '2018-01-01T00:00:00Z'   // from milliseconds to iso8601 string
exchange.seconds ()      // integer UTC timestamp in seconds
exchange.milliseconds () // integer UTC timestamp in milliseconds
```

### Datumsbasierte Paginierung

Dies ist die Art der Paginierung, die derzeit in der gesamten CCXT Unified API verwendet wird. Der Benutzer gibt einen `since`-Zeitstempel **in Millisekunden** (!) und eine Zahl zur `limit`ierung der Ergebnisse an. Um die interessierenden Objekte Seite für Seite zu durchlaufen, führt der Benutzer Folgendes aus (unten ist Pseudocode; je nach Börse kann es erforderlich sein, einige börsenspezifische Parameter zu überschreiben):

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


### ID-basierte Paginierung

Der Benutzer gibt eine `from_id` des Objekts an, ab dem die Abfrage weiterhin Ergebnisse zurückgeben soll, sowie eine Zahl für `limit`. Dies ist bei einigen Börsen der Standard, jedoch ist dieser Typ (noch) nicht vereinheitlicht. Um Objekte anhand ihrer IDs zu paginieren, würde der Benutzer Folgendes ausführen:


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


### Seitennummern-basierte (Cursor-)Paginierung

Der Benutzer gibt eine Seitennummer oder einen *anfänglichen „Cursor"-Wert* an. Die Börse gibt eine Seite mit Ergebnissen und den *nächsten „Cursor"-Wert* zurück, um fortzufahren. Die meisten Börsen, die diese Art der Paginierung implementieren, geben den nächsten Cursor entweder innerhalb der Antwort selbst oder in den HTTP-Antwortheadern zurück.

Hier finden Sie eine Beispielimplementierung: https://github.com/ccxt/ccxt/blob/master/examples/py/coinbasepro-fetch-my-trades-pagination.py

Bei jeder Iteration der Schleife muss der Benutzer den nächsten Cursor nehmen und ihn in die überschriebenen Parameter für die nächste Abfrage einfügen (in der folgenden Iteration):


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


# Öffentliche API

- [Orderbuch](#order-book)
- [Preis-Ticker](#price-tickers)
- [OHLCV-Kerzencharts](#ohlcv-candlestick-charts)
- [Öffentliche Trades](#public-trades)
- [Börsenzeit](#exchange-time)
- [Börsenstatus](#exchange-status)
- [Leihzinsen](#borrow-rates)
- [Leihzinsverlauf](#borrow-rate-history)
- [Leverage-Stufen](#leverage-tiers)
- [Finanzierungszinssatz](#funding-rate)
- [Finanzierungszinsverlauf](#funding-rate-history)
- [Open-Interest-Verlauf](#open-interest-history)
- [Volatilitätsverlauf](#volatility-history)
- [Basiswerte](#underlying-assets)
- [Liquidationen](#liquidations)
- [Griechen](#greeks)
- [OptionChain](#option-chain)
- [Auto De Leverage](#auto-de-leverage)

## Orderbuch

Börsen stellen Informationen zu offenen Orders mit Geld- (Kauf-) und Briefpreisen (Verkauf-), Volumina und weiteren Daten bereit. In der Regel gibt es einen separaten Endpunkt zum Abfragen des aktuellen Zustands (Stack-Frame) des *Orderbuchs* für einen bestimmten Markt. Ein Orderbuch wird auch häufig als *Markttiefe* bezeichnet. Die Orderbuch-Informationen werden im Prozess der Handelsentscheidungsfindung verwendet.

Um Daten zu Orderbüchern zu erhalten, können Sie Folgendes verwenden:

- `fetchOrderBook ()` // für das Orderbuch eines einzelnen Markts
- `fetchOrderBooks ( symbols )` // für Orderbücher mehrerer Märkte
- `fetchOrderBooks ()` // für die Orderbücher aller Märkte

```javascript
async fetchOrderBook (symbol, limit = undefined, params = {})
```

Parameter

- **symbol** (String) *erforderlich* Vereinheitlichtes CCXT-Symbol (z. B. `"BTC/USDT"`)
- **limit** (Integer) Die Anzahl der Orders, die im Orderbuch zurückgegeben werden sollen (z. B. `10`)
- **params** (Dictionary) Zusätzliche Parameter, die spezifisch für den API-Endpunkt der Börse sind (z. B. `{"endTime": 1645807945000}`)

Rückgabewert

- Eine [Orderbuch-Struktur](#order-book-structure)

```javascript
async fetchOrderBooks (symbols = undefined, limit = undefined, params = {})
```

Parameter

- **symbols** (\[String\]) Vereinheitlichte CCXT-Symbole (z. B. `["BTC/USDT", "ETH/USDT"]`)
- **limit** (Integer) Die Anzahl der Orders, die im Orderbuch zurückgegeben werden sollen (z. B. `10`)
- **params** (Dictionary) Zusätzliche Parameter, die spezifisch für den API-Endpunkt der Börse sind (z. B. `{"endTime": 1645807945000}`)

Rückgabewert

- Ein Dictionary mit [Orderbuch-Strukturen](#order-book-structure), indiziert nach Marktsymbolen

### fetchOrderBook-Beispiele


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


### Orderbuch-Struktur

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

**Der Zeitstempel und das Datum können fehlen (`undefined/None/null`), wenn die betreffende Börse in der API-Antwort keinen entsprechenden Wert bereitstellt.**

Preise und Mengen sind Gleitkommazahlen. Das Geldkurs-Array ist nach Preis in absteigender Reihenfolge sortiert. Der beste (höchste) Geldkurs ist das erste Element und der schlechteste (niedrigste) Geldkurs ist das letzte Element. Das Briefkurs-Array ist nach Preis in aufsteigender Reihenfolge sortiert. Der beste (niedrigste) Briefkurs ist das erste Element und der schlechteste (höchste) Briefkurs ist das letzte Element. Geld- und Briefkurs-Arrays können leer sein, wenn keine entsprechenden Orders im Orderbuch einer Börse vorhanden sind.

Börsen können den Stapel der Orders in verschiedenen Detailstufen für die Analyse zurückgeben. Entweder ist er vollständig detailliert und enthält jede einzelne Order, oder er ist aggregiert und hat etwas weniger Detail, wobei Orders nach Preis und Volumen gruppiert und zusammengeführt werden. Mehr Detail erfordert mehr Datenverkehr und Bandbreite und ist im Allgemeinen langsamer, bietet aber den Vorteil höherer Genauigkeit. Weniger Detail ist normalerweise schneller, kann aber in einigen sehr spezifischen Fällen unzureichend sein.

### Hinweise zur Orderbuch-Struktur

- Der `orderbook['timestamp']` ist der Zeitpunkt, zu dem die Börse diese Orderbuch-Antwort generiert hat (bevor sie diese an Sie zurückgesendet hat). Dieser kann fehlen (`undefined/None/null`), wie im Handbuch dokumentiert – nicht alle Börsen stellen dort einen Zeitstempel bereit. Wenn er definiert ist, handelt es sich um den UTC-Zeitstempel **in Millisekunden** seit dem 1. Januar 1970 00:00:00.
- Einige Börsen können Orders im Orderbuch nach Order-IDs indizieren; in diesem Fall kann die Order-ID als drittes Element der Geld- und Briefkurse zurückgegeben werden: `[ price, amount, id ]`. Dies ist oft bei L3-Orderbüchern ohne Aggregation der Fall. Die Order-`id`, wenn sie im Orderbuch angezeigt wird, bezieht sich auf das Orderbuch und entspricht nicht notwendigerweise der tatsächlichen Order-ID aus der Datenbank der Börse, wie sie vom Eigentümer oder von anderen gesehen wird. Die Order-ID ist eine `id` der Zeile im Orderbuch, aber nicht notwendigerweise die echte `id` der Order (obwohl diese je nach betreffender Börse auch übereinstimmen können).
- In einigen Fällen können Börsen L2-aggregierte Orderbücher mit Order-Anzahlen für jede aggregierte Ebene bereitstellen; in diesem Fall kann die Order-Anzahl als drittes Element der Geld- und Briefkurse zurückgegeben werden: `[ price, amount, count ]`. Der `count` gibt an, wie viele Orders auf jeder Preisebene bei Geld- und Briefkursen aggregiert sind.
- Außerdem können einige Börsen den Order-Zeitstempel als drittes Element der Geld- und Briefkurse zurückgeben: `[ price, amount, timestamp ]`. Der `timestamp` gibt an, wann die Order im Orderbuch platziert wurde.

### Markttiefe

Einige Börsen akzeptieren ein Dictionary mit zusätzlichen Parametern für die Funktion `fetchOrderBook () / fetch_order_book ()`. **Alle zusätzlichen `params` sind börsenspezifisch (nicht vereinheitlicht)**. Sie müssen die Dokumentation der Börse konsultieren, wenn Sie einen bestimmten Parameter überschreiben möchten, z. B. die Tiefe des Orderbuchs. Sie können eine begrenzte Anzahl zurückgegebener Orders oder ein gewünschtes Aggregationsniveau (auch bekannt als *Markttiefe*) erhalten, indem Sie ein `limit`-Argument und börsenspezifische zusätzliche `params` wie folgt angeben:


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


Die Detailstufen oder Aggregationsstufen des Orderbuchs sind oft nummerisch gekennzeichnet wie L1, L2, L3...

- **L1**: Weniger Detail zum schnellen Abrufen sehr grundlegender Informationen, nämlich nur des Marktpreises. Es sieht aus wie nur eine Order im Orderbuch.
- **L2**: Die gebräuchlichste Aggregationsstufe, bei der Order-Volumina nach Preis gruppiert werden. Wenn zwei Orders denselben Preis haben, erscheinen sie als eine einzige Order mit einem Volumen gleich ihrer Gesamtsumme. Dies ist höchstwahrscheinlich die Aggregationsstufe, die Sie für die Mehrheit der Zwecke benötigen.
- **L3**: Die detaillierteste Stufe ohne Aggregation, bei der jede Order von anderen Orders getrennt ist. Diese Detailstufe enthält naturgemäß Duplikate in der Ausgabe. Wenn also zwei Orders gleiche Preise haben, werden sie **nicht** zusammengeführt und es liegt am Matching-Engine der Börse, über ihre Priorität im Stapel zu entscheiden. Sie benötigen für erfolgreiches Trading keine L3-Details. Tatsächlich benötigen Sie diese höchstwahrscheinlich überhaupt nicht. Daher unterstützen einige Börsen es nicht und geben immer aggregierte Orderbücher zurück.

Wenn Sie ein L2-Orderbuch erhalten möchten, unabhängig davon, was die Börse zurückgibt, verwenden Sie dafür die vereinheitlichte Methode `fetchL2OrderBook(symbol, limit, params)` oder `fetch_l2_order_book(symbol, limit, params)`.

Das `limit`-Argument garantiert nicht, dass die Anzahl der Geld- und Briefkurse immer gleich `limit` ist. Es legt die Obergrenze oder das Maximum fest, sodass es zu einem bestimmten Zeitpunkt möglicherweise weniger als `limit` Geld- oder Briefkurse gibt. Dies ist der Fall, wenn die Börse nicht genügend Orders im Orderbuch hat. Wenn jedoch die zugrunde liegende Börsen-API überhaupt keinen `limit`-Parameter für den Orderbuch-Endpunkt unterstützt, wird das `limit`-Argument ignoriert. CCXT kürzt `bids` und `asks` nicht, wenn die Börse mehr zurückgibt als Sie angefordert haben.

### Marktpreis

Um den aktuell besten Preis zu erhalten (Marktpreis abfragen) und den Geld-Brief-Spread zu berechnen, nehmen Sie die ersten Elemente aus Geld- und Briefkurs, wie folgt:


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


## Preis-Ticker

Ein Preis-Ticker enthält Statistiken für einen bestimmten Markt/ein bestimmtes Symbol für einen bestimmten Zeitraum in der jüngsten Vergangenheit, üblicherweise die letzten 24 Stunden. Die Methoden zum Abrufen von Tickern sind unten beschrieben.

### Ein einzelner Ticker für ein Symbol

```javascript
// one ticker
fetchTicker (symbol, params = {})

// example
fetchTicker ('ETH/BTC')
fetchTicker ('BTC/USDT')
```

### Mehrere Ticker für alle oder viele Symbole

```javascript
// multiple tickers
fetchTickers (symbols = undefined, params = {})  // for all tickers at once

// for example
fetchTickers () // all symbols
fetchTickers ([ 'ETH/BTC', 'BTC/USDT' ]) // an array of specific symbols
```

Überprüfen Sie die Eigenschaften `exchange.has['fetchTicker']` und `exchange.has['fetchTickers']` der Börseninstanz, um festzustellen, ob die betreffende Börse diese Methoden unterstützt.

**Bitte beachten Sie, dass der Aufruf von `fetchTickers ()` ohne ein Symbol in der Regel streng ratenbegrenzt ist – eine Börse kann Sie sperren, wenn Sie diesen Endpunkt zu häufig abfragen.**

### Ticker-Struktur

Ein Ticker ist eine statistische Berechnung mit den Informationen, die über die vergangenen 24 Stunden für einen bestimmten Markt berechnet wurden.

Die Struktur eines Tickers ist wie folgt:

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

#### Hinweise zur Ticker-Struktur

- Alle Felder im Ticker repräsentieren die vergangenen 24 Stunden vor dem `timestamp`.
- Das `bidVolume` ist das Volumen (die Menge) des aktuell besten Geldkurses im Orderbuch.
- Das `askVolume` ist das Volumen (die Menge) des aktuell besten Briefkurses im Orderbuch.
- Das `baseVolume` ist die Menge der gehandelten Basiswährung (gekauft oder verkauft) in den letzten 24 Stunden.
- Das `quoteVolume` ist die Menge der gehandelten Kurswährung (gekauft oder verkauft) in den letzten 24 Stunden.

**Alle Preise in der Ticker-Struktur sind in Kurswährung angegeben. Einige Felder in einer zurückgegebenen Ticker-Struktur können undefined/None/null sein.**

```text
base currency ↓
             BTC / USDT
             ETH / BTC
            DASH / ETH
                    ↑ quote currency
```

Zeitstempel und Datum sind beide Koordinierte Weltzeit (UTC) in Millisekunden.

- `ticker['timestamp']` ist der Zeitpunkt, zu dem die Börse diese Antwort generiert hat (bevor sie diese an Sie zurückgesendet hat). Er kann fehlen (`undefined/None/null`), wie im Handbuch dokumentiert – nicht alle Börsen stellen dort einen Zeitstempel bereit. Wenn er definiert ist, handelt es sich um einen UTC-Zeitstempel **in Millisekunden** seit dem 1. Januar 1970 00:00:00.
- `exchange.last_response_headers['Date']` ist der Datums-Zeit-String der zuletzt empfangenen HTTP-Antwort (aus HTTP-Headern). Der 'Date'-Parser sollte die dort angegebene Zeitzone berücksichtigen. Die Genauigkeit der Datums-Zeit beträgt 1 Sekunde, 1000 Millisekunden. Dieses Datum sollte vom Börsenserver beim Ursprung der Nachricht gemäß folgenden Standards gesetzt werden:
    - https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.18
    - https://tools.ietf.org/html/rfc1123#section-5.2.14
    - https://tools.ietf.org/html/rfc822#section-5

Obwohl einige Börsen die besten Geld-/Briefkurse des Orderbuchs in ihre Ticker einmischen (und einige Börsen sogar die besten Geld-/Briefkursvolumina bereitstellen), sollten Sie einen Ticker nicht als Ersatz für `fetchOrderBook` betrachten. Der Hauptzweck eines Tickers besteht darin, statistische Daten bereitzustellen; behandeln Sie ihn daher als „live 24h OHLCV". Es ist bekannt, dass Börsen häufige `fetchTicker`-Anfragen durch strengere Ratenbegrenzungen für diese Abfragen entmutigen. Wenn Sie eine vereinheitlichte Möglichkeit zum Zugriff auf Geld- und Briefkurse benötigen, sollten Sie stattdessen die Familie `fetchL[123]OrderBook` verwenden.

Um historische Preise und Volumina abzurufen, verwenden Sie die vereinheitlichte Methode [`fetchOHLCV`](#ohlcv-candlestick-charts), sofern verfügbar. Um historische Mark-, Index- und Premium-Index-Preise abzurufen, fügen Sie eines der Felder `'price': 'mark'`, `'price': 'index'` oder `'price': 'premiumIndex'` den [params-overrides](#overriding-unified-api-params) von `fetchOHLCV` hinzu. Es gibt auch die Hilfsmethoden `fetchMarkPriceOHLCV`, `fetchIndexPriceOHLCV` und `fetchPremiumIndexOHLCV`, die die historischen Preise und Volumina für Mark, Index und premiumIndex abrufen.

Methoden zum Abrufen von Tickers:

- `fetchTicker (symbol[, params = {}])`, symbol ist erforderlich, params sind optional
- `fetchTickers ([symbols = undefined[, params = {}]])`, beide Argumente optional

### Einzeln nach Symbol

Um die einzelnen Ticker-Daten von einer Börse für ein bestimmtes Handelspaar oder ein spezifisches Symbol abzurufen, rufen Sie `fetchTicker (symbol)` auf:


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


### Alle auf einmal

Einige Börsen (nicht alle) unterstützen auch das gleichzeitige Abrufen aller Tickers. Siehe [deren Dokumentation](#exchanges) für Details. Sie können alle Tickers mit einem einzigen Aufruf wie folgt abrufen:


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


Das Abrufen aller Tickers erfordert mehr Datenverkehr als das Abrufen eines einzelnen Tickers. Beachten Sie außerdem, dass einige Börsen bei nachfolgenden Abrufen aller Tickers höhere Rate-Limits auferlegen (siehe deren Dokumentation zu den entsprechenden Endpunkten für Details). **Die Kosten des `fetchTickers()`-Aufrufs in Bezug auf das Rate-Limit sind oft höher als der Durchschnitt.** Wenn Sie nur einen Ticker benötigen, ist das Abrufen nach einem bestimmten Symbol ebenfalls schneller. Sie sollten alle Tickers wahrscheinlich nur abrufen, wenn Sie wirklich alle benötigen, und höchstwahrscheinlich möchten Sie fetchTickers nicht häufiger als etwa einmal pro Minute aufrufen.

Außerdem können einige Börsen zusätzliche Anforderungen an den `fetchTickers()`-Aufruf stellen; manchmal können Sie die Tickers nicht für alle Symbole abrufen, da die API-Beschränkungen der jeweiligen Börse dies verhindern. Einige Börsen akzeptieren eine Liste von Symbolen in den HTTP-URL-Query-Parametern; da die URL-Länge jedoch begrenzt ist und Börsen in Extremfällen Tausende von Märkten haben können, würde eine Liste aller ihrer Symbole schlicht nicht in die URL passen, sodass es sich um eine begrenzte Teilmenge ihrer Symbole handeln muss. Manchmal gibt es andere Gründe für die Anforderung einer Symbolliste, und es kann eine Begrenzung der Anzahl von Symbolen geben, die Sie auf einmal abrufen können. Was auch immer die Einschränkung ist – bitte geben Sie der Börse die Schuld. Um die interessierenden Symbole an die Börse zu übergeben, können Sie eine Liste von Zeichenketten als erstes Argument an fetchTickers übergeben:


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


Beachten Sie, dass die Symbolliste in den meisten Fällen nicht erforderlich ist, aber Sie müssen zusätzliche Logik hinzufügen, wenn Sie alle möglichen Einschränkungen auf Seiten der Börsen behandeln möchten.

Wie bei den meisten anderen Methoden der Unified CCXT API ist das letzte Argument von fetchTickers das `params`-Argument zum Überschreiben von Anfrageparametern, die an die Börse gesendet werden.

Die Struktur des zurückgegebenen Werts ist wie folgt:

```javascript
{
    'info':    { ... }, // the original JSON response from the exchange as is
    'BTC/USD': { ... }, // a single ticker for BTC/USD
    'ETH/BTC': { ... }, // a ticker for ETH/BTC
    ...
}
```

Eine allgemeine Lösung zum Abrufen aller Tickers von allen Börsen (auch von denen, die keinen entsprechenden API-Endpunkt haben) ist in Arbeit; dieser Abschnitt wird bald aktualisiert.

```text
UNDER CONSTRUCTION
```

## OHLCV Candlestick Charts

Die meisten Börsen haben Endpunkte zum Abrufen von OHLCV-Daten, aber einige nicht. Die boolesche (true/false) Eigenschaft der Börse namens `has['fetchOHLCV']` gibt an, ob die Börse Candlestick-Datenserien unterstützt oder nicht.

Um OHLCV-Kerzen/Balken von einer Börse abzurufen, hat ccxt die Methode `fetchOHLCV`, die folgendermaßen deklariert ist:

```javascript
fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {})
```

Sie können die vereinheitlichte Methode `fetchOHLCV` / `fetch_ohlcv` aufrufen, um die Liste der OHLCV-Kerzen für ein bestimmtes Symbol wie folgt abzurufen:


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


Um die Liste der verfügbaren Zeitrahmen für Ihre Börse zu erhalten, beachten Sie die Eigenschaft `timeframes`. Diese ist nur gefüllt, wenn `has['fetchOHLCV']` ebenfalls true ist.

Die zurückgegebene Liste von Kerzen kann eine oder mehrere fehlende Perioden aufweisen, wenn die Börse für den angegebenen Zeitraum und das angegebene Symbol keine Handelsaktivität hatte. Für einen Benutzer würde das als Lücken in einer kontinuierlichen Liste von Kerzen erscheinen. Das gilt als normal. Wenn die Börse zu diesem Zeitpunkt keine Kerzen hatte, zeigt die CCXT-Bibliothek die Ergebnisse so an, wie sie von der Börse selbst zurückgegeben werden.

**Es gibt eine Begrenzung, wie weit in der Vergangenheit Ihre Anfragen zurückgehen können.** Die meisten Börsen erlauben keine Abfrage detaillierter Candlestick-Historien (wie für 1-Minuten- und 5-Minuten-Zeitrahmen) zu weit in der Vergangenheit. Sie halten normalerweise eine angemessene Menge der aktuellsten Kerzen vor – etwa 1000 der letzten Kerzen für jeden Zeitrahmen ist für die meisten Zwecke mehr als ausreichend. Sie können diese Einschränkung umgehen, indem Sie die neuesten OHLCVs kontinuierlich abrufen (auch als *REST polling* bekannt) und diese in einer CSV-Datei oder in einer Datenbank speichern.

**Beachten Sie, dass die Informationen der letzten (aktuellen) Kerze unvollständig sein können, bis die Kerze geschlossen ist (bis die nächste Kerze beginnt).**

Wie bei den meisten anderen vereinheitlichten und impliziten Methoden akzeptiert die Methode `fetchOHLCV` als letztes Argument ein assoziatives Array (ein Dictionary) mit zusätzlichen `params`, das verwendet wird, um [Standardwerte zu überschreiben](#overriding-unified-api-params), die in Anfragen an die Börsen gesendet werden. Der Inhalt von `params` ist börsenspezifisch; lesen Sie die API-Dokumentation der Börsen für unterstützte Felder und Werte.

Das `since`-Argument ist ein ganzzahliger UTC-Zeitstempel **in Millisekunden** (überall in der Bibliothek bei allen vereinheitlichten Methoden).

Wenn `since` nicht angegeben ist, gibt die Methode `fetchOHLCV` den Zeitbereich so zurück, wie er standardmäßig von der Börse selbst festgelegt ist. Das ist kein Fehler. Einige Börsen geben Kerzen vom Anfang der Zeit zurück, andere geben nur die aktuellsten Kerzen zurück – das Standardverhalten der Börsen wird erwartet. Ohne Angabe von `since` ist der Bereich der zurückgegebenen Kerzen also börsenspezifisch. Man sollte das `since`-Argument übergeben, um genau den benötigten Historienbereich zu erhalten.

### Rohe OHLCV-Antwort abrufen

Derzeit enthält die von CCXT verwendete Struktur nicht die rohe Antwort der Börse. Benutzer können den Rückgabewert jedoch überschreiben, indem sie Folgendes tun:


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


### Hinweise zur Latenz

Handelsstrategien benötigen frische, aktuelle Informationen für die technische Analyse, Indikatoren und Signale. Das Aufbauen einer spekulativen Handelsstrategie auf Basis der OHLCV-Kerzen, die von der Börse empfangen werden, kann kritische Nachteile haben. Entwickler sollten die in diesem Abschnitt erläuterten Details berücksichtigen, um erfolgreiche Bots zu entwickeln.

Zunächst und vor allem: Wenn Sie CCXT verwenden, kommunizieren Sie direkt mit den Börsen. CCXT ist kein Server, kein Dienst, sondern eine Softwarebibliothek. Alle Daten, die Sie mit CCXT erhalten, werden direkt und aus erster Hand von den Börsen empfangen.

Die Börsen bieten in der Regel zwei Kategorien öffentlicher Marktdaten an:

1. Schnelle primäre Erstdaten, die Echtzeit-Orderbücher und Trades oder Fills enthalten
2. Langsame sekundäre Daten, die sekundäre Tickers und Kline-OHLCV-Kerzen enthalten, die aus den Erstdaten berechnet werden

Die primären Erstdaten werden von den Börsen-APIs in Pseudo-Echtzeit oder so nah an der Echtzeit wie möglich und so schnell wie möglich aktualisiert. Die Berechnung der sekundären Daten erfordert Zeit seitens der Börse. Ein Ticker ist beispielsweise nichts anderes als ein rollender 24-Stunden-Statistikschnitt von Orderbüchern und Trades. OHLCV-Kerzen und Volumina werden ebenfalls aus Erstdaten-Trades berechnet und stellen feste statistische Schnitte bestimmter Perioden dar. Das innerhalb einer Stunde gehandelte Volumen ist lediglich eine Summe der gehandelten Volumina der entsprechenden Trades, die innerhalb dieser Stunde stattgefunden haben.

Offensichtlich benötigt die Börse einige Zeit, um die Erstdaten zu sammeln und die sekundären statistischen Daten daraus zu berechnen. Das bedeutet buchstäblich, dass **Tickers und OHLCVs immer langsamer sind als Orderbücher und Trades**. Mit anderen Worten: Es gibt in der Börsen-API immer eine gewisse Latenz zwischen dem Moment, in dem ein Trade stattfindet, und dem Moment, in dem eine entsprechende OHLCV-Kerze von der Börsen-API aktualisiert oder veröffentlicht wird.

Die Latenz (oder wie viel Zeit die Börsen-API für die Berechnung der sekundären Daten benötigt) hängt davon ab, wie schnell die Börsen-Engine ist, und ist daher börsenspezifisch. Top-Börsen-Engines geben und aktualisieren in der Regel frische Kerzen der letzten Minute sowie Tickers sehr schnell. Einige Börsen tun dies möglicherweise in regelmäßigen Abständen wie einmal pro Sekunde oder einmal in wenigen Sekunden. Langsame Börsen-Engines können Minuten benötigen, um die sekundären statistischen Informationen zu aktualisieren; ihre APIs können die aktuellste OHLCV-Kerze mit einigen Minuten Verzögerung zurückgeben.

Wenn Ihre Strategie von den frischesten Daten der letzten Minute abhängt, sollten Sie sie nicht auf Tickers oder OHLCVs aufbauen, die von der Börse empfangen werden. Tickers und OHLCVs der Börsen eignen sich nur für Anzeigezwecke oder für einfache Handelsstrategien für Stunden- oder Tageszeitrahmen, die weniger anfällig für Latenz sind.

Glücklicherweise müssen Entwickler zeitkritischer Handelsstrategien nicht auf sekundäre Daten der Börsen angewiesen sein und können OHLCVs und Tickers im Userland berechnen. Das kann schneller und effizienter sein, als darauf zu warten, dass die Börsen die Informationen auf ihrer Seite aktualisieren. Man kann die öffentliche Handelshistorie durch häufiges Polling aggregieren und Kerzen durch Durchlaufen der Liste der Trades berechnen – bitte schauen Sie sich die Datei "build-ohlcv-bars" im [Beispielordner](https://github.com/ccxt/ccxt/tree/master/examples) an.

Aufgrund der Unterschiede in ihren internen Implementierungen können die Börsen ihre primären und sekundären Marktdaten über WebSockets schneller aktualisieren. Die Latenz bleibt börsenspezifisch, da die Börsen-Engine noch Zeit benötigt, um die sekundären Daten zu berechnen – unabhängig davon, ob Sie sie über die RESTful API mit CCXT abfragen oder Updates über WebSockets mit CCXT Pro erhalten. WebSockets können die Netzwerklatenz verbessern, sodass eine schnelle Börse noch besser funktioniert, aber das Hinzufügen von WS-Subscriptions macht eine langsame Börsen-Engine nicht wesentlich schneller.

Wenn Sie mit der Latenz der sekundären Daten Schritt halten möchten, müssen Sie diese auf Ihrer Seite berechnen und die Börsen-Engine in der Geschwindigkeit übertreffen. Je nach den Anforderungen Ihrer Anwendung kann das schwierig sein, da Sie Redundanz, „Datenlücken" in der Historie, Börsenausfallzeiten und andere Aspekte der Datenaggregation behandeln müssen – ein ganzes Universum für sich, das in diesem Handbuch unmöglich vollständig abgedeckt werden kann.


### OHLCV-Balken aus Trades erstellen

Wie im obigen Abschnitt erwähnt, können Benutzer Kerzen manuell mit der Methode `buildOHLCV / build_ohlcv` erstellen. Ein Beispiel finden Sie in der Datei "build-ohlcv-bars" im [Beispielordner](https://github.com/ccxt/ccxt/tree/master/examples). 
Hinweise:
- Diese Methode erwartet, dass die bereitgestellten Trades chronologisch sortiert sind (der neueste Trade ist der letzte im Array)
- Aufgrund möglicher Fehler in Trade-Einträgen (die von `watch_ohlcv` oder anderen Quellen stammen) überspringen wir innerhalb der Methode `build_ohlcv` Trades mit einem Preis von `0`, um verzerrte Werte für eine Kerze zu vermeiden. Wenn Sie solche Trade-Einträge jedoch nicht überspringen möchten, setzen Sie eine Option:

```
exchange.options['buildOHLCV'] = {
    'skipZeroPrices': false
};
```

### OHLCV-Struktur

Die oben gezeigte fetchOHLCV-Methode gibt eine Liste (ein flaches Array) von OHLCV-Kerzen zurück, die durch die folgende Struktur dargestellt werden:

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

Die Liste der Kerzen wird in aufsteigender (historischer/chronologischer) Reihenfolge zurückgegeben, älteste Kerze zuerst, neueste Kerze zuletzt.

### Mark-, Index- und PremiumIndex-Kerzencharts

Um historische Mark-, Indexpreis- und Premium-Index-Kerzen abzurufen, übergeben Sie den `'price'` [params-override](#overriding-unified-api-params) an `fetchOHLCV`. Der Parameter `'price'` akzeptiert einen der folgenden Werte:

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

Es gibt auch die Komfortmethoden `fetchMarkOHLCV`, `fetchIndexOHLCV` und `fetchPremiumIndexOHLCV`


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


## Öffentliche Trades

```diff
- this is under heavy development right now, contributions appreciated
```

Sie können die vereinheitlichte Methode `fetchTrades` / `fetch_trades` aufrufen, um die Liste der neuesten Trades für ein bestimmtes Symbol abzurufen. Die Methode `fetchTrades` ist auf folgende Weise deklariert:

```javascript
async fetchTrades (symbol, since = undefined, limit = undefined, params = {})
```

Wenn Sie beispielsweise aktuelle Trades für alle Symbole nacheinander sequenziell ausgeben möchten (Achtung bei rateLimit!), würden Sie es so machen:


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


Die oben gezeigte fetchTrades-Methode gibt eine geordnete Liste von Trades zurück (ein flaches Array, sortiert nach Zeitstempel in aufsteigender Reihenfolge, ältester Trade zuerst, neuester Trade zuletzt). Eine Liste von Trades wird durch die [Trade-Struktur](#trade-structure) dargestellt.

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

Die meisten Börsen geben die meisten der oben genannten Felder für jeden Trade zurück, obwohl es Börsen gibt, die den Typ, die Seite, die Trade-ID oder die Order-ID des Trades nicht zurückgeben. Meistens sind Zeitstempel, Datetime, Symbol, Preis und Menge jedes Trades garantiert vorhanden.

Das zweite optionale Argument `since` reduziert das Array nach Zeitstempel, das dritte Argument `limit` reduziert nach Anzahl (Anzahl) der zurückgegebenen Elemente.

Wenn der Benutzer `since` nicht angibt, gibt die Methode `fetchTrades` den Standardbereich der öffentlichen Trades der Börse zurück. Der Standardsatz ist börsenspezifisch: Einige Börsen geben Trades ab dem Datum der Notierung eines Paars an der Börse zurück, andere Börsen geben einen reduzierten Satz von Trades zurück (z. B. letzte 24 Stunden, letzte 100 Trades usw.). Wenn der Benutzer präzise Kontrolle über den Zeitraum möchte, ist der Benutzer dafür verantwortlich, das Argument `since` anzugeben.

Die meisten vereinheitlichten Methoden geben entweder ein einzelnes Objekt oder ein einfaches Array (eine Liste) von Objekten (Trades) zurück. Allerdings werden sehr wenige Börsen (wenn überhaupt) alle Trades auf einmal zurückgeben. Meistens begrenzen ihre APIs die Ausgabe auf eine bestimmte Anzahl der neuesten Objekte. **SIE KÖNNEN NICHT ALLE OBJEKTE VON ANFANG AN BIS ZUM GEGENWÄRTIGEN MOMENT IN EINEM EINZIGEN AUFRUF ABRUFEN**. In der Praxis werden sehr wenige Börsen dies tolerieren oder erlauben.

Um historische Trades abzurufen, muss der Benutzer die Daten in Portionen oder „Seiten" von Objekten durchlaufen. Paginierung bedeutet oft *„Datenpositionen nacheinander in einer Schleife abrufen"*.

In den meisten Fällen sind Benutzer **verpflichtet, mindestens eine Art von Paginierung zu verwenden**, um die erwarteten Ergebnisse konsistent zu erhalten.

Andererseits **unterstützen einige Börsen überhaupt keine Paginierung für öffentliche Trades**. Im Allgemeinen stellen die Börsen nur die neuesten Trades bereit.

Die Methode `fetchTrades ()` / `fetch_trades()` akzeptiert auch ein optionales `params`-Argument (assoziatives Schlüssel-Array/Dict, standardmäßig leer) als viertes Argument. Sie können es verwenden, um zusätzliche Parameter an Methodenaufrufe zu übergeben oder einen bestimmten Standardwert zu überschreiben (sofern von der Börse unterstützt). Weitere Informationen finden Sie in der API-Dokumentation Ihrer Börse.

## Börsenzeit

Die Methode `fetchTime()` (sofern verfügbar) gibt den aktuellen ganzzahligen Zeitstempel in Millisekunden vom Börsenserver zurück.

```javascript
fetchTime(params = {})
```

## Börsenstatus

Der Börsenstatus beschreibt die neuesten bekannten Informationen zur Verfügbarkeit der Börsen-API. Diese Informationen sind entweder in der Börsenklasse fest codiert oder werden direkt von der Börsen-API live abgerufen. Die Methode `fetchStatus(params = {})` kann verwendet werden, um diese Informationen abzurufen. Der von `fetchStatus` zurückgegebene Status ist einer der folgenden:

- In der Börsenklasse fest codiert, z. B. wenn die API unterbrochen oder abgeschaltet wurde.
- Aktualisiert mithilfe des Börsen-Ping oder des `fetchTime`-Endpunkts, um zu prüfen, ob er aktiv ist
- Aktualisiert mithilfe des dedizierten Börsen-API-Statusendpunkts.

```javascript
fetchStatus(params = {})
```

### Börsenstatusstruktur

Die Methode `fetchStatus()` gibt eine Statusstruktur zurück, wie unten gezeigt:

```javascript
{
    'status': 'ok', // 'ok', 'shutdown', 'error', 'maintenance'
    'updated': undefined, // integer, last updated timestamp in milliseconds if updated via the API
    'eta': undefined, // when the maintenance or outage is expected to end
    'url': undefined, // a link to a GitHub issue or to an exchange post on the subject
}
```

Die möglichen Werte im Feld `status` sind:

- `'ok'` bedeutet, dass die Börsen-API vollständig betriebsbereit ist
- `'shutdown`' bedeutet, dass die Börse geschlossen wurde, und das Feld `updated` sollte das Datum und die Uhrzeit der Abschaltung enthalten
- `'error'` bedeutet, dass entweder die Börsen-API defekt ist oder die Implementierung der Börse in CCXT defekt ist
- `'maintenance'` bedeutet reguläre Wartung, und das Feld `eta` sollte das Datum und die Uhrzeit enthalten, zu der die Börse voraussichtlich wieder betriebsbereit sein wird

## Leihzinsen

*nur Margin*

Beim Leerverkauf oder Handel mit Hebel auf einem Spotmarkt muss Währung geliehen werden. Für die geliehene Währung fallen Zinsen an.

Daten zum Leihzins für eine Währung können abgerufen werden mit

- `fetchCrossBorrowRate ()` für den Leihzins einer einzelnen Währung
- `fetchCrossBorrowRates ()` für die Leihzinsen aller Währungen
- `fetchIsolatedBorrowRate ()` für den Leihzins eines Handelspaares
- `fetchIsolatedBorrowRates ()` für die Leihzinsen aller Handelspaare
- `fetchBorrowRatesPerSymbol ()` für die Leihzinsen von Währungen in einzelnen Märkten

```javascript
fetchCrossBorrowRate (code, params = {})
```

Parameter

- **code** (String) Einheitlicher CCXT-Währungscode, erforderlich (z. B. `"USDT"`)
- **params** (Dictionary) Parameter spezifisch für den Börsen-API-Endpunkt (z. B. `{"settle": "USDT"}`)

Rückgabe

- Eine [Leihzinsstruktur](#borrow-rate-structure)

```javascript
fetchCrossBorrowRates (params = {})
```

Parameter

- **params** (Dictionary) Parameter spezifisch für den Börsen-API-Endpunkt (z. B. `{"startTime": 1610248118000}`)

Rückgabe

- Ein Dictionary von [Leihzinsstrukturen](#borrow-rate-structure) mit einheitlichen Währungscodes als Schlüssel

```javascript
fetchIsolatedBorrowRate (symbol, params = {})
```

Parameter

- **symbol** (String) Einheitliches CCXT-Marktsymbol, erforderlich (z. B. `"BTC/USDT"`)
- **params** (Dictionary) Parameter spezifisch für den Börsen-API-Endpunkt (z. B. `{"settle": "USDT"}`)

Rückgabe

- Eine [isolierte Leihzinsstruktur](#isolated-borrow-rate-structure)

```javascript
fetchIsolatedBorrowRates (params = {})
```

Parameter

- **params** (Dictionary) Parameter spezifisch für den Börsen-API-Endpunkt (z. B. `{"startTime": 1610248118000}`)

Rückgabe

- Ein Dictionary von [isolierten Leihzinsstrukturen](#isolated-borrow-rate-structure) mit einheitlichen Marktsymbolen als Schlüssel

### Isolierte Leihzinsstruktur

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

### Leihzinsstruktur

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

## Leihzinsverlauf

*nur Margin*

Die Methode `fetchBorrowRateHistory` ruft einen Verlauf des Leihinssatzes einer Währung zu bestimmten Zeitfenstern ab

```javascript
fetchBorrowRateHistory (code, since = undefined, limit = undefined, params = {})
```

Parameter

- **code** (String) *erforderlich* Einheitlicher CCXT-Währungscode (z. B. `"USDT"`)
- **since** (Integer) Zeitstempel für den frühesten Leihzins (z. B. `1645807945000`)
- **limit** (Integer) Die maximale Anzahl der abzurufenden [Leihzinsstrukturen](#borrow-rate-structure) (z. B. `10`)
- **params** (Dictionary) Zusätzliche Parameter spezifisch für den Börsen-API-Endpunkt (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Ein Array von [Leihzinsstrukturen](#borrow-rate-structure)

## Hebelstufen

*nur Kontrakt*

- Hebelstufen-Methoden sind auf **binance** privat

Die Methode `fetchLeverageTiers()` kann verwendet werden, um den maximalen Hebel für einen Markt bei unterschiedlichen Positionsgrößen zu ermitteln. Sie kann auch verwendet werden, um die Erhaltungsmarginrate und den maximalen handelbaren Betrag für einen Markt abzurufen, wenn diese Informationen nicht aus dem Marktobjekt verfügbar sind

Während Sie den absoluten maximalen Hebel für einen Markt durch Zugriff auf `market['limits']['leverage']['max']` ermitteln können, hängt für viele Kontraktmärkte der maximale Hebel von der Größe Ihrer Position ab.

Sie können auf diese Grenzen zugreifen mit

- `fetchMarketLeverageTiers()` (einzelnes Symbol)
- `fetchLeverageTiers([symbol1, symbol2, ...])` (mehrere Symbole)
- `fetchLeverageTiers()` (alle Marktsymbole)

```javascript
fetchMarketLeverageTiers(symbol, params = {})
```

Parameter

- **symbol** (String) *erforderlich* Einheitliches CCXT-Symbol (z. B. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parameter spezifisch für den Börsen-API-Endpunkt (z. B. `{"settle": "usdt"}`)

Rückgabe

- eine [Hebelstufenstruktur](#leverage-tiers-structure)

```javascript
fetchLeverageTiers(symbols = undefined, params = {})
```

Parameter

- **symbols** (\[String\]) Einheitliches CCXT-Symbol (z. B. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parameter spezifisch für den Börsen-API-Endpunkt (z. B. `{"settle": "usdt"}`)

Rückgabe

- ein Array von [Hebelstufenstrukturen](#leverage-tiers-structure)

### Hebelstufenstruktur

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

Im obigen Beispiel:

- Einsätze unter 133,33       = ein maximaler Hebel von 75
- Einsätze von 200 + 1000    = ein maximaler Hebel von 50
- ein Einsatzbetrag von 150     = ein maximaler Hebel von (10000 / 150)   = 66,66
- Einsätze zwischen 133,33-200 = ein maximaler Hebel von (10000 / Einsatz) = 50,01 -> 74,99

**Hinweis für Huobi-Benutzer:** Huobi verwendet sowohl Hebel als auch Betrag zur Bestimmung der Erhaltungsmarginraten: https://www.huobi.com/support/en-us/detail/900000089903

## Finanzierungsrate

*nur Kontrakt*

Daten zur aktuellen, neuesten und nächsten Finanzierungsrate können mit den folgenden Methoden abgerufen werden

- `fetchFundingRates ()` für alle Marktsymbole
- `fetchFundingRates ([ symbol1, symbol2, ... ])` für mehrere Marktsymbole
- `fetchFundingRate (symbol)` für ein einzelnes Marktsymbol

```javascript
fetchFundingRate (symbol, params = {})
```

Parameter

- **symbol** (String) *erforderlich* Einheitliches CCXT-Symbol (z. B. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parameter spezifisch für den Börsen-API-Endpunkt (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- eine [Finanzierungsratenstruktur](#funding-rate-structure)

```javascript
fetchFundingRates (symbols = undefined, params = {})
```

Parameter

- **symbols** (\[String\]) Ein optionales Array/eine Liste einheitlicher CCXT-Symbole (z. B. `["BTC/USDT:USDT", "ETH/USDT:USDT"]`)
- **params** (Dictionary) Parameter spezifisch für den Börsen-API-Endpunkt (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Ein Array von [Finanzierungsratenstrukturen](#funding-rate-structure) indexiert nach Marktsymbolen

## Finanzierungsintervall

*nur Kontrakt*

Rufen Sie das aktuelle Finanzierungsintervall mit den folgenden Methoden ab:

- `fetchFundingInterval (symbol)` für ein einzelnes Marktsymbol
- `fetchFundingIntervals ()` für alle Marktsymbole
- `fetchFundingIntervals ([ symbol1, symbol2, ... ])` für mehrere Marktsymbole

```javascript
fetchFundingInterval (symbol, params = {})
```

Parameter

- **symbol** (String) *erforderlich* Einheitliches CCXT-Symbol (z. B. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parameter spezifisch für den Börsen-API-Endpunkt (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Eine [Finanzierungsratenstruktur](#funding-rate-structure)

```javascript
fetchFundingIntervals (symbols = undefined, params = {})
```

Parameter

- **symbols** (\[String\]) Ein optionales Array/eine Liste einheitlicher CCXT-Symbole (z. B. `["BTC/USDT:USDT", "ETH/USDT:USDT"]`)
- **params** (Dictionary) Parameter spezifisch für den Börsen-API-Endpunkt (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Ein Array von [Finanzierungsratenstrukturen](#funding-rate-structure)

### Finanzierungsratenstruktur

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

## Finanzierungsratenverlauf

*nur Kontrakt*

```javascript
fetchFundingRateHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

Parameter

- **symbol** (String) Einheitliches CCXT-Symbol (z. B. `"BTC/USDT:USDT"`)
- **since** (Integer) Zeitstempel für die früheste Finanzierungsrate (z. B. `1645807945000`)
- **limit** (Integer) Die maximale Anzahl der abzurufenden Finanzierungsraten (z. B. `10`)
- **params** (Dictionary) Zusätzliche Parameter spezifisch für den Börsen-API-Endpunkt (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Ein Array von [Finanzierungsraten-Verlaufsstrukturen](#funding-rate-history-structure)

### Finanzierungsraten-Verlaufsstruktur

```javascript
{
    info: { ... },
    symbol: "BTC/USDT:USDT",
    fundingRate: -0.000068,
    timestamp: 1642953600000,
    datetime: "2022-01-23T16:00:00.000Z"
}
```

## Offenes Interesse

*nur Kontrakte*

Verwende die Methode `fetchOpenInterest`, um das aktuelle offene Interesse für ein Symbol von der Börse abzurufen. Verwende `fetchOpenInterests`, um das aktuelle offene Interesse für mehrere Symbole abzurufen.

```javascript
fetchOpenInterest (symbol, params = {})
```

Parameter

- **symbol** (String) Einheitliches CCXT-Marktsymbol (z. B. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Zusätzliche Parameter, die für den API-Endpunkt der Börse spezifisch sind (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Eine [Struktur für offenes Interesse](#open-interest-structure)

```js
fetchOpenInterests (symbols = undefined, params = {})
```

- **symbols** ([String]) Ein optionales Array/Liste einheitlicher CCXT-Symbole (z. B. `["BTC/USDT:USDT", "ETH/USDT:USDT"]`). Für alle Symbole als `undefined` lassen.
- **params** (Dictionary) Parameter, die für den API-Endpunkt der Börse spezifisch sind (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Ein Dictionary von [Strukturen für offenes Interesse](#open-interest-structure)

### Verlauf des offenen Interesses

*nur Kontrakte*

Verwende die Methode `fetchOpenInterestHistory`, um einen Verlauf des offenen Interesses für ein Symbol von der Börse abzurufen.

```javascript
fetchOpenInterestHistory (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {})
```

Parameter

- **symbol** (String) Einheitliches CCXT-Marktsymbol (z. B. `"BTC/USDT:USDT"`)
- **timeframe** (String) Prüfe exchange.timeframes für verfügbare Werte
- **since** (Integer) Zeitstempel für den frühesten Datensatz des offenen Interesses (z. B. `1645807945000`)
- **limit** (Integer) Die maximale Anzahl der abzurufenden [Strukturen für offenes Interesse](#open-interest-structures) (z. B. `10`)
- **params** (Dictionary) Zusätzliche Parameter, die für den API-Endpunkt der Börse spezifisch sind (z. B. `{"endTime": 1645807945000}`)

**Hinweis für OKX-Benutzer:** Anstatt eines einheitlichen Symbols erwartet okx.fetchOpenInterestHistory einen einheitlichen Währungscode im **symbol**-Argument (z. B. `'BTC'`).

Rückgabe

- Ein Array von [Strukturen für offenes Interesse](#open-interest-structure)

### Struktur für offenes Interesse

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

## Historische Volatilität

*nur Optionen*

Verwende die Methode `fetchVolatilityHistory`, um den Volatilitätsverlauf für den Code eines dem Optionskontrakt zugrunde liegenden Vermögenswerts von der Börse abzurufen.

```javascript
fetchVolatilityHistory (code, params = {})
```

Parameter

- **code** (String) *erforderlich* Einheitlicher CCXT-Währungscode (z. B. `"BTC"`)
- **params** (Dictionary) Zusätzliche Parameter, die für den API-Endpunkt der Börse spezifisch sind (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Ein Array von [Volatilitätsverlaufsstrukturen](#volatility-structure)

### Volatilitätsstruktur

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

## Basiswerte

*nur Kontrakte*

Verwende die Methode `fetchUnderlyingAssets`, um die Markt-IDs der Basiswerte für einen Kontrakt-Markttyp von der Börse abzurufen.

```javascript
fetchUnderlyingAssets (params = {})
```

Parameter

- **params** (Dictionary) Zusätzliche Parameter, die für den API-Endpunkt der Börse spezifisch sind (z. B. `{"instType": "OPTION"}`)
- **params.type** (String) Einheitlicher Markttyp (marketType), der Standard ist 'option' (z. B. `"option"`)

Rückgabe

- Eine [Struktur für Basiswerte](#underlying-assets-structure)

### Struktur für Basiswerte

```javascript
[ 'BTC_USDT', 'ETH_USDT', 'DOGE_USDT' ]
```

## Abrechnungsverlauf

*nur Kontrakte*

Verwende die Methode `fetchSettlementHistory`, um den öffentlichen Abrechnungsverlauf für einen Kontraktmarkt von der Börse abzurufen. Verwende `fetchMySettlementHistory`, um nur deinen eigenen Abrechnungsverlauf abzurufen.

```javascript
fetchMySettlementHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
fetchSettlementHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

Parameter

- **symbol** (String) Einheitliches CCXT-Symbol (z. B. `"BTC/USDT:USDT-230728-25500-P"`)
- **since** (Integer) Zeitstempel für die früheste Abrechnung (z. B. `1694073600000`)
- **limit** (Integer) Die maximale Anzahl der abzurufenden Abrechnungen (z. B. `10`)
- **params** (Dictionary) Zusätzliche Parameter, die für den API-Endpunkt der Börse spezifisch sind (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Ein Array von [Abrechnungsverlaufsstrukturen](#settlement-history-structure)

### Abrechnungsverlaufsstruktur

```javascript
{
    info: { ... },
    symbol: 'BTC/USDT:USDT-230728-25500-P',
    price: 25761.35807869,
    timestamp: 1694073600000,
    datetime: '2023-09-07T08:00:00.000Z',
}
```

## Liquidationen

*nur Margin und Kontrakte*

Verwende die Methode `fetchLiquidations`, um die öffentlichen Liquidationen eines Handelspaares von der Börse abzurufen. Verwende `fetchMyLiquidations`, um nur deinen eigenen Liquidationsverlauf abzurufen.

```javascript
fetchMyLiquidations (symbol = undefined, since = undefined, limit = undefined, params = {})
fetchLiquidations (symbol, since = undefined, limit = undefined, params = {})
```

Parameter

- **symbol** (String) Einheitliches CCXT-Symbol (z. B. `"BTC/USDT:USDT-231006-25000-P"`)
- **since** (Integer) Zeitstempel für die früheste Liquidation (z. B. `1694073600000`)
- **limit** (Integer) Die maximale Anzahl der abzurufenden Liquidationen (z. B. `10`)
- **params** (Dictionary) Zusätzliche Parameter, die für den API-Endpunkt der Börse spezifisch sind (z. B. `{"until": 1645807945000}`)

Rückgabe

- Ein Array von [Liquidationsstrukturen](#liquidation-structure)

### Liquidationsstruktur

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

## Griechen

*nur Optionen*

Verwende die Methode `fetchGreeks`, um die öffentlichen Griechen und die implizite Volatilität eines Optionshandelspaares von der Börse abzurufen. Verwende `fetchAllGreeks`, um die Griechen für alle Symbole oder mehrere Symbole abzurufen.
Die Griechen messen, wie Faktoren wie der Preis des zugrunde liegenden Vermögenswerts, die Restlaufzeit, die Volatilität und die Zinssätze den Preis eines Optionskontrakts beeinflussen.

```javascript
fetchGreeks (symbol, params = {})
```

Parameter

- **symbol** (String) Einheitliches CCXT-Symbol (z. B. `"BTC/USD:BTC-240927-40000-C"`)
- **params** (Dictionary) Zusätzliche Parameter, die für den API-Endpunkt der Börse spezifisch sind (z. B. `{"category": "options"}`)

Rückgabe

- Eine [Griechen-Struktur](#greeks-structure)

```javascript
fetchAllGreeks (symbols = undefined, params = {})
```

Parameter

- **symbols** (String) Einheitliches CCXT-Symbol (z. B. `"BTC/USD:BTC-240927-40000-C"`)
- **params** (Dictionary) Zusätzliche Parameter, die für den API-Endpunkt der Börse spezifisch sind (z. B. `{"category": "options"}`)

// for example
fetchAllGreeks () // all symbols
fetchAllGreeks ([ 'BTC/USD:BTC-240927-40000-C', 'ETH/USD:ETH-240927-4000-C' ]) // an array of specific symbols

Rückgabe

- Eine Liste von [Griechen-Strukturen](#greeks-structure)

### Griechen-Struktur

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

## Optionskette

*nur Optionen*

Verwende die Methode `fetchOption`, um die öffentlichen Details eines einzelnen Optionskontrakts von der Börse abzurufen.

```javascript
fetchOption (symbol, params = {})
```

Parameter

- **symbol** (String) Einheitliches CCXT-Marktsymbol (z. B. `"BTC/USD:BTC-240927-40000-C"`)
- **params** (Dictionary) Zusätzliche Parameter, die für den API-Endpunkt der Börse spezifisch sind (z. B. `{"category": "options"}`)

Rückgabe

- Eine [Optionsketten-Struktur](#option-chain-structure)

Verwende die Methode `fetchOptionChain`, um die öffentlichen Optionskettendaten einer zugrunde liegenden Währung von der Börse abzurufen.

```javascript
fetchOptionChain (code, params = {})
```

Parameter

- **code** (String) Einheitlicher CCXT-Währungscode (z. B. `"BTC"`)
- **params** (Dictionary) Zusätzliche Parameter, die für den API-Endpunkt der Börse spezifisch sind (z. B. `{"category": "options"}`)

Rückgabe

- Eine Liste von [Optionsketten-Strukturen](#option-chain-structure)

### Optionsketten-Struktur

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

## Long-Short-Verhältnis

*nur Kontrakte*

Verwende die Methode `fetchLongShortRatio`, um das aktuelle Long-Short-Verhältnis eines Symbols abzurufen, und `fetchLongShortRatioHistory`, um den Verlauf der Long-Short-Verhältnisse für ein Symbol abzurufen.

- `fetchLongShortRatio (symbol, period)` für das aktuelle Verhältnis eines einzelnen Marktsymbols
- `fetchLongShortRatioHistory (symbol, period, since, limit)` für den Verlauf der Verhältnisse eines einzelnen Marktsymbols

```javascript
fetchLongShortRatio (symbol, period = undefined, params = {})
```

Parameter

- **symbol** (String) *erforderlich* Einheitliches CCXT-Symbol (z. B. `"BTC/USDT:USDT"`)
- **period** (String) Der Zeitraum, aus dem das Verhältnis berechnet wird (z. B. `"24h"`)
- **params** (Dictionary) Parameter, die für den API-Endpunkt der Börse spezifisch sind (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Eine [Long-Short-Verhältnis-Struktur](#long-short-ratio-structure)

```javascript
fetchLongShortRatioHistory (symbol = undefined, period = undefined, since = undefined, limit = undefined, params = {})
```

Parameter

- **symbol** (String) Einheitliches CCXT-Symbol (z. B. `"BTC/USDT:USDT"`)
- **period** (String) Der Zeitraum, aus dem das Verhältnis berechnet wird (z. B. `"24h"`)
- **since** (Integer) Zeitstempel für das früheste Verhältnis (z. B. `1645807945000`)
- **limit** (Integer) Die maximale Anzahl der abzurufenden Verhältnisse (z. B. `10`)
- **params** (Dictionary) Zusätzliche Parameter, die für den API-Endpunkt der Börse spezifisch sind (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Ein Array von [Long-Short-Verhältnis-Strukturen](#long-short-ratio-structure)

### Long-Short-Verhältnis-Struktur

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

## Automatische Deleveraging

*nur Kontrakte*

Verwende die Methode `fetchADLRank`, um die öffentlichen Details des automatischen Deleveraging-Rangs eines Symbols von der Börse abzurufen.

```javascript
fetchADLRank (symbol, params = {})
```

Parameter

- **symbol** (String) Einheitliches CCXT-Marktsymbol (z. B. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Zusätzliche Parameter, die für den API-Endpunkt der Börse spezifisch sind (z. B. `{"category": "futures"}`)

Rückgabe

- Eine [Struktur für automatisches Deleveraging](#auto-de-leverage)

### Struktur für automatisches Deleveraging

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

- [Authentifizierung](#authentication)
- [Anmelden](#sign-in)
- [API-Schlüssel einrichten](#api-keys-setup)
- [Konten](#accounts)
- [Kontostand](#account-balance)
- [Aufträge](#orders)
- [Meine Trades](#my-trades)
- [Hauptbuch](#ledger)
- [Einzahlung](#deposit)
- [Auszahlung](#withdrawal)
- [Einzahlungsadressen](#deposit-addresses)
- [Überweisungen](#transfers)
- [Gebühren](#fees)
- [Zinsen auf Kredite](#borrow-interest)
- [Margin leihen und zurückzahlen](#borrow-and-repay-margin)
- [Margin](#margin)
- [Margin-Modus](#margin-mode)
- [Hebel](#leverage)
- [Positionen](#positions)
- [Finanzierungsverlauf](#funding-history)
- [Konvertierung](#conversion)
- [Automatisches Deleveraging](#auto-de-leverage)

Um auf dein Benutzerkonto zugreifen, algorithmischen Handel durch Platzieren von Markt- und Limitaufträgen durchführen, Guthaben abfragen, Gelder einzahlen und abheben zu können, musst du API-Schlüssel zur Authentifizierung von jeder Börse beziehen, mit der du handeln möchtest. Diese sind in der Regel auf einem separaten Tab oder einer separaten Seite in deinen Benutzerkontoeinstellungen verfügbar. API-Schlüssel sind börsenbezogen und können unter keinen Umständen untereinander ausgetauscht werden.

Die privaten APIs der Börsen erlauben in der Regel folgende Arten der Interaktion:

- Den aktuellen Stand des Kontoguthabens des Benutzers kann man mit der Methode `fetchBalance()` abrufen, wie im Abschnitt [Kontostand](#account-balance) beschrieben
- Der Benutzer kann Aufträge mit `createOrder()`, `cancelOrder()` platzieren und stornieren sowie aktuelle offene Aufträge und den vergangenen Auftragsverlauf mit Methoden wie `fetchOrder`, `fetchOrders()`, `fetchOpenOrder()`, `fetchOpenOrders()`, `fetchCanceledOrders`, `fetchClosedOrder`, `fetchClosedOrders` abrufen, wie im Abschnitt [Aufträge](#orders) beschrieben
- Der Benutzer kann den Verlauf vergangener Trades, die mit seinem Konto ausgeführt wurden, mit `fetchMyTrades` abfragen, wie im Abschnitt [Meine Trades](#my-trades) beschrieben; siehe auch [Wie Aufträge mit Trades zusammenhängen](#how-orders-are-related-to-trades)
- Der Benutzer kann seine Positionen mit `fetchPositions()` und `fetchPosition()` abfragen, wie im Abschnitt [Positionen](#positions) beschrieben
- Der Benutzer kann den Verlauf seiner Transaktionen (On-Chain-_Transaktionen_, die entweder _Einzahlungen_ auf das Börsenkonto oder _Abhebungen_ vom Börsenkonto sind) mit `fetchTransactions()` oder separat mit `fetchDeposit()`, `fetchDeposits()`, `fetchWithdrawal()` und `fetchWithdrawals()` abrufen, je nachdem, was die Börsen-API anbietet
- Wenn die Börsen-API einen Hauptbuch-Endpunkt bereitstellt, kann der Benutzer einen Verlauf aller Geldbewegungen, die das Guthaben irgendwie beeinflusst haben, mit `fetchLedger` abrufen, das alle Buchungseinträge wie Trades, Einzahlungen, Abhebungen, interne Überweisungen zwischen Konten, Rückvergütungen, Boni, Gebühren, Staking-Gewinne usw. zurückgibt, wie im Abschnitt [Hauptbuch](#ledger) beschrieben.

## Authentifizierung

Die Authentifizierung bei allen Börsen erfolgt automatisch, wenn gültige API-Schlüssel bereitgestellt werden. Der Authentifizierungsprozess verläuft in der Regel nach folgendem Muster:

1. Neuen Nonce generieren. Ein Nonce ist eine Ganzzahl, oft ein Unix-Zeitstempel in Sekunden oder Millisekunden (seit dem Epochenbeginn 1. Januar 1970). Der Nonce sollte für eine bestimmte Anfrage eindeutig und ständig steigend sein, sodass keine zwei Anfragen denselben Nonce teilen. Jede folgende Anfrage sollte einen größeren Nonce haben als die vorherige. **Der Standard-Nonce ist ein 32-Bit-Unix-Zeitstempel in Sekunden.**
2. Öffentlichen `apiKey` und Nonce an andere Endpunkt-Parameter anhängen, falls vorhanden, und dann das Ganze für die Signierung serialisieren.
3. Die serialisierten Parameter mit HMAC-SHA256/384/512 oder MD5 und dem geheimen Schlüssel signieren.
4. Die Signatur in Hex oder Base64 sowie den Nonce an HTTP-Header oder den Body anhängen.

Dieser Prozess kann von Börse zu Börse unterschiedlich sein. Einige Börsen möchten die Signatur in einer anderen Kodierung, andere unterscheiden sich in Header- und Body-Parameternamen und -formaten, aber das allgemeine Muster ist für alle gleich.

**Sie sollten nicht dasselbe API-Schlüsselpaar über mehrere gleichzeitig laufende Instanzen einer Börse hinweg verwenden, weder in separaten Skripten noch in mehreren Threads. Die gleichzeitige Verwendung desselben Schlüsselpaares aus verschiedenen Instanzen kann zu allerlei unerwartetem Verhalten führen.**

**VERWENDEN SIE API-SCHLÜSSEL NICHT MIT ANDERER SOFTWARE WIEDER! Die andere Software wird Ihren Nonce zu hoch setzen. Wenn Sie [InvalidNonce](#invalid-nonce)-Fehler erhalten – stellen Sie sicher, dass Sie zunächst ein frisches neues Schlüsselpaar generieren.**

Die Authentifizierung wird bereits für Sie durchgeführt, sodass Sie keine dieser Schritte manuell ausführen müssen, es sei denn, Sie implementieren eine neue Börsenklasse. Das Einzige, was Sie für den Handel benötigen, ist das eigentliche API-Schlüsselpaar.

### Einrichtung von API-Schlüsseln

#### Erforderliche Zugangsdaten

Die API-Zugangsdaten umfassen in der Regel Folgendes:

- `apiKey`. Dies ist Ihr öffentlicher API-Schlüssel und/oder Token. Dieser Teil ist *nicht geheim*, er ist in Ihrem Anfrage-Header oder -Body enthalten und wird im Klartext über HTTPS gesendet, um Ihre Anfrage zu identifizieren. Es handelt sich oft um eine Zeichenkette in Hex- oder Base64-Kodierung oder einen UUID-Bezeichner.
- `secret`. Dies ist Ihr privater Schlüssel. Halten Sie ihn geheim, teilen Sie ihn niemandem mit. Er wird verwendet, um Ihre Anfragen lokal zu signieren, bevor sie an Börsen gesendet werden. Der geheime Schlüssel wird beim Anfrage-Antwort-Prozess nicht über das Internet übertragen und sollte weder veröffentlicht noch per E-Mail versendet werden. Er wird zusammen mit dem Nonce verwendet, um eine kryptografisch starke Signatur zu erzeugen. Diese Signatur wird zusammen mit Ihrem öffentlichen Schlüssel gesendet, um Ihre Identität zu authentifizieren. Jede Anfrage hat einen eindeutigen Nonce und daher eine eindeutige kryptografische Signatur.
- `uid`. Einige Börsen (nicht alle) generieren auch eine Benutzer-ID oder kurz *uid*. Es kann sich um eine Zeichenkette oder einen numerischen Wert handeln. Sie sollten ihn setzen, wenn Ihre Börse dies ausdrücklich verlangt. Weitere Einzelheiten finden Sie in [deren Dokumentation](#exchanges).
- `password`. Einige Börsen (nicht alle) verlangen für den Handel auch Ihr Passwort/Ihre Passphrase. Sie sollten diese Zeichenkette setzen, wenn Ihre Börse dies ausdrücklich verlangt. Weitere Einzelheiten finden Sie in [deren Dokumentation](#exchanges).

Um API-Schlüssel zu erstellen, suchen Sie den API-Tab oder -Button in Ihren Benutzereinstellungen auf der Börsenwebsite. Erstellen Sie dann Ihre Schlüssel und fügen Sie sie per Kopieren und Einfügen in Ihre Konfigurationsdatei ein. Die Berechtigungen Ihrer Konfigurationsdatei sollten entsprechend gesetzt sein und für niemanden außer dem Eigentümer lesbar sein.

**Denken Sie daran, Ihren `apiKey` und Ihren geheimen Schlüssel vor unbefugter Nutzung zu schützen; senden oder teilen Sie ihn niemandem mit. Ein Durchsickern des geheimen Schlüssels oder eine Sicherheitsverletzung kann zu einem Fondsverlust führen.**

#### Validierung der Zugangsdaten

Um zu prüfen, ob der Benutzer alle erforderlichen Zugangsdaten angegeben hat, verfügt die Basisklasse `Exchange` über eine Methode namens `exchange.checkRequiredCredentials()` oder `exchange.check_required_credentials()`. Der Aufruf dieser Methode löst einen `AuthenticationError` aus, wenn einige der Zugangsdaten fehlen oder leer sind. Die Basisklasse `Exchange` hat auch eine Eigenschaft `exchange.requiredCredentials`, die es einem Benutzer ermöglicht zu sehen, welche Zugangsdaten für diese oder jene Börse erforderlich sind, wie unten gezeigt:

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


#### Konfigurieren von API-Schlüsseln

Um eine Börse für den Handel einzurichten, weisen Sie die API-Zugangsdaten einer vorhandenen Börseninstanz zu oder übergeben Sie sie beim Erstellen einer Instanz an den Börsenkonstruktor, wie folgt:


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


Beachten Sie, dass Ihre privaten Anfragen mit einer Ausnahme oder einem Fehler fehlschlagen, wenn Sie Ihre API-Zugangsdaten nicht eingerichtet haben, bevor Sie mit dem Handel beginnen. Um das Escaping von Sonderzeichen zu vermeiden, **schreiben Sie Ihre Zugangsdaten immer in einfachen Anführungszeichen**, nicht in doppelten (`'VERY_GOOD'`, `"VERY_BAD"`).

#### Berechtigungen für API-Schlüssel
Wenn Sie Fehler wie `"Invalid API-key, IP, or permissions for action."` oder `"API-key format invalid"` erhalten, liegt das Problem höchstwahrscheinlich nicht innerhalb von ccxt. Bitte vermeiden Sie es, ein neues Issue zu eröffnen, sofern Sie nicht sichergestellt haben, dass:
1) Sie keine Tippfehler, Leerzeichen oder Anführungszeichen in Ihren Schlüsseln haben
2) Ihre aktuelle IP-Adresse (prüfen Sie [IPv4](https://api.ipify.org/) oder [IPv6](https://api64.ipify.org/)) in die Whitelist des API-Schlüssels eingetragen ist (wenn Sie einen Proxy verwenden, berücksichtigen Sie auch diesen)
3) Sie die richtigen Optionen in der Berechtigungsliste für diesen API-Schlüssel ausgewählt haben
4) Sie nicht versehentlich „testnet"-API-Schlüssel oder den „testnet"-Modus in Ihrem Skript verwechseln
5) Sie bereits [gemeldete Issues](https://github.com/ccxt/ccxt/issues?q=is%3Aissue+%22Invalid+Api-Key+ID%22) zu diesem Fehler geprüft haben


#### Anmelden

Bei einigen Börsen müssen Sie sich anmelden, bevor Sie private Methoden aufrufen können. Dies kann mit der Methode `signIn` erfolgen.


```javascript tab="JavaScript"
signIn (params = {})
```

Parameter

- **params** (Dictionary) Parameter, die spezifisch für den API-Endpunkt der Börse sind (z. B. `{"2fa": "329293"}`)

Rückgabe

- Antwort der Börse

## Den Nonce überschreiben

**Der Standard-Nonce wird von der zugrunde liegenden Börse definiert. Sie können ihn mit einem Millisekunden-Nonce überschreiben, wenn Sie private Anfragen häufiger als einmal pro Sekunde stellen möchten! Die meisten Börsen werden Ihre Anfragen drosseln, wenn Sie ihre Ratenlimits überschreiten. Lesen Sie die [API-Dokumentation für Ihre Börse](/docs/exchange-markets) sorgfältig!**

Wenn Sie den Nonce zurücksetzen müssen, ist es viel einfacher, ein weiteres Schlüsselpaar für die Verwendung mit privaten APIs zu erstellen. Das Erstellen neuer Schlüssel und das Einrichten eines frischen, ungenutzten Schlüsselpaares in Ihrer Konfiguration reicht dafür in der Regel aus.

In einigen Fällen können Sie aufgrund fehlender Berechtigungen oder aus anderen Gründen keine neuen Schlüssel erstellen. In diesem Fall können Sie den Nonce trotzdem überschreiben. Die Marktbasisklasse verfügt zur Vereinfachung über folgende Methoden:

- `seconds ()`: gibt einen Unix-Zeitstempel in Sekunden zurück.
- `milliseconds ()`: dasselbe in Millisekunden (ms = 1000 * s, Tausendstel einer Sekunde).
- `microseconds ()`: dasselbe in Mikrosekunden (μs = 1000 * ms, Millionstel einer Sekunde).

Es gibt Börsen, die in ihren API-Dokumentationen Millisekunden mit Mikrosekunden verwechseln – lassen wir ihnen das durchgehen. Sie können die oben aufgelisteten Methoden verwenden, um den Nonce-Wert zu überschreiben. Wenn Sie dasselbe Schlüsselpaar von mehreren Instanzen gleichzeitig verwenden müssen, verwenden Sie Closures oder eine gemeinsame Funktion, um Nonce-Konflikte zu vermeiden. In JavaScript können Sie den Nonce überschreiben, indem Sie dem Börsenkonstruktor einen `nonce`-Parameter übergeben oder ihn explizit am Börseobjekt setzen:

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

In Python und PHP können Sie dasselbe tun, indem Sie die Nonce-Funktion einer bestimmten Börsenklasse durch Unterklassenbildung überschreiben:

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

## Konten

Sie können alle mit einem Profil verknüpften Konten abrufen, indem Sie die Methode `fetchAccounts()` verwenden.

```javascript
fetchAccounts (params = {})
```

### Kontostruktur

Die Methode `fetchAccounts()` gibt eine Struktur zurück, wie sie unten dargestellt ist:

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

Der Kontotyp ist einer der [einheitlichen Kontotypen](####account-balance) oder `subaccount`.

## Kontostand

Um den Kontostand abzufragen und den für den Handel verfügbaren Betrag oder in Aufträgen gebundene Mittel zu erhalten, verwenden Sie die Methode `fetchBalance`:

```javascript
fetchBalance (params = {})
```

Parameter

- **params** (Dictionary) Zusätzliche Parameter, die spezifisch für den API-Endpunkt der Börse sind (z. B. `{"currency": "usdt"}`)

Rückgabe

- Eine [Kontostandsstruktur](#balance-structure)

### Kontostandsstruktur

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

Die Werte `timestamp` und `datetime` können undefiniert oder fehlend sein, wenn die zugrunde liegende Börse sie nicht bereitstellt.

Einige Börsen geben möglicherweise keine vollständigen Kontosaldeninformationen zurück. Viele Börsen geben keine Salden für leere oder nicht verwendete Konten zurück. In diesem Fall können einige Währungen in der zurückgegebenen Kontostandsstruktur fehlen.
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


## Aufträge

```diff
- this part of the unified API is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

### Aufträge abfragen

Meistens können Sie Aufträge nach einer ID oder nach einem Symbol abfragen, obwohl nicht alle Börsen einen vollständigen und flexiblen Satz von Endpunkten für die Auftragsabfrage bieten. Einige Börsen verfügen möglicherweise nicht über eine Methode zum Abrufen kürzlich geschlossener Aufträge, andere fehlt möglicherweise eine Methode zum Abrufen eines Auftrags nach ID usw. Die ccxt-Bibliothek wird diese Fälle durch clientseitige Umgehungslösungen wo möglich adressieren.

Die Liste der Methoden zur Auftragsabfrage umfasst Folgendes:

- `fetchCanceledOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`
- `fetchClosedOrder (id, symbol = undefined, params = {})`
- `fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`
- `fetchOpenOrder (id, symbol = undefined, params = {})`
- `fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`
- `fetchOrder (id, symbol = undefined, params = {})`
- `fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`

Beachten Sie, dass die Benennung dieser Methoden angibt, ob die Methode einen einzelnen Auftrag oder mehrere Aufträge (ein Array/eine Liste von Aufträgen) zurückgibt. Die Methode `fetchOrder()` erfordert ein obligatorisches Auftrags-ID-Argument (eine Zeichenkette). Einige Börsen erfordern auch ein Symbol zum Abrufen eines Auftrags nach ID, wenn sich Auftrags-IDs mit verschiedenen Handelspaaren überschneiden können. Beachten Sie auch, dass alle anderen oben genannten Methoden ein Array (eine Liste) von Aufträgen zurückgeben. Die meisten von ihnen erfordern ebenfalls ein Symbol-Argument, einige Börsen erlauben jedoch auch Abfragen ohne Angabe eines Symbols (d. h. *alle Symbole*).

Die Bibliothek löst eine NotSupported-Ausnahme aus, wenn ein Benutzer eine Methode aufruft, die von der Börse nicht verfügbar oder in ccxt nicht implementiert ist.

Um zu prüfen, ob eine der oben genannten Methoden verfügbar ist, schauen Sie in die `.has`-Eigenschaft der Börse:


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


Eine typische Struktur der `.has`-Eigenschaft enthält üblicherweise folgende Flags, die den Auftrags-API-Methoden zur Auftragsabfrage entsprechen:

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

Die Bedeutungen der booleschen Werte `true` und `false` sind offensichtlich. Ein Zeichenkettenwert `emulated` bedeutet, dass die jeweilige Methode in der Börsen-API fehlt und ccxt dies wo möglich clientseitig umgeht.

#### Das Design der Auftrags-API verstehen

Die Auftrags-Management-APIs der Börsen unterscheiden sich im Design. Der Benutzer muss den Zweck jeder spezifischen Methode verstehen und wie sie zu einer vollständigen Auftrags-API kombiniert werden:

- `fetchCanceledOrders()` – ruft eine Liste stornierter Aufträge ab
- `fetchClosedOrder()` – ruft einen einzelnen geschlossenen Auftrag nach Auftrags-ID ab
- `fetchClosedOrders()` – ruft eine Liste geschlossener (oder stornierter) Aufträge ab
- `fetchMyTrades()` – obwohl nicht Teil der Auftrags-API, ist es eng verwandt, da es den Verlauf abgeschlossener Trades liefert
- `fetchOpenOrder()` – ruft einen einzelnen offenen Auftrag nach Auftrags-ID ab
- `fetchOpenOrders()` – ruft eine Liste offener Aufträge ab
- `fetchOrder()` – ruft einen einzelnen Auftrag (offen oder geschlossen) nach Auftrags-`id` ab
- `fetchOrders()` – ruft eine Liste aller Aufträge ab (entweder offen oder geschlossen/storniert)
- `createOrder()` – wird zum Aufgeben von Aufträgen verwendet
- `createOrders()` – wird zum Aufgeben mehrerer Aufträge innerhalb derselben Anfrage verwendet
- `cancelOrder()` – wird zum Stornieren eines einzelnen Auftrags verwendet
- `cancelOrders()` – wird zum Stornieren mehrerer Aufträge verwendet
- `cancelAllOrders()` – wird zum Stornieren aller Aufträge verwendet
- `cancelAllOrdersAfter()` – wird zum Stornieren aller Aufträge nach dem angegebenen Timeout verwendet

Die Mehrheit der Börsen bietet eine Möglichkeit, aktuell offene Orders abzurufen. Daher gibt es `exchange.has['fetchOpenOrders']`. Wenn diese Methode nicht verfügbar ist, bietet höchstwahrscheinlich `exchange.has['fetchOrders']` eine Liste aller Orders. Die Börse gibt eine Liste offener Orders entweder über `fetchOpenOrders()` oder über `fetchOrders()` zurück. Eine der beiden Methoden ist in der Regel bei jeder Börse verfügbar.

Manche Börsen stellen den Auftragsverlauf zur Verfügung, andere nicht. Wenn die zugrunde liegende Börse den Auftragsverlauf bereitstellt, dann ist `exchange.has['fetchClosedOrders']` oder `exchange.has['fetchOrders']` verfügbar. Wenn die zugrunde liegende Börse den Auftragsverlauf nicht bereitstellt, sind `fetchClosedOrders()` und `fetchOrders()` nicht verfügbar. In letzterem Fall muss der Benutzer einen lokalen Cache von Orders aufbauen und offene Orders mittels `fetchOpenOrders()` und `fetchOrder()` nachverfolgen, um den Status zu prüfen und sie lokal als geschlossen zu markieren (wenn sie nicht mehr offen sind).

Wenn die zugrunde liegende Börse keine Methoden für den Auftragsverlauf (`fetchClosedOrders()` und `fetchOrders()`) hat, bietet sie stattdessen `fetchOpenOrders` sowie den Handelsverlauf mit `fetchMyTrades` an (siehe [Wie Orders mit Trades zusammenhängen](#how-orders-are-related-to-trades)). Diese Informationen reichen in vielen Fällen für die Nachverfolgung in einem Live-Trading-Bot aus. Wenn kein Auftragsverlauf vorhanden ist, müssen die Live-Orders nachverfolgt und historische Informationen aus offenen Orders und historischen Trades wiederhergestellt werden.

Im Allgemeinen stellen die zugrunde liegenden Börsen üblicherweise einen oder mehrere der folgenden Typen historischer Daten bereit:

- `fetchClosedOrders()`
- `fetchOrders()`
- `fetchMyTrades()`

Jede der drei oben genannten Methoden kann fehlen, aber die APIs der Börsen bieten in der Regel mindestens eine der drei Methoden an.

Wenn die zugrunde liegende Börse keine historischen Orders bereitstellt, emuliert die CCXT-Bibliothek die fehlende Funktionalität nicht – sie muss auf der Benutzerseite bei Bedarf hinzugefügt werden.

**Bitte beachten Sie, dass eine bestimmte Methode fehlen kann, entweder weil die Börse keinen entsprechenden API-Endpunkt hat oder weil CCXT sie noch nicht implementiert hat (die Bibliothek befindet sich ebenfalls in Entwicklung). Im letzteren Fall wird die fehlende Methode so bald wie möglich hinzugefügt.**

#### Mehrere Orders und Trades abfragen

Alle Methoden, die Listen von Trades und Orders zurückgeben, akzeptieren das zweite Argument `since` und das dritte Argument `limit`:

- `fetchTrades()` (öffentlich)
- `fetchMyTrades()` (privat)
- `fetchOrders()`
- `fetchOpenOrders()`
- `fetchClosedOrders()`
- `fetchCanceledOrders()`

Das zweite Argument `since` schränkt das Array nach Zeitstempel ein, das dritte Argument `limit` schränkt nach Anzahl (Menge) der zurückgegebenen Elemente ein.

Wenn der Benutzer `since` nicht angibt, geben die Methoden `fetchTrades()/fetchOrders()` die Standard-Ergebnismenge der Börse zurück. Die Standardmenge ist börsenspezifisch: Manche Börsen geben Trades oder aktuelle Orders ab dem Datum der Kursnotierung eines Paares zurück, andere geben eine reduzierte Menge an Trades oder Orders zurück (z.&nbsp;B. die letzten 24 Stunden, die letzten 100 Trades, die ersten 100 Orders usw.). Wenn der Benutzer genaue Kontrolle über den Zeitraum möchte, ist er dafür verantwortlich, das Argument `since` anzugeben.

**HINWEIS: Nicht alle Börsen bieten Möglichkeiten zum Filtern von Listen von Trades und Orders nach Startzeit, daher ist die Unterstützung für `since` und `limit` börsenspezifisch. Die meisten Börsen bieten jedoch zumindest eine Alternative für „Paginierung" und „Scrollen", die mit dem zusätzlichen Argument `params` überschrieben werden kann.**

Manche Börsen haben keine Methode zum Abrufen geschlossener Orders oder aller Orders. Sie bieten nur den Endpunkt `fetchOpenOrders()` an, und manchmal auch einen `fetchOrder`-Endpunkt. Diese Börsen haben keine Methoden zum Abrufen des Auftragsverlaufs. Um den Auftragsverlauf für diese Börsen zu pflegen, muss der Benutzer ein Dictionary oder eine Datenbank von Orders im Userland speichern und die Orders in der Datenbank aktualisieren, nachdem Methoden wie `createOrder()`, `fetchOpenOrders()`, `cancelOrder()`, `cancelAllOrders()` aufgerufen wurden.

#### Nach Order-ID

Um die Details einer bestimmten Order anhand ihrer ID abzurufen, verwenden Sie die Methode `fetchOrder()` / `fetch_order()`. Manche Börsen erfordern auch ein Symbol, selbst wenn eine bestimmte Order anhand der ID abgerufen wird.

Die Signatur der Methode fetchOrder/fetch_order lautet wie folgt:

```javascript
if (exchange.has['fetchOrder']) {
    //  you can use the params argument for custom overrides
    let order = await exchange.fetchOrder (id, symbol = undefined, params = {})
}
```

**Manche Börsen haben keinen Endpunkt zum Abrufen einer Order anhand der ID, ccxt emuliert dies, wo möglich.** Derzeit kann es hier und da noch fehlen, da sich dies noch in Entwicklung befindet.

Sie können benutzerdefinierte überschriebene Schlüssel-Wert-Paare im zusätzlichen Argument params übergeben, um bei Bedarf einen bestimmten Ordertyp oder eine andere Einstellung anzugeben.

Nachfolgend sind Beispiele für die Verwendung der Methode fetchOrder aufgeführt, um Orderinformationen von einer authentifizierten Börseninstanz abzurufen:

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


#### Alle Orders

```javascript
if (exchange.has['fetchOrders'])
    exchange.fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {})
```

**Manche Börsen haben keinen Endpunkt zum Abrufen aller Orders, ccxt emuliert dies, wo möglich.** Derzeit kann es hier und da noch fehlen, da sich dies noch in Entwicklung befindet.

#### Offene Orders

```javascript
if (exchange.has['fetchOpenOrders'])
    exchange.fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {})
```

#### Geschlossene Orders

Verwechseln Sie *geschlossene Orders* nicht mit *Trades* aka *Fills*! Eine Order kann (ausgeführt) geschlossen werden durch mehrere entgegengesetzte Trades! Eine *geschlossene Order* ist also nicht dasselbe wie ein *Trade*. Im Allgemeinen hat die Order überhaupt keine `fee`, aber jeder einzelne Benutzer-Trade hat `fee`, `cost` und andere Eigenschaften. Viele Börsen übertragen diese Eigenschaften jedoch auch auf die Orders.

**Manche Börsen haben keinen Endpunkt zum Abrufen geschlossener Orders, ccxt emuliert dies, wo möglich.** Derzeit kann es hier und da noch fehlen, da sich dies noch in Entwicklung befindet.

```javascript
if (exchange.has['fetchClosedOrders'])
    exchange.fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {})
```

### Order-Struktur

Die meisten Methoden, die Orders innerhalb der einheitlichen CCXT-API zurückgeben, liefern eine Order-Struktur, wie sie nachfolgend beschrieben wird:

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

- Der `status` einer Order ist in der Regel entweder `'open'` (nicht ausgeführt oder teilweise ausgeführt), `'closed'` (vollständig ausgeführt) oder `'canceled'` (nicht ausgeführt und storniert, oder teilweise ausgeführt und dann storniert).
- Manche Börsen erlauben dem Benutzer, beim Platzieren einer neuen Order einen Ablaufzeitstempel anzugeben. Wenn die Order bis zu diesem Zeitpunkt nicht ausgeführt wird, wird ihr `status` zu `'expired'`.
- Verwenden Sie den Wert `filled`, um zu bestimmen, ob die Order ausgeführt, teilweise ausgeführt oder vollständig ausgeführt ist und in welchem Umfang.
- Die Arbeit an `'fee'`-Informationen ist noch in Bearbeitung; Fee-Informationen können je nach Börsenmöglichkeiten teilweise oder vollständig fehlen.
- Die `fee`-Währung kann von beiden gehandelten Währungen abweichen (zum Beispiel eine ETH/BTC-Order mit Gebühren in USD).
- Der Zeitstempel `lastTradeTimestamp` hat möglicherweise keinen Wert und kann `undefined/None/null` sein, wenn er von der Börse nicht unterstützt wird oder bei einer offenen Order (einer Order, die noch nicht ausgeführt oder teilweise ausgeführt wurde).
- `lastTradeTimestamp`, falls vorhanden, bezeichnet den Zeitstempel des letzten Trades, falls die Order vollständig oder teilweise ausgeführt ist, andernfalls ist `lastTradeTimestamp` `undefined/None/null`.
- Der `status` der Order hat Vorrang vor `lastTradeTimestamp`.
- Der `cost` einer Order ist: `{ filled * price }`
- Der `cost` einer Order bezeichnet das gesamte *Quote*-Volumen der Order (während `amount` das *Base*-Volumen ist). Der Wert von `cost` sollte so nah wie möglich an den tatsächlichen zuletzt bekannten Order-Kosten liegen. Das Feld `cost` ist größtenteils zur Vereinfachung vorhanden und kann aus anderen Feldern abgeleitet werden.
- Das Feld `clientOrderId` kann beim Platzieren von Orders durch den Benutzer mit [benutzerdefinierten Order-Parametern](#custom-order-params) gesetzt werden. Mithilfe der `clientOrderId` kann der Benutzer später zwischen eigenen Orders unterscheiden. Dies ist nur für Börsen verfügbar, die `clientOrderId` derzeit unterstützen.

#### timeInForce

Das Feld `timeInForce` kann `undefined/None/null` sein, wenn es von der Börse nicht angegeben wird. Die Vereinheitlichung von `timeInForce` ist noch in Bearbeitung.

Mögliche Werte für das Feld `timeInForce`:

- `'GTC'` = _Good Till Cancel(ed)_, die Order verbleibt im Orderbuch, bis sie abgeglichen oder storniert wird.
- `'IOC'` = _Immediate Or Cancel_, die Order muss sofort abgeglichen und entweder teilweise oder vollständig ausgeführt werden; der nicht ausgeführte Rest wird storniert (oder die gesamte Order wird storniert).
- `'FOK'` = _Fill Or Kill_, die Order muss sofort vollständig ausgeführt und geschlossen werden, andernfalls wird die gesamte Order storniert.
- `'PO'` = _Post Only_, die Order wird entweder als Maker-Order platziert oder wird storniert. Das bedeutet, dass die Order mindestens eine Zeit lang unausgeführt im Orderbuch stehen muss. Die Vereinheitlichung von `PO` als `timeInForce`-Option ist noch in Bearbeitung, wobei vereinheitlichte Börsen `exchange.has['createPostOnlyOrder'] == True` haben.

### Orders platzieren

Es gibt verschiedene Ordertypen, die ein Benutzer an die Börse senden kann; reguläre Orders landen schließlich im Orderbuch eines entsprechenden Symbols, andere Orders können fortgeschrittener sein. Hier ist eine Liste, die verschiedene Ordertypen umreißt:

- [Limit-Orders](#limit-orders) – reguläre Orders mit einem `amount` in der Basiswährung (wie viel Sie kaufen oder verkaufen möchten) und einem `price` in der Kurswährung (zu welchem Preis Sie kaufen oder verkaufen möchten).
- [Market-Orders](#market-orders) – reguläre Orders mit einem `amount` in der Basiswährung (wie viel Sie kaufen oder verkaufen möchten)
  - [Market-Käufe](#market-buys) – manche Börsen erfordern Market-Buy-Orders mit einem `amount` in der Kurswährung (wie viel Sie für den Kauf ausgeben möchten)
- [Trigger-Orders](#conditional-orders) aka *bedingte Orders* – ein fortgeschrittener Ordertyp, der dazu verwendet wird, auf eine bestimmte Marktbedingung zu warten und dann automatisch zu reagieren: wenn ein `triggerPrice` erreicht wird, wird die Trigger-Order ausgelöst und anschließend eine reguläre Limit-`price`- oder Market-Price-Order platziert, die letztendlich zum Eingehen oder Verlassen einer Position führt
- [Stop-Loss-Orders](#stop-loss-orders) – fast dasselbe wie Trigger-Orders, aber zum Schließen einer Position verwendet, um weitere Verluste bei dieser Position zu stoppen: wenn der Preis den `triggerPrice` erreicht, wird die Stop-Loss-Order ausgelöst, was dazu führt, dass eine weitere reguläre Limit- oder Market-Order platziert wird, um eine Position zu einem bestimmten Limit-`price` oder zum Marktpreis zu schließen (eine Position mit einer daran angehängten Stop-Loss-Order).
- [Take-Profit-Orders](#take-profit-orders) – ein Gegenstück zu Stop-Loss-Orders; dieser Ordertyp wird verwendet, um eine Position zu schließen und bestehende Gewinne bei dieser Position mitzunehmen: wenn der Preis den `triggerPrice` erreicht, wird die Take-Profit-Order ausgelöst, was dazu führt, dass eine weitere reguläre Limit- oder Market-Order platziert wird, um eine Position zu einem bestimmten Limit-`price` oder zum Marktpreis zu schließen (eine Position mit einer daran angehängten Take-Profit-Order).
- [StopLoss- und TakeProfit-Orders, die einer Position angehängt sind](#stoploss-and-takeprofit-orders-attached-to-a-position) – fortgeschrittene Orders, bestehend aus drei Orders der oben aufgeführten Typen: eine reguläre Limit- oder Market-Order, die zum Eingehen einer Position platziert wird, zusammen mit Stop-Loss- und/oder Take-Profit-Orders, die beim Öffnen dieser Position platziert werden und dazu verwendet werden, diese Position später zu schließen (wenn ein Stop-Loss erreicht wird, schließt er die Position und storniert das entsprechende Take-Profit-Gegenstück und umgekehrt; wenn ein Take-Profit erreicht wird, schließt er die Position und storniert das entsprechende Stop-Loss-Gegenstück; diese beiden Gegenstücke sind auch als „OCO-Orders – One Cancels the Other" bekannt); neben dem `amount` (und `price` für die Limit-Order) zum Öffnen einer Position ist auch ein `triggerPrice` für eine Stop-Loss-Order erforderlich (mit einem Limit-`price`, wenn es sich um eine Stop-Loss-Limit-Order handelt) und/oder ein `triggerPrice` für eine Take-Profit-Order (mit einem Limit-`price`, wenn es sich um eine Take-Profit-Limit-Order handelt).
- [Trailing-Orders](#trailing-orders) – eine Order, die automatisch relativ zu einer offenen Position angepasst wird; `trailingAmount` kann so eingestellt werden, dass ein bestimmter Kursbetrag hinter der offenen Position nachgeführt wird, oder `trailingPercent` kann so eingestellt werden, dass ein bestimmter Prozentsatz hinter der offenen Position nachgeführt wird; wenn der Marktpreis der Position gleich der Trailing-Order ist, führt dies je nachdem, ob der Parameter `reduceOnly` der Trailing-Order auf true gesetzt ist oder nicht, zum Eingehen einer neuen Position oder zum Verlassen einer Position.

Das Aufgeben einer Order erfordert immer ein `symbol`, das der Benutzer angeben muss (welchen Markt Sie handeln möchten).

Um eine Order aufzugeben, verwenden Sie die `createOrder`-Methode. Sie können die `id` aus der zurückgegebenen vereinheitlichten [Order-Struktur](#order-structure) verwenden, um den Status und den Zustand der Order später abzufragen. Wenn Sie mehrere Orders gleichzeitig aufgeben müssen, können Sie die Verfügbarkeit der `createOrders`-Methode prüfen.

```javascript
createOrder (symbol, type, side, amount, price = undefined, params = {})
```

```javascript
createOrders (orders, params = {}) // orders is a list in which each element contains a symbol, type, side, amount, price and params
```

Parameter

- **symbol** (String) *erforderlich* Vereinheitlichtes CCXT-Marktsymbol
  - Stellen Sie sicher, dass das betreffende Symbol bei der Zielbörse vorhanden und für den Handel verfügbar ist.
- **side** *erforderlich* ein Zeichenkettenliteral für die Richtung Ihrer Order.
  **Vereinheitlichte Seiten:**
  - `buy` Gibt Kurswährung ab und erhält Basiswährung; zum Beispiel bedeutet das Kaufen von `BTC/USD`, dass Sie Bitcoins für Ihre Dollar erhalten.
  - `sell` Gibt Basiswährung ab und erhält Kurswährung; zum Beispiel bedeutet das Verkaufen von `BTC/USD`, dass Sie Dollar für Ihre Bitcoins erhalten.
- **type** ein Zeichenkettenliteral-Typ der Order
  **Vereinheitlichte Typen:**
  - [market](#market-orders) von einigen Börsen nicht erlaubt, siehe [deren Dokumentation](#exchanges) für Details
  - [limit](#limit-orders)
  - siehe #custom-order-params und #other-order-types für nicht vereinheitlichte Typen
- **amount**, wie viel Währung Sie handeln möchten – üblicherweise, aber nicht immer, in Einheiten der Basiswährung des Handelspaar-Symbols (die Einheiten hängen bei einigen Börsen von der Seite der Order ab: siehe deren API-Dokumentation für Details.)
- **price** der Preis, zu dem die Order in Einheiten der Kurswährung ausgeführt werden soll (wird bei Market-Orders ignoriert)
- **params** (Dictionary) Zusätzliche Parameter spezifisch für den API-Endpunkt der Börse (z. B. `{"settle": "usdt"}`)

Rückgabe

- Ein erfolgreicher Order-Aufruf gibt eine [Order-Struktur](#order-structure) zurück

**Hinweise zu createOrder**

- Einige Börsen erlauben nur den Handel mit Limit-Orders.

Einige Felder der zurückgegebenen Order-Struktur können `undefined / None / null` sein, wenn diese Informationen nicht in der Antwort der Börsen-API enthalten sind. Dem Benutzer wird garantiert, dass die `createOrder`-Methode eine vereinheitlichte [Order-Struktur](#order-structure) zurückgibt, die mindestens die Order-`id` und die `info` (eine rohe Antwort der Börse „so wie sie ist") enthält:

```javascript
{
    'id': 'string',  // order id
    'info': { ... }, // decoded original JSON response from the exchange as is
}
```

##### Häufige Fallstricke

- Es gibt einen häufigen Fehler, der beim Erstellen von Orders für Kontraktmärkte auftritt:

```
"must be greater than minimum amount precision of 1"
```

Dieser Fehler tritt auf, wenn die Börse eine natürliche Anzahl von Kontrakten (1, 2, 3 usw.) im `amount`-Argument von `createOrder` erwartet. Die [Marktstruktur](#market-structure) hat einen Schlüssel namens `contractSize`. Jeder Kontrakt entspricht einem bestimmten Betrag des Basiswerts, der durch die `contractSize` bestimmt wird. Die Anzahl der Kontrakte multipliziert mit der `contractSize` ergibt den Basisbetrag. `Basisbetrag = (Kontrakte * contractSize)`. Um die Anzahl der Kontrakte abzuleiten, die Sie im `amount`-Argument eingeben sollen, können Sie nach Kontrakten auflösen: `Kontrakte = (Basisbetrag / contractSize)`.

Hier ist ein Beispiel für das Auffinden der `contractSize`:
```python
await exchange.loadMarkets()
symbol = 'BTC/USDT:USDT'
market = exchange.market(symbol)
print(market['contractSize'])

# Let's say you want to convert 0.5 BTC to the number of contracts:
number_contracts = round((0.5 * 1) / market['contractSize'])
```

#### Limit-Orders

Limit-Orders werden im Orderbuch der Börse zu einem vom Händler festgelegten Preis platziert. Sie werden ausgeführt (geschlossen), wenn keine Orders auf demselben Markt zu einem besseren Preis vorhanden sind und ein anderer Händler eine [Market-Order](#market-orders) oder eine entgegengesetzte Order zu einem Preis erstellt, der dem Preis der Limit-Order entspricht oder diesen übersteigt.

Limit-Orders werden möglicherweise nicht vollständig ausgeführt. Dies geschieht, wenn die ausführende Order für einen kleineren Betrag als den in der Limit-Order angegebenen Betrag ist.

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

#### Market-Orders

*auch bekannt als*

- Market-Price-Orders
- Spot-Price-Orders
- Sofort-Orders

Market-Orders werden sofort ausgeführt, indem eine oder mehrere bereits bestehende Orders von der Ask-Seite des Orderbuches der Börse erfüllt werden. Die Orders, die Ihre Market-Order erfüllt, werden von der Spitze des Orderbuchstapels ausgewählt, was bedeutet, dass Ihre Market-Order zum besten verfügbaren Preis ausgeführt wird. Beim Aufgeben einer Market-Order müssen Sie den Preis der Order nicht angeben, und wenn der Preis angegeben wird, wird er ignoriert.

Es ist nicht garantiert, dass die Order zum Preis ausgeführt wird, den Sie vor der Aufgabe Ihrer Order beobachtet haben. Dafür gibt es mehrere Gründe, darunter:

- **Preisrutsch (Slippage)** eine leichte Änderung des Preises für den gehandelten Markt, während Ihre Order ausgeführt wird. Gründe für Slippage umfassen unter anderem:

    - Netzwerklatenz (Roundtrip)
    - hohe Last auf der Börse
    - Preisvolatilität

- **Eindeutige Ordergrößen** wenn eine Market-Order für einen Betrag aufgegeben wird, der größer ist als die Größe der obersten Order im Orderbuch, wird nach der Ausführung der obersten Order die Market-Order mit der nächsten Order im Orderbuch fortgesetzt, was bedeutet, dass die Market-Order zu mehreren Preisen ausgeführt wird

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

**Beachten Sie, dass einige Börsen keine Market-Orders akzeptieren (sie erlauben nur Limit-Orders).** Um programmatisch zu erkennen, ob die betreffende Börse Market-Orders unterstützt oder nicht, können Sie die `.has['createMarketOrder']`-Eigenschaft der Börse verwenden:

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


#### Market-Käufe

Im Allgemeinen muss der Benutzer beim Aufgeben einer `market buy`- oder `market sell`-Order nur den Betrag der zu kaufenden oder zu verkaufenden Basiswährung angeben. Bei einigen Börsen implementieren Market-Buy-Orders jedoch einen anderen Ansatz zur Berechnung des Orderwerts.

Angenommen, Sie handeln BTC/USD und der aktuelle Marktpreis für BTC liegt bei über 9000 USD. Für einen Market-Kauf oder Market-Verkauf könnten Sie einen `amount` von 2 BTC angeben, was _plus oder minus_ 18000 USD (mehr oder weniger ;)) auf Ihrem Konto ergeben würde, abhängig von der Seite der Order.

**Bei Market-Käufen verlangen einige Börsen die Gesamtkosten der Order in der Kurswährung!** Die Logik dahinter ist einfach: Anstatt den Betrag der zu kaufenden oder zu verkaufenden Basiswährung zu nehmen, arbeiten einige Börsen mit _„wie viel Kurswährung Sie insgesamt beim Kauf ausgeben möchten"_.

Um eine Market-Buy-Order bei diesen Börsen aufzugeben, würden Sie keinen Betrag von 2 BTC angeben; stattdessen sollten Sie die Gesamtkosten der Order angeben, also in diesem Beispiel 18000 USD. Die Börsen, die `market buy`-Orders auf diese Weise behandeln, haben eine börsenspezifische Option `createMarketBuyOrderRequiresPrice`, die es ermöglicht, die Gesamtkosten einer `market buy`-Order auf zwei Arten anzugeben.

Die erste ist die Standardmethode: Wenn Sie den `price` zusammen mit dem `amount` angeben, werden die Gesamtkosten der Order innerhalb der Bibliothek aus diesen beiden Werten durch eine einfache Multiplikation berechnet (`cost = amount * price`). Die resultierenden `cost` entsprechen dem Betrag in USD-Kurswährung, der für diese bestimmte Market-Buy-Order ausgegeben wird.

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

Die zweite Alternative ist nützlich, wenn der Benutzer die resultierenden Gesamtkosten der Order selbst berechnen und angeben möchte. Dies kann durch Setzen der Option `createMarketBuyOrderRequiresPrice` auf `false` deaktiviert werden:

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

Mehr dazu:

- https://github.com/ccxt/ccxt/issues/564#issuecomment-347458566
- https://github.com/ccxt/ccxt/issues/4914#issuecomment-478199357
- https://github.com/ccxt/ccxt/issues/4799#issuecomment-470966769
- https://github.com/ccxt/ccxt/issues/5197#issuecomment-496270785

#### Emulieren von Market-Orders mit Limit-Orders

Es ist auch möglich, eine `market`-Order mit einer `limit`-Order zu emulieren.

**WARNUNG: Diese Methode kann aufgrund hoher Volatilität riskant sein; verwenden Sie sie auf eigenes Risiko und nur wenn Sie wirklich gut wissen, was Sie tun!**

Meistens kann ein `market sell` mit einem `limit sell` zu einem sehr niedrigen Preis emuliert werden – die Börse macht daraus automatisch eine Taker-Order zum Marktpreis (der Preis, der derzeit in Ihrem besten Interesse aus den im Orderbuch verfügbaren Preisen ist). Wenn die Börse erkennt, dass Sie zu einem sehr niedrigen Preis verkaufen, bietet sie Ihnen automatisch den besten verfügbaren Käuferpreis aus dem Orderbuch an. Das ist effektiv dasselbe wie das Aufgeben einer Market-Sell-Order. Daher können Market-Orders mit Limit-Orders emuliert werden (wo sie fehlen).

Das Gegenteil gilt ebenfalls – ein `market buy` kann mit einem `limit buy` zu einem sehr hohen Preis emuliert werden. Die meisten Börsen schließen Ihre Order dann erneut zum besten verfügbaren Preis, d. h. dem Marktpreis.

Sie sollten sich jedoch niemals vollständig darauf verlassen; **testen Sie es IMMER zuerst mit einem kleinen Betrag!** Sie können dies zuerst in der Web-Oberfläche ausprobieren, um die Logik zu überprüfen. Sie können den Mindestbetrag zu einem angegebenen Limit-Preis verkaufen (ein erschwinglicher Betrag, den Sie notfalls verlieren könnten) und dann den tatsächlichen Ausführungspreis in der Handelshistorie überprüfen.

#### Limit-Orders

Limit-Preis-Orders sind auch als *Limit-Orders* bekannt. Einige Börsen akzeptieren nur Limit-Orders. Limit-Orders erfordern die Angabe eines Preises (Rate pro Einheit) zusammen mit der Order. Die Börse schließt Limit-Orders genau dann, wenn der Marktpreis das gewünschte Niveau erreicht.

```javascript
// camelCaseStyle
exchange.createLimitBuyOrder (symbol, amount, price[, params])
exchange.createLimitSellOrder (symbol, amount, price[, params])

// underscore_style
exchange.create_limit_buy_order (symbol, amount, price[, params])
exchange.create_limit_sell_order (symbol, amount, price[, params])
```


#### Bedingte Orders

Aus dem traditionellen Handel stammend war der Begriff „Stop-Order" etwas mehrdeutig; daher verwenden wir in CCXT stattdessen den Begriff „Trigger"-Order. Wenn der Preis eines Symbols Ihren „Trigger"-(„Stop"-)Preis erreicht, wird die Order als `market`- oder `limit`-Order aktiviert, je nachdem, welche Sie gewählt haben.

Wir haben eine unterschiedliche Klassifizierung von Trigger-Orders:
1) eigenständige [Trigger-Order](#trigger-order) zum Kaufen/Verkaufen von Coins (Position öffnen/schließen)
2) eigenständige [Stop-Loss](#stop-loss-orders)- oder [Take-Profit](#take-profit-orders)-Order, die zum Schließen offener Positionen konzipiert sind.
3) eine Stop-Loss- oder Take-Profit-Order, die an eine primäre Order angehängt ist ([Bedingte Trigger-Order](#stoploss-and-takeprofit-orders-attached-to-a-position)).


##### Trigger-Order

Die traditionelle „Stop"-Order (die Sie möglicherweise auf den Websites von Börsen sehen) wird in der CCXT-Bibliothek jetzt als „Trigger"-Order bezeichnet. Implementiert durch Hinzufügen eines `triggerPrice`-Parameters. Es handelt sich um unabhängige einfache Trigger-Orders, die eine Position öffnen oder schließen können.

* Um sicherzustellen, dass die Börse diese Funktionalität unterstützt, überprüfen Sie `exchange.features` oder verwenden Sie die Hilfsmethode `exchange.featureValue('BTC/USDT', 'createOrder', 'triggerPrice')`.
* Typischerweise wird sie aktiviert, wenn der Preis des zugrunde liegenden Vermögenswerts/Kontrakts den `triggerPrice` **aus einer beliebigen Richtung** kreuzt. Einige Börsen-APIs verlangen jedoch auch die Angabe von `triggerDirection`, das die Order auslöst, je nachdem ob der Preis über oder unter dem `triggerPrice` liegt. Wenn Sie beispielsweise eine Limit-Order (Kauf von 0,1 `ETH` zum Limitpreis `1500`) auslösen möchten, sobald der Paarpreis `1700` kreuzt:


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


Typischerweise bestimmt die Börse automatisch die Richtung des `triggerPrice` (ob er „über" oder „unter" dem aktuellen Preis liegt), jedoch verlangen einige Börsen, dass Sie `triggerDirection` mit entweder `ascending`- oder `descending`-Werten angeben:

```
params = {
    'triggerPrice': 1700,
    'triggerDirection': 'ascending', // order will be triggered when price goes upward and touches 1700
}
```

Beachten Sie, dass Sie der Trigger-Order auch den Parameter `reduceOnly: true` (mit einem möglichen Parameter `triggerDirection: 'ascending/descending'`) hinzufügen können, damit sie als „Stop-Loss"- oder „Take-Profit"-Order fungiert. Für einige Börsen unterstützen wir jedoch „Stop-Loss"- und „Take-Profit"-Trigger-Order-Typen, die automatisch `reduceOnly`- und `triggerDirection`-Handling beinhalten (siehe diese unten).

##### Stop-Loss-Orders

Dasselbe wie Trigger-Orders, aber die Richtung ist entscheidend. Implementiert durch Angabe eines `stopLossPrice`-Parameters (für den Stop-Loss-triggerPrice); außerdem wird `triggerDirection` automatisch im Namen des Nutzers gesetzt, sodass Sie dies als Alternative zur regulären Trigger-Order verwenden können.

* Um sicherzustellen, dass die Börse diese Funktionalität unterstützt, prüfen Sie `exchange.features` oder verwenden Sie die Hilfsmethode `exchange.featureValue('BTC/USDT', 'createOrder', 'stopLossPrice')`.

Angenommen, Sie haben eine Long-Position (Sie haben gekauft) bei 1000 eröffnet und möchten sich vor Verlusten durch einen möglichen Kursrückgang unter 700 schützen. Sie würden eine Stop-Loss-Order mit einem triggerPrice bei 700 platzieren. Für diese Stop-Loss-Order geben Sie entweder einen Limitpreis an oder sie wird zum Marktpreis ausgeführt.

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

Angenommen, Sie haben eine Short-Position (Sie haben verkauft) bei 700 eröffnet und möchten sich vor Verlusten durch einen möglichen Kursanstieg über 1300 schützen. Sie würden eine Stop-Loss-Order mit einem triggerPrice bei 1300 platzieren. Für diese Stop-Loss-Order geben Sie entweder einen Limitpreis an oder sie wird zum Marktpreis ausgeführt.

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

Stop-Loss-Orders werden ausgelöst, wenn der Preis des zugrunde liegenden Vermögenswerts/Kontrakts:

* unter den `stopLossPrice` von oben fällt, bei Verkaufsorders. (z. B.: um eine Long-Position zu schließen und weitere Verluste zu vermeiden)
* über den `stopLossPrice` von unten steigt, bei Kauforders (z. B.: um eine Short-Position zu schließen und weitere Verluste zu vermeiden)


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


##### Take-Profit-Orders

Dasselbe wie Stop-Loss-Orders, aber die Richtung ist entscheidend. Implementiert durch Angabe eines `takeProfitPrice`-Parameters (für den Take-Profit-triggerPrice).

Angenommen, Sie haben eine Long-Position (Sie haben gekauft) bei 1000 eröffnet und möchten Ihre Gewinne aus einem möglichen Kursanstieg über 1300 mitnehmen. Sie würden eine Take-Profit-Order mit einem triggerPrice bei 1300 platzieren. Für diese Take-Profit-Order geben Sie entweder einen Limitpreis an oder sie wird zum Marktpreis ausgeführt.

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

Angenommen, Sie haben eine Short-Position (Sie haben verkauft) bei 700 eröffnet und möchten Ihre Gewinne aus einem möglichen Kursrückgang unter 600 mitnehmen. Sie würden eine Take-Profit-Order mit einem triggerPrice bei 600 platzieren. Für diese Take-Profit-Order geben Sie entweder einen Limitpreis an oder sie wird zum Marktpreis ausgeführt.

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

Take-Profit-Orders werden ausgelöst, wenn der Preis des zugrunde liegenden Vermögenswerts:

* über den `takeProfitPrice` von unten steigt, bei Verkaufsorders (z. B.: um eine Long-Position mit Gewinn zu schließen)
* unter den `takeProfitPrice` von oben fällt, bei Kauforders (z. B.: um eine Short-Position mit Gewinn zu schließen)


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


#### StopLoss- und TakeProfit-Orders, die einer Position zugeordnet sind

**Take-Profit**- / **Stop-Loss**-Orders, die an eine positionseröffnende Primärorder gebunden sind. Implementiert durch Übergabe eines Wörterbuch-Parameters für `stopLoss` und `takeProfit`, der jeweils die entsprechenden Angaben enthält.

* Standardmäßig entsprechen die Beträge von stopLoss- und takeProfit-Orders dem Betrag der Primärorder, jedoch in entgegengesetzter Richtung.
* Angehängte Trigger-Orders sind bedingt auf die Ausführung der Primärorder.
* Nicht von allen Börsen unterstützt. Um zu prüfen, ob Stop-Loss unterstützt wird, verwenden Sie folgenden Ansatz:
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


Für Börsen, bei denen es nicht möglich ist, angehängte SL &TP zu verwenden, können Sie nach dem Einreichen einer Einstiegsorder sofort eine weitere Order einreichen (auch wenn die Position möglicherweise noch nicht eröffnet ist) mit `stopLossPrice/takeProfitPrice` in `params` (oder `triggerPrice` und `reduceOnly: true`), sodass sie weiterhin als Stop-Loss-Order für Ihre zukünftige Position dienen kann (beachten Sie, dass dieser Ansatz bei manchen Börsen möglicherweise nicht funktioniert).

Beispiel:

```
    symbol = 'ADA/USDT:USDT'
    main_order = await binance.create_order(symbol, 'market', 'buy', 50) # open position
    tp_order = await binance.create_order(symbol, 'limit', 'sell', 50, 1.5, {"takeProfitPrice": 1.6}) # take profit order
    sl_order = await binance.create_order(symbol, 'limit', 'sell', 50, 0.24, {"stopLossPrice": 0.25}) # stop loss order
```

#### Trailing-Orders

**Trailing**-Orders folgen einer offenen Position. Implementiert durch Übergabe von Float-Parametern für `trailingPercent` oder `trailingAmount`.

* Eine Trailing-Order passt den Orderpreis kontinuierlich um einen festen Prozentsatz oder einen festen Quotierungsbetrag vom aktuellen Marktpreis an.
* Eine Trailing-Order folgt einer Position, solange sie sich in eine Richtung bewegt, jedoch nicht in die entgegengesetzte Richtung.
* Steigt der Positionswert, ändert sich die Trailing-Order; fällt der Positionswert, bleibt die Trailing-Order unverändert, bis die Order ausgeführt wird.
* Eine Trailing-Order kann unabhängig nach dem Eröffnen einer Position platziert werden.
* Implementiert durch Ausfüllen des Parameters `trailingPercent` oder `trailingAmount`, je nach Börse.
* Das Preisargument kann als `trailingTriggerPrice` verwendet werden, und das Typargument kann genutzt werden, um bei Bedarf zwischen Limit- und Market-Trailing-Orders zu unterscheiden.

*Nicht von allen Börsen unterstützt.*

*Hinweis: Dies befindet sich noch in der Vereinheitlichung und ist ein laufendes Projekt*


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


#### Benutzerdefinierte Order-Parameter

Einige Börsen erlauben Ihnen, optionale Parameter für Ihre Order anzugeben. Sie können optionale Parameter übergeben und Ihre Anfrage mit einem assoziativen Array über das `params`-Argument Ihres Unified-API-Aufrufs überschreiben. Alle benutzerdefinierten Parameter sind natürlich börsenspezifisch und nicht austauschbar; erwarten Sie nicht, dass benutzerdefinierte Parameter einer Börse bei einer anderen Börse funktionieren.


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


##### Benutzerdefinierte `clientOrderId`

```text
- this part of the unified API is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

Der Nutzer kann ein benutzerdefiniertes `clientOrderId`-Feld angeben, das beim Platzieren von Orders mit den `params` gesetzt werden kann. Mithilfe der `clientOrderId` können eigene Orders später unterschieden werden. Dies ist derzeit nur für Börsen verfügbar, die `clientOrderId` unterstützen. Bei Börsen, die es nicht unterstützen, wird entweder ein Fehler beim Angeben der `clientOrderId` ausgelöst oder sie wird ignoriert, wobei die `clientOrderId` auf `undefined/None/null` gesetzt wird.


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


##### Hedge-Modus für Orders

Wenn die Börse das [Feature](#features) für `hedged`-Orders unterstützt, kann der Nutzer `params['hedged'] = true` in `createOrder` übergeben, um eine `hedged`-Position anstelle der standardmäßigen `one-way`-Mode-Order zu eröffnen. Wenn die Börse jedoch `.has['setPositionMode']` unterstützt, unterstützen diese Börsen möglicherweise den `hedged`-Parameter nicht direkt über `createOrder`; stattdessen müssen Sie bei solchen Börsen zunächst den Kontomodus mit [setPositionMode()](#set-position-mode) ändern und dann `createOrder` (ohne den `hedged`-Parameter) ausführen, wodurch standardmäßig eine Hedge-Order platziert wird.


### Orders bearbeiten

Um eine Order zu bearbeiten, können Sie die Methode `editOrder` verwenden

```javascript
editOrder (id, symbol, type, side, amount, price = undefined, params = {})
```

Parameter

- **id** (String) *erforderlich* Order-ID (z. B. `1645807945000`)
- **symbol** (String) *erforderlich* Einheitliches CCXT-Marktsymbol
- **side** (String) *erforderlich* die Richtung Ihrer Order.
  **Einheitliche Seiten:**
  - `buy` Quotierungswährung abgeben und Basiswährung erhalten; z. B. bedeutet der Kauf von `BTC/USD`, dass Sie Bitcoins für Ihre Dollar erhalten.
  - `sell` Basiswährung abgeben und Quotierungswährung erhalten; z. B. bedeutet der Verkauf von `BTC/USD`, dass Sie Dollar für Ihre Bitcoins erhalten.
- **type** (String) *erforderlich* Order-Typ
  **Einheitliche Typen:**
  - [`market`](#market-orders) von manchen Börsen nicht erlaubt, siehe [deren Dokumentation](#exchanges) für Details
  - [`limit`](#limit-orders)
  - siehe #custom-order-params und #other-order-types für nicht einheitliche Typen
- **amount** (Number) *erforderlich* Wie viel Währung Sie handeln möchten, normalerweise, aber nicht immer, in Einheiten der Basiswährung des Handelspaarsymbols (die Einheiten sind bei manchen Börsen von der Seite der Order abhängig: siehe deren API-Dokumentation für Details.)
- **price** (Float) der Preis, zu dem die Order in Einheiten der Quotierungswährung erfüllt werden soll (bei Market-Orders ignoriert)
- **params** (Dictionary) Zusätzliche börsenspezifische Parameter für den API-Endpunkt (z. B. `{"settle": "usdt"}`)

Rückgabe

- Eine [Order-Struktur](#order-structure)

### Orders stornieren

Um eine bestehende Order zu stornieren, verwenden Sie

- `cancelOrder ()` für eine einzelne Order
- `cancelOrders ()` für mehrere Orders
- `cancelAllOrders ()` für alle offenen Orders
- `cancelAllOrdersAfter ()` für alle offenen Orders nach dem angegebenen Timeout

```javascript
cancelOrder (id, symbol = undefined, params = {})
```

Parameter

- **id** (String) *erforderlich* Order-ID (z. B. `1645807945000`)
- **symbol** (String) Einheitliches CCXT-Marktsymbol **erforderlich** bei manchen Börsen (z. B. `"BTC/USDT"`)
- **params** (Dictionary) Zusätzliche börsenspezifische Parameter für den API-Endpunkt (z. B. `{"settle": "usdt"}`)

Rückgabe

- Eine [Order-Struktur](#order-structure)

```javascript
cancelOrders (ids, symbol = undefined, params = {})
```

Parameter

- **ids** (\[String\]) *erforderlich* Order-IDs (z. B. `1645807945000`)
- **symbol** (String) Einheitliches CCXT-Marktsymbol **erforderlich** bei manchen Börsen (z. B. `"BTC/USDT"`)
- **params** (Dictionary) Zusätzliche börsenspezifische Parameter für den API-Endpunkt (z. B. `{"settle": "usdt"}`)

Rückgabe

- Ein Array von [Order-Strukturen](#order-structure)

```javascript
async cancelAllOrders (symbol = undefined, params = {})
```

Parameter

- **symbol** (String) Einheitliches CCXT-Marktsymbol **erforderlich** bei manchen Börsen (z. B. `"BTC/USDT"`)
- **params** (Dictionary) Zusätzliche börsenspezifische Parameter für den API-Endpunkt (z. B. `{"settle": "usdt"}`)

Rückgabe

- Ein Array von [Order-Strukturen](#order-structure)

```javascript
async cancelAllOrdersAfter (timeout, params = {})
```

Parameter

- **timeout** (number) Countdown-Zeit in Millisekunden **erforderlich** bei manchen Börsen, 0 bricht den Timer ab (z. B. ``10``\ )
- **params** (Dictionary) Zusätzliche börsenspezifische Parameter für den API-Endpunkt (z. B. ``{"type": "spot"}``\ )

Rückgabe

- Ein Objekt

#### Ausnahmen beim Stornieren von Orders

`cancelOrder()` wird normalerweise nur für offene Orders verwendet. Es kann jedoch vorkommen, dass Ihre Order ausgeführt (gefüllt und geschlossen) wird, bevor Ihre Stornierungsanfrage eintrifft, sodass eine Stornierungsanfrage auf eine bereits geschlossene Order treffen kann.

Eine Stornierungsanfrage kann auch eine `OperationFailed`-Ausnahme auslösen, die darauf hinweist, dass die Order möglicherweise erfolgreich storniert wurde oder auch nicht, und ob Sie es erneut versuchen müssen. Aufeinanderfolgende Aufrufe von `cancelOrder()` können ebenfalls auf eine bereits stornierte Order treffen.

Daher kann `cancelOrder()` in folgenden Fällen eine `OrderNotFound`-Ausnahme auslösen:
- Stornieren einer bereits geschlossenen Order
- Stornieren einer bereits stornierten Order

## Meine Trades

```text
- this part of the unified API is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

### Wie Orders mit Trades zusammenhängen

Ein Trade wird auch häufig als `Fill` bezeichnet. Jeder Trade ist das Ergebnis der Ausführung einer Order. Beachten Sie, dass Orders und Trades eine Eins-zu-viele-Beziehung haben: Die Ausführung einer Order kann zu mehreren Trades führen. Wenn jedoch eine Order eine andere entgegengesetzte Order trifft, ergibt das Paar der beiden übereinstimmenden Orders einen Trade. Wenn eine Order also mehrere entgegengesetzte Orders trifft, ergibt dies mehrere Trades, einen Trade pro Paar übereinstimmender Orders.

Kurz gesagt kann eine Order *einen oder mehrere* Trades enthalten. Mit anderen Worten kann eine Order mit einem oder mehreren Trades *gefüllt* werden.

Zum Beispiel kann ein Orderbuch folgende Orders enthalten (unabhängig vom Handelssymbol oder -paar):

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

Alle obigen spezifischen Zahlen sind nicht real; sie dienen lediglich zur Veranschaulichung, wie Orders und Trades im Allgemeinen miteinander zusammenhängen.

Ein Verkäufer beschließt, eine Verkaufs-Limit-Order auf der Ask-Seite zu einem Preis von 0,700 und einem Betrag von 150 zu platzieren.

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

Da Preis und Betrag der eingehenden Verkaufsorder (Ask) mehr als eine Kauf-Order (Bid) abdecken (Orders `b` und `i`), geschieht innerhalb einer Börsenmaschinerie normalerweise sehr schnell, aber nicht sofort, folgende Abfolge von Ereignissen:

1. Order `b` wird gegen die eingehende Verkaufsorder abgeglichen, da ihre Preise sich überschneiden. Ihre Volumina *"vernichten sich gegenseitig"*, sodass der Bieter 100 zu einem Preis von 0,800 erhält. Der Verkäufer (Asker) wird seine Verkaufsorder teilweise mit dem Bid-Volumen von 100 zu einem Preis von 0,800 gefüllt haben. Beachten Sie, dass der Verkäufer für den gefüllten Teil der Order einen besseren Preis erhält, als er ursprünglich verlangt hat. Er hat mindestens 0,7 verlangt, aber stattdessen 0,8 erhalten, was für den Verkäufer noch besser ist. Die meisten konventionellen Börsen füllen Orders zum besten verfügbaren Preis.

2. Für die Order `b` wird ein Trade gegen die eingehende Verkaufsorder erzeugt. Dieser Trade *"füllt"* die gesamte Order `b` und den Großteil der Verkaufsorder. Pro Paar übereinstimmender Orders wird ein Trade erzeugt, unabhängig davon, ob die Menge vollständig oder teilweise gefüllt wurde. In diesem Beispiel füllt die Verkäufermenge (100) die Order `b` vollständig (schließt Order `b`) und füllt die Verkaufsorder teilweise (lässt sie offen im Orderbuch).

3. Order `b` hat nun den Status `closed` und ein gefülltes Volumen von 100. Sie enthält einen Trade gegen die Verkaufsorder. Die Verkaufsorder hat den Status `open` und ein gefülltes Volumen von 100. Sie enthält einen Trade gegen Order `b`. Somit hat jede Order bislang genau einen Füllungs-Trade.

4. Die eingehende Verkaufsorder hat eine gefüllte Menge von 100 und muss noch die verbleibende Menge von 50 aus ihrer ursprünglichen Gesamtmenge von 150 füllen.

Der Zwischenzustand des Orderbuchs ist nun (Order `b` ist `closed` und nicht mehr im Orderbuch):

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

5. Order `i` wird gegen den verbleibenden Teil der eingehenden Verkaufsorder abgeglichen, da sich ihre Preise überschneiden. Die Menge der Kauforder `i` beträgt 200 und vernichtet vollständig die verbleibende Verkaufsmenge von 50. Order `i` wird teilweise um 50 gefüllt, aber der Rest ihres Volumens, nämlich die verbleibende Menge von 150, verbleibt im Orderbuch. Die Verkaufsorder wird jedoch durch diesen zweiten Abgleich vollständig erfüllt.

6. Für die Order `i` wird ein Trade gegen die eingehende Verkaufsorder erzeugt. Dieser Trade füllt Order `i` teilweise und schließt die Füllung der Verkaufsorder ab. Auch dies ist nur ein Trade für ein Paar übereinstimmender Orders.

7. Order `i` hat nun den Status `open`, eine gefüllte Menge von 50 und eine verbleibende Menge von 150. Sie enthält einen Füllungs-Trade gegen die Verkaufsorder. Die Verkaufsorder hat nun den Status `closed` und hat ihre gesamte ursprüngliche Menge von 150 vollständig gefüllt. Sie enthält jedoch zwei Trades: den ersten gegen Order `b` und den zweiten gegen Order `i`. Jede Order kann also einen oder mehrere Füllungs-Trades haben, je nachdem, wie ihre Volumina durch die Exchange-Engine abgeglichen wurden.

Nachdem die obige Sequenz stattgefunden hat, sieht das aktualisierte Orderbuch wie folgt aus.

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

Beachten Sie, dass Order `b` verschwunden ist und die Verkaufsorder ebenfalls nicht mehr vorhanden ist. Alle geschlossenen und vollständig gefüllten Orders verschwinden aus dem Orderbuch. Order `i`, die teilweise gefüllt wurde und noch ein verbleibendes Volumen und den Status `open` hat, ist weiterhin vorhanden.

### Eigene Trades

Die meisten einheitlichen Methoden geben entweder ein einzelnes Objekt oder ein einfaches Array (eine Liste) von Objekten (Trades) zurück. Allerdings werden sehr wenige Exchanges (wenn überhaupt) alle Trades auf einmal zurückgeben. Meistens begrenzen ihre APIs die Ausgabe auf eine bestimmte Anzahl aktuellster Objekte. **SIE KÖNNEN NICHT ALLE OBJEKTE VOM ANFANG BIS ZUR GEGENWART IN EINEM EINZIGEN AUFRUF ABRUFEN**. In der Praxis werden sehr wenige Exchanges dies tolerieren oder erlauben.

Wie bei allen anderen einheitlichen Methoden zum Abrufen historischer Daten akzeptiert die Methode `fetchMyTrades` ein `since`-Argument für die [datumsbasierte Paginierung](#date-based-pagination). Wie bei allen anderen einheitlichen Methoden in der gesamten CCXT-Bibliothek muss das `since`-Argument für `fetchMyTrades` ein **ganzzahliger Zeitstempel in Millisekunden** sein.

Um historische Trades abzurufen, muss der Benutzer die Daten in Portionen oder "Seiten" von Objekten durchlaufen. Paginierung bedeutet oft *"das Abrufen von Datenportionen nacheinander"* in einer Schleife.

In vielen Fällen ist ein `symbol`-Argument durch die APIs der Exchanges erforderlich, daher müssen Sie über alle Symbole iterieren, um alle Ihre Trades zu erhalten. Wenn das `symbol` fehlt und die Exchange es erfordert, wird CCXT eine `ArgumentsRequired`-Ausnahme auslösen, um den Benutzer auf diese Anforderung hinzuweisen. Das `symbol` muss dann angegeben werden. Ein Ansatz besteht darin, die relevanten Symbole aus der Liste aller Symbole zu filtern, indem man nicht-null-Salden sowie Transaktionen (Abhebungen und Einzahlungen) berücksichtigt. Außerdem haben Exchanges eine Begrenzung, wie weit man in der Zeit zurückgehen kann.

In den meisten Fällen sind Benutzer **verpflichtet, mindestens eine Art von [Paginierung](#pagination)** zu verwenden, um konsistent die erwarteten Ergebnisse zu erhalten.


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


Gibt ein geordnetes Array `[]` von Trades zurück (neuester Trade zuletzt).

#### Trade-Struktur

Trades bezeichnen den Tausch einer Währung gegen eine andere, im Gegensatz zu [Transaktionen](#transaction-structure), die eine Übertragung einer bestimmten Münze bezeichnen.

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

- Die Arbeit an `'fee'`- und `'fees'`-Informationen ist noch im Gange; Gebühreninformationen können teilweise oder vollständig fehlen, abhängig von den Fähigkeiten der Exchange.
- Die `fee`-Währung kann sich von beiden gehandelten Währungen unterscheiden (zum Beispiel eine ETH/BTC-Order mit Gebühren in USD).
- Die `cost` des Trades bedeutet `amount * price`. Es ist das gesamte *Quote*-Volumen des Trades (während `amount` das *Base*-Volumen ist). Das `cost`-Feld selbst dient hauptsächlich der Bequemlichkeit und kann aus anderen Feldern abgeleitet werden.
- Die `cost` des Trades ist ein _"Brutto"_-Wert. Das ist der Wert vor Gebühren, und die Gebühr muss nachträglich angewendet werden.

### Trades nach Order-ID

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


## Hauptbuch

Das Hauptbuch ist einfach die Historie der Änderungen, Aktionen des Benutzers oder Operationen, die das Guthaben des Benutzers in irgendeiner Weise verändert haben, das heißt, die Historie der Bewegungen aller Gelder von/zu allen Konten des Benutzers, einschließlich

- Einzahlungen und Abhebungen (Finanzierung)
- eingehende und ausgehende Beträge als Ergebnis eines Trades oder einer Order
- Handelsgebühren
- Überweisungen zwischen Konten
- Rückerstattungen, Cashbacks und andere Arten von Ereignissen, die der Buchführung unterliegen.

Daten zu Hauptbucheinträgen können abgerufen werden mit

- `fetchLedgerEntry ()` für einen Hauptbucheintrag
- `fetchLedger ( code )` für mehrere Hauptbucheinträge derselben Währung
- `fetchLedger ()` für alle Hauptbucheinträge

```javascript
fetchLedgerEntry (id, code = undefined, params = {})
```

Parameter

- **id** (String) *erforderlich* Hauptbucheintrag-ID
- **code** (String) Einheitlicher CCXT-Währungscode, erforderlich (z. B. `"USDT"`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"type": "deposit"}`)

Rückgabe

- Eine [Hauptbucheintrag-Struktur](#ledger-entry-structure)

```javascript
async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {})
```

Parameter

- **code** (String) Einheitlicher CCXT-Währungscode; *erforderlich*, wenn das gleichzeitige Abrufen aller Hauptbucheinträge für alle Assets nicht unterstützt wird (z. B. `"USDT"`)
- **since** (Integer) Zeitstempel (ms) des frühesten Zeitpunkts, für den Abhebungen abgerufen werden sollen (z. B. `1646940314000`)
- **limit** (Integer) Die Anzahl der abzurufenden [Hauptbucheintrag-Strukturen](#ledger-entry-structure) (z. B. `5`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Ein Array von [Hauptbucheintrag-Strukturen](#ledger-entry-structure)

### Hauptbucheintrag-Struktur

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

#### Hinweise zur Hauptbucheintrag-Struktur

Der Typ des Hauptbucheintrags ist der Typ der damit verbundenen Operation. Wenn der Betrag durch eine Verkaufsorder entsteht, ist er mit einem entsprechenden Trade-Typ-Hauptbucheintrag verknüpft, und die referenceId enthält die zugehörige Trade-ID (sofern die betreffende Exchange diese bereitstellt). Wenn der Betrag durch eine Abhebung abgeht, ist er mit einer entsprechenden Transaktion verknüpft.

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

Das Feld `referenceId` enthält die ID des entsprechenden Ereignisses, das durch Hinzufügen eines neuen Eintrags zum Hauptbuch registriert wurde.

Das Feld `status` dient der Unterstützung von Exchanges, die ausstehende und stornierte Änderungen im Hauptbuch enthalten. Das Hauptbuch repräsentiert naturgemäß die tatsächlich stattgefundenen Änderungen, daher ist der Status in den meisten Fällen `'ok'`.

Der Hauptbucheintrag-Typ kann mit einem regulären Trade oder einer Finanzierungstransaktion (Einzahlung oder Abhebung) oder einer internen `transfer`-Überweisung zwischen zwei Konten desselben Benutzers verknüpft sein. Wenn der Hauptbucheintrag mit einer internen Überweisung verknüpft ist, enthält das Feld `account` die ID des Kontos, das durch den betreffenden Hauptbucheintrag verändert wird. Das Feld `referenceAccount` enthält die ID des gegenüberliegenden Kontos, zu/von dem die Gelder überwiesen werden, abhängig von der `direction` (`'in'` oder `'out'`).

## Einzahlung

Um Kryptowährungsguthaben auf einer Exchange einzuzahlen, müssen Sie mit `fetchDepositAddress` eine Adresse von der Exchange für die gewünschte Einzahlungswährung abrufen. Anschließend können Sie die Methode `withdraw` mit der angegebenen Währung und Adresse aufrufen.

Um Fiat-Währung auf einer Exchange einzuzahlen, können Sie die Methode `deposit` mit Daten verwenden, die von der Methode `fetchDepositMethodId` abgerufen wurden.
*Diese Einzahlungsfunktion wird derzeit nur auf coinbase unterstützt; bitte melden Sie alle gefundenen Probleme*

- `deposit ()`

```javascript
deposit (id, code = undefined, params = {})
```

Parameter

- **id** (String) *erforderlich* Einzahlungs-ID
- **code** (String) Fiat-Währungscode, erforderlich (z. B. `"USD"`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"account": "fiat"}`)

Rückgabe

- Eine [Transaktionsstruktur](#transaction-structure)

- `fetchDepositMethodId ()`

```javascript
fetchDepositMethodId (id, params = {})
```

Parameter

- **id** (String) *erforderlich* Einzahlungs-ID
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"account": "fiat"}`)

Rückgabe

- Eine [Einzahlungs-ID-Struktur](#deposit-id-structure)

- `fetchDepositMethodIds ()`

```javascript
fetchDepositMethodIds (params = {})
```

Parameter

- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"account": "fiat"}`)

Rückgabe

- Ein Array von [Einzahlungs-ID-Strukturen](#deposit-id-structure)

### Einzahlungs-ID-Struktur

Die von `fetchDepositMethodId` und `fetchDepositMethodIds` zurückgegebene Einzahlungs-ID-Struktur sieht wie folgt aus:

```javascript
{
    'info': {},                 // raw unparsed data as returned from the exchange
    'id': '75ab52ff-f25t',      // the deposit id
    'currency': 'USD',          // fiat currency
    'verified': true,           // whether funding through this id is verified or not
    'tag': 'from credit card',  // tag / memo / name of funding source
}
```

Daten zu auf einem Konto getätigten Einzahlungen können abgerufen werden mit

- `fetchDeposit ()` für eine einzelne Einzahlung
- `fetchDeposits ( code )` für mehrere Einzahlungen derselben Währung
- `fetchDeposits ()` für alle Einzahlungen auf ein Konto

```javascript
fetchDeposit (id, code = undefined, params = {})
```

Parameter

- **id** (String) *erforderlich* Einzahlungs-ID
- **code** (String) Einheitlicher CCXT-Währungscode, erforderlich (z. B. `"USDT"`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"network": "TRX"}`)

Rückgabe

- Eine [Transaktionsstruktur](#transaction-structure)

```javascript
fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {})
```

Parameter

- **code** (String) Einheitlicher CCXT-Währungscode (z. B. `"USDT"`)
- **since** (Integer) Zeitstempel (ms) des frühesten Zeitpunkts, für den Einzahlungen abgerufen werden sollen (z. B. `1646940314000`)
- **limit** (Integer) Die Anzahl der abzurufenden [Transaktionsstrukturen](#transaction-structure) (z. B. `5`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Ein Array von [Transaktionsstrukturen](#transaction-structure)

## Abhebung

Die Methode `withdraw` kann verwendet werden, um Gelder von einem Konto abzuheben.

Einige Exchanges erfordern eine manuelle Genehmigung jeder Abhebung mittels 2FA (Zwei-Faktor-Authentifizierung). Um Ihre Abhebung zu genehmigen, müssen Sie in der Regel entweder auf einen geheimen Link in Ihrem E-Mail-Posteingang klicken oder einen Google Authenticator-Code oder einen Authy-Code auf deren Website eingeben, um zu bestätigen, dass die Abhebungstransaktion absichtlich angefordert wurde.

In einigen Fällen können Sie auch die Abhebungs-ID verwenden, um den Abhebungsstatus später zu überprüfen (ob sie erfolgreich war oder nicht) und um 2FA-Bestätigungscodes einzureichen, sofern dies von der Exchange unterstützt wird. Weitere Einzelheiten finden Sie in [deren Dokumentation](#exchanges).

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


Parameter

- **code** (String) *erforderlich* Einheitlicher CCXT-Währungscode (z. B. `"USDT"`)
- **amount** (Float) *erforderlich* Der auszuzahlende Betrag der Währung (z. B. `20`)
- **address** (String) *erforderlich* Die Empfängeradresse der Auszahlung (z. B. `"TEY6qjnKDyyq5jDc3DJizWLCdUySrpQ4yp"`)
- **tag** (String) Für einige Netzwerke erforderlich (z. B. `"52055"`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"network": "TRX"}`)

Rückgabe

- Eine [Transaktionsstruktur](#transaction-structure)

---

Daten zu Auszahlungen auf ein Konto können abgerufen werden mit

- `fetchWithdrawal ()` für eine einzelne Auszahlung
- `fetchWithdrawals ( code )` für mehrere Auszahlungen derselben Währung
- `fetchWithdrawals ()` für alle Auszahlungen von einem Konto

```javascript
fetchWithdrawal (id, code = undefined, params = {})
```

Parameter

- **id** (String) *erforderlich* Auszahlungs-ID
- **code** (String) Einheitlicher CCXT-Währungscode (z. B. `"USDT"`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"network": "TRX"}`)

```javascript
fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {})
```

Parameter

- **code** (String) Einheitlicher CCXT-Währungscode (z. B. `"USDT"`)
- **since** (Integer) Zeitstempel (ms) des frühesten Zeitpunkts, für den Auszahlungen abgerufen werden sollen (z. B. `1646940314000`)
- **limit** (Integer) Die Anzahl der abzurufenden [Transaktionsstrukturen](#transaction-structure) (z. B. `5`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Ein Array von [Transaktionsstrukturen](#transaction-structure)

### Ein- und Auszahlungsnetzwerke

Es ist auch möglich, die Parameter als viertes Argument mit oder ohne angegebenen Tag zu übergeben

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


Die folgenden Aliase von `network` ermöglichen das Abheben von Kryptowährungen über mehrere Chains

| Währung | Netzwerk |
|:---:|:---:|
| ETH  | ERC20 |
| TRX  | TRC20 |
| BSC  | BEP20 |
| BNB  | BEP2  |
| HT   | HECO  |
| OMNI | OMNI  |

Sie können den Wert von `exchange.withdraw ('USDT', 100, 'TVJ1fwyJ1a8JbtUxZ8Km95sDFN9jhLxJ2D', { 'network': 'TRX' })` setzen, um USDT auf der TRON-Chain abzuheben, oder `'BSC'`, um USDT auf der Binance Smart Chain abzuheben. In der obigen Tabelle sind BSC und BEP20 gleichwertige Aliase, daher spielt es keine Rolle, welchen Sie verwenden, da beide denselben Effekt erzielen.

### Transaktionsstruktur

Transaktionen bezeichnen die Übertragung einer bestimmten Münze, im Gegensatz zu [Trades](#trade-structure), die den Tausch einer Währung gegen eine andere bezeichnen.

- *Einzahlungsstruktur*
- *Auszahlungsstruktur*

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

#### Hinweise zur Transaktionsstruktur

- `addressFrom` oder `addressTo` können `undefined/None/null` sein, wenn der betreffende Exchange nicht alle Seiten der Transaktion angibt
- Die Semantik des Feldes `address` ist exchange-spezifisch. In manchen Fällen kann es die Adresse des Absenders enthalten, in anderen Fällen kann es die Adresse des Empfängers enthalten. Der tatsächliche Wert hängt vom Exchange ab.
- Das Feld `updated` ist der UTC-Zeitstempel in Millisekunden der jüngsten Statusänderung dieser Finanzierungsoperation, sei es `withdrawal` oder `deposit`. Es ist notwendig, wenn Sie Ihre Änderungen über die Zeit verfolgen möchten und nicht nur einen statischen Snapshot betrachten. Wenn der betreffende Exchange beispielsweise `created_at` und `confirmed_at` für eine Transaktion meldet, nimmt das Feld `updated` den Wert von `Math.max (created_at, confirmed_at)` an, also den Zeitstempel der jüngsten Statusänderung.
- Das Feld `updated` kann in bestimmten exchange-spezifischen Fällen `undefined/None/null` sein.
- Die Unterstruktur `fee` kann fehlen, wenn sie in der vom Exchange kommenden Antwort nicht enthalten ist.
- Das Feld `comment` kann `undefined/None/null` sein, andernfalls enthält es eine vom Benutzer beim Erstellen der Transaktion definierte Nachricht oder Notiz.
- Seien Sie vorsichtig beim Umgang mit `tag` und `address`. Der `tag` ist **KEIN beliebiger benutzerdefinierter String** Ihrer Wahl! Sie können keine Benutzernachrichten und Kommentare im `tag` senden. Der Zweck des Feldes `tag` ist es, Ihre Wallet korrekt zu adressieren, daher muss er korrekt sein. Sie sollten nur den `tag` verwenden, den Sie vom Exchange erhalten, mit dem Sie arbeiten, da Ihre Transaktion sonst möglicherweise nie ihr Ziel erreicht.
- Das Feld `type` kann `deposit/withdrawal` sein oder in einigen Fällen (wenn der Endpunkt des Exchanges sowohl interne Überweisungen als auch Blockchain-Transaktionen zurückgibt, z. B. `ccxt.coinlist`) `transfer` sein.

### fetchDeposits-Beispiele

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


### fetchWithdrawals-Beispiele


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


### fetchTransactions-Beispiele


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


## Einzahlungsadressen

Die Adresse für Einzahlungen kann entweder eine bereits vorhandene Adresse sein, die zuvor beim Exchange erstellt wurde, oder sie kann auf Anfrage erstellt werden. Um zu sehen, welche der beiden Methoden unterstützt werden, prüfen Sie die Eigenschaften `exchange.has['fetchDepositAddress']` und `exchange.has['createDepositAddress']`.

```javascript
fetchDepositAddress (code, params = {})
createDepositAddress (code, params = {})
```

Parameter

- **code** (String) *erforderlich* Einheitlicher CCXT-Währungscode (z. B. `"USDT"`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- eine [Adressstruktur](#address-structure)

---

Einige Exchanges können auch eine Methode zum gleichzeitigen Abrufen mehrerer oder aller Einzahlungsadressen haben.

```javascript
fetchDepositAddresses (codes = undefined, params = {})
```

Parameter

- **code** (\[String\]) Array von einheitlichen CCXT-Währungscodes. Kann je nach Exchange erforderlich sein oder nicht (z. B. `["USDT", "BTC"]`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- ein Array von [Adressstrukturen](#address-structure)

```javascript
fetchDepositAddressesByNetwork (code, params = {})
```

Parameter

- **code** (String) *erforderlich* Einheitlicher CCXT-Währungscode (z. B. `"USDT"`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- ein Array von [Adressstrukturen](#address-structure)

### Adressstruktur

Die von `fetchDepositAddress`, `fetchDepositAddresses`, `fetchDepositAddressesByNetwork` und `createDepositAddress` zurückgegebenen Adressstrukturen sehen wie folgt aus:

```javascript
{
    'info': response,       // raw unparsed data as returned from the exchange
    'currency': 'USDC',     // currency code
    'network': 'ERC20',     // a deposit/withdraw networks, ERC20, TRC20, BSC20 (see below)
    'address': '0x',        // blockchain address in terms of the requested currency and network
    'tag': undefined,       // tag / memo / paymentId for particular currencies (XRP, XMR, ...)
}
```

Bei bestimmten Währungen wie AEON, BTS, GXS, NXT, SBD, STEEM, STR, XEM, XLM, XMR, XRP wird von Exchanges in der Regel ein zusätzliches Argument `tag` benötigt. Bei anderen Währungen wird der `tag` auf `undefined / None / null` gesetzt. Der Tag ist ein Memo, eine Nachricht oder eine Zahlungs-ID, die einer Auszahlungstransaktion beigefügt ist. Der Tag ist für diese Währungen obligatorisch und identifiziert das Empfänger-Benutzerkonto.

Seien Sie vorsichtig bei der Angabe von `tag` und `address`. Der `tag` ist **KEIN beliebiger benutzerdefinierter String** Ihrer Wahl! Sie können keine Benutzernachrichten und Kommentare im `tag` senden. Der Zweck des Feldes `tag` ist es, Ihre Wallet korrekt zu adressieren, daher muss er korrekt sein. Sie sollten nur den `tag` verwenden, den Sie vom Exchange erhalten, mit dem Sie arbeiten, da Ihre Transaktion sonst möglicherweise nie ihr Ziel erreicht.

**Das Feld `network` ist relativ neu, es kann in bestimmten Fällen (bei einigen Exchanges) `undefined / None / null` sein oder vollständig fehlen, wird aber schließlich überall hinzugefügt. Es befindet sich noch im Vereinheitlichungsprozess.**

## Überweisungen

Die Methode `transfer` führt interne Überweisungen von Geldern zwischen Konten auf demselben Exchange durch. Dies kann Unterkonten oder Konten verschiedener Typen (`spot`, `margin`, `future`, ...) umfassen. Wenn ein Exchange in CCXT in eine Spot- und eine Futures-Klasse aufgeteilt ist (z. B. `binanceusdm`, `kucoinfutures`, ...), kann die Methode `transferIn` verfügbar sein, um Gelder auf das Futures-Konto einzuzahlen, und die Methode `transferOut` kann verfügbar sein, um Gelder vom Futures-Konto abzuheben

```javascript
transfer (code, amount, fromAccount, toAccount, params = {})
```

Parameter

- **code** (String) Einheitlicher CCXT-Währungscode (z. B. `"USDT"`)
- **amount** (Float) Der zu überweisende Betrag der Währung (z. B. `10.5`)
- **fromAccount** (String) Das Konto, von dem Gelder überwiesen werden sollen.
- **toAccount** (String) Das Konto, auf das Gelder überwiesen werden sollen.
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"endTime": 1645807945000}`)
- **params.symbol** (String) Marktsymbol beim Überweisen auf oder von einem Margin-Konto (z. B. `'BTC/USDT'`)

### Kontotypen

`fromAccount` und `toAccount` können die Exchange-Konto-ID oder einen der folgenden einheitlichen Werte akzeptieren:

- `funding` *bei einigen Exchanges sind `funding` und `spot` dasselbe Konto*
- `main` *für einige Exchanges, die Unterkonten erlauben*
- `spot`
- `margin`
- `future`
- `swap`
- `lending`

Sie können alle Kontotypen abrufen, indem Sie die Schlüssel aus `exchange.options['accountsByType']` auswählen

Einige Exchanges erlauben Überweisungen an E-Mail-Adressen, Telefonnummern oder an andere Benutzer per Benutzer-ID.

Rückgabe

- Eine [Überweisungsstruktur](#transfer-structure)

```javascript
transferIn (code, amount, params = {})
transferOut (code, amount, params = {})
```

Parameter

- **code** (String) Einheitlicher CCXT-Währungscode (z. B. `"USDT"`)
- **amount** (Float) Der zu überweisende Betrag der Währung (z. B. `10.5`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Eine [Überweisungsstruktur](#transfer-structure)

```javascript
fetchTransfers (code = undefined, since = undefined, limit = undefined, params = {})
```

Parameter

- **code** (String) Einheitlicher CCXT-Währungscode (z. B. `"USDT"`)
- **since** (Integer) Zeitstempel (ms) des frühesten Zeitpunkts, für den Überweisungen abgerufen werden sollen (z. B. `1646940314000`)
- **limit** (Integer) Die Anzahl der abzurufenden [Überweisungsstrukturen](#transfer-structure) (z. B. `5`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Ein Array von [Überweisungsstrukturen](#transfer-structure)

```javascript
fetchTransfer (id, since = undefined, limit = undefined, params = {})
```

Parameter

- **id** (String) Überweisungs-ID (z. B. `"12345"`)
- **since** (Integer) Zeitstempel (ms) des frühesten Zeitpunkts, für den Überweisungen abgerufen werden sollen (z. B. `1646940314000`)
- **limit** (Integer) Die Anzahl der abzurufenden [Überweisungsstrukturen](#transfer-structure) (z. B. `5`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Eine [Überweisungsstruktur](#transfer-structure)

### Überweisungsstruktur

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
## Gebühren

**Dieser Abschnitt der einheitlichen CCXT-API befindet sich in der Entwicklung.**

Gebühren werden häufig in zwei Kategorien eingeteilt:

- Handelsgebühren. Die Handelsgebühr ist der an den Exchange zu zahlende Betrag, in der Regel ein Prozentsatz des gehandelten (ausgeführten) Volumens.
- Transaktionsgebühren. Der bei Ein- und Auszahlungen an den Exchange zu zahlende Betrag sowie die zugrunde liegenden Krypto-Transaktionsgebühren (tx fees).

Da die Gebührenstruktur vom tatsächlichen Handelsvolumen der Währungen des Benutzers abhängen kann, können die Gebühren kontospezifisch sein. Methoden zur Arbeit mit kontospezifischen Gebühren:

```javascript
fetchTradingFee (symbol, params = {})
fetchTradingFees (params = {})
fetchDepositWithdrawFees (codes = undefined, params = {})
fetchDepositWithdrawFee (code, params = {})
```


Die Gebührenmethoden geben eine einheitliche Gebührenstruktur zurück, die häufig auch bei Orders und Trades vorhanden ist. Die Gebührenstruktur ist ein gemeinsames Format zur Darstellung der Gebühreninformationen in der gesamten Bibliothek. Gebührenstrukturen sind in der Regel nach Markt oder Währung indiziert.

Da dies noch in Arbeit ist, können einige oder alle der in diesem Abschnitt beschriebenen Methoden und Informationen bei diesem oder jenem Exchange fehlen.

**Verwenden Sie NICHT die Eigenschaft `.fees` der Exchange-Instanz, da diese meistens die vordefinierten/fest codierten Informationen enthält. Tatsächliche Gebühren sollten nur aus Märkten und Währungen abgerufen werden.**

**HINWEIS: Früher haben wir fetchTransactionFee(s) verwendet, um Transaktionsgebühren abzurufen. Diese Funktion ist nun VERALTET und wurde durch fetchDepositWithdrawFee(s) ersetzt.**

Sie rufen `fetchTradingFee` / `fetchTradingFees` auf, um Handelsgebühren abzurufen, und `fetchDepositWithdrawFee` / `fetchDepositWithdrawFees`, um Ein- und Auszahlungsgebühren abzurufen.

### Gebührenstruktur

Aufträge, private Trades, Transaktionen und Kontoeinträge können die folgenden Informationen in ihrem `fee`-Feld definieren:

```javascript
{
    'currency': 'BTC', // the unified fee currency code
    'rate': percentage, // the fee rate, 0.05% = 0.0005, 1% = 0.01, ...
    'cost': feePaid, // the fee cost (amount * fee rate)
}
```

### Gebührenplan

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

### Handelsgebühren

Handelsgebühren sind Eigenschaften von Märkten. Meistens werden Handelsgebühren durch den `fetchMarkets`-Aufruf in die Märkte geladen. Manchmal stellen Börsen die Gebühren jedoch über separate Endpunkte bereit.

Die Methode `calculateFee` kann verwendet werden, um Handelsgebühren vorauszuberechnen, die bezahlt werden (verwenden Sie `calculateFeeWithRate`, wenn Sie eine benutzerdefinierte Handelsgebühr / -stufe haben, wie z. B. VIP-X, anstelle der Standard-Benutzergebühr). **WARNUNG! Diese Methode ist experimentell, instabil und kann in bestimmten Fällen falsche Ergebnisse liefern.** Sie sollten sie nur mit Vorsicht verwenden. Die tatsächlichen Gebühren können von den Werten abweichen, die von `calculateFee` zurückgegeben werden; dies dient nur der Vorausberechnung. Verlassen Sie sich nicht auf vorausberechnete Werte, da sich die Marktbedingungen häufig ändern. Es ist schwer vorherzusagen, ob Ihre Order ein Market-Taker oder ein Maker sein wird.

```javascript
    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {})
    calculateFeeWithRate (symbol, type, side, amount, price, takerOrMaker = 'taker', customRate, params = {})
```

Die Methode `calculateFee` gibt eine einheitliche Gebührenstruktur mit vorausberechneten Gebühren für eine Order mit den angegebenen Parametern zurück.

Der Zugriff auf Handelsgebührensätze sollte über [`fetchTradingFees`](#fee-schedule) erfolgen, was der empfohlene Ansatz ist. Wenn diese Methode von der Börse nicht unterstützt wird, dann über die `.markets`-Eigenschaft, wie folgt:

```javascript
exchange.markets['ETH/BTC']['taker'] // taker fee rate for ETH/BTC
exchange.markets['BTC/USD']['maker'] // maker fee rate for BTC/USD
```

Die unter der `.markets`-Eigenschaft gespeicherten Märkte können zusätzliche gebührenbezogene Informationen enthalten:

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

**WARNUNG! Gebührenbezogene Informationen sind experimentell, instabil und möglicherweise nur teilweise oder gar nicht verfügbar.**

Maker-Gebühren werden bezahlt, wenn Sie dem Markt Liquidität zur Verfügung stellen, d. h. wenn Sie eine Order als *Market-Maker* aufgeben und jemand anderes diese ausführt. Maker-Gebühren sind in der Regel niedriger als Taker-Gebühren. Ebenso werden Taker-Gebühren bezahlt, wenn Sie *Liquidität vom Markt nehmen* und die Order eines anderen ausführen.

Gebühren können negativ sein, was bei Derivatebörsen sehr verbreitet ist. Eine negative Gebühr bedeutet, dass die Börse dem Benutzer für den Handel eine Rückvergütung (Belohnung) zahlt.

Außerdem geben einige Börsen Gebühren möglicherweise nicht als Prozentsatz des Volumens an; überprüfen Sie das `percentage`-Feld des Marktes, um sicherzugehen.

#### Handelsgebührenplan

Einige Börsen verfügen über einen Endpunkt zum Abrufen des Handelsgebührenplans; dieser ist den einheitlichen Methoden `fetchTradingFees` und `fetchTradingFee` zugeordnet.

```javascript
fetchTradingFee (symbol, params = {})
```

Parameter

- **symbol** (String) *erforderlich* Einheitliches Marktsymbol (z. B. `"BTC/USDT"`)
- **params** (Dictionary) Parameter spezifisch für den Börsen-API-Endpunkt (z. B. `{"currency": "quote"}`)

Rückgabe

- Eine [Handelsgebührenstruktur](#trading-fee-structure)

```javascript
fetchTradingFees (params = {})
```

Parameter

- **params** (Dictionary) Parameter spezifisch für den Börsen-API-Endpunkt (z. B. `{"currency": "quote"}`)

Rückgabe

- Ein Array von [Handelsgebührenstrukturen](#trading-fee-structure)

#### Handelsgebührenstruktur

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

### Transaktionsgebühren

Transaktionsgebühren sind Eigenschaften von Währungen (Kontostand).

Der Zugriff auf Transaktionsgebührensätze sollte über die `.currencies`-Eigenschaft erfolgen. Dieser Aspekt ist noch nicht vereinheitlicht und kann sich ändern.

```javascript
exchange.currencies['ETH']['fee'] // tx/withdrawal fee rate for ETH
exchange.currencies['BTC']['fee'] // tx/withdrawal fee rate for BTC
```

#### Transaktionsgebührenplan

Einige Börsen verfügen über einen Endpunkt zum Abrufen des Transaktionsgebührenplans; dieser ist den folgenden einheitlichen Methoden zugeordnet:

- `fetchTransactionFee ()` für einen einzelnen Transaktionsgebührenplan
- `fetchTransactionFees ()` für alle Transaktionsgebührenpläne

```javascript
fetchTransactionFee (code, params = {})
```

Parameter

- **code** (String) *erforderlich* Einheitlicher CCXT-Währungscode, erforderlich (z. B. `"USDT"`)
- **params** (Dictionary) Parameter spezifisch für den Börsen-API-Endpunkt (z. B. `{"type": "deposit"}`)
- **params.network** (String) Einheitliches CCXT-Netzwerk angeben (z. B. `{"network": "TRC20"}`)

Rückgabe

- Eine [Transaktionsgebührenstruktur](#transaction-fee-structure)

```javascript
fetchTransactionFees (codes = undefined, params = {})
```

Parameter

- **params** (Dictionary) Parameter spezifisch für den Börsen-API-Endpunkt (z. B. `{"type": "deposit"}`)

Rückgabe

- Ein Array von [Transaktionsgebührenstrukturen](#transaction-fee-structure)

#### Transaktionsgebührenstruktur

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

## Darlehenszinsen

* nur Margin

Um mit Hebel an Spot- oder Margin-Märkten zu handeln, muss Währung als Darlehen geliehen werden. Dieses geliehene Kapital muss zuzüglich Zinsen zurückgezahlt werden. Um den aufgelaufenen Zinsbetrag zu erhalten, können Sie die Methode `fetchBorrowInterest` verwenden.

```javascript
fetchBorrowInterest (code = undefined, symbol = undefined, since = undefined, limit = undefined, params = {})
```

Parameter

- **code** (String) Der einheitliche Währungscode für die Währung der Zinsen (z. B. `"USDT"`)
- **symbol** (String) Das Marktsymbol eines isolierten Margin-Marktes; wenn nicht definiert, werden die Zinsen für Cross-Margin-Märkte zurückgegeben (z. B. `"BTC/USDT:USDT"`)
- **since** (Integer) Zeitstempel (ms) des frühesten Zeitpunkts, für den Zinsdatensätze abgerufen werden sollen (z. B. `1646940314000`)
- **limit** (Integer) Die Anzahl der abzurufenden [Darlehenszinsstrukturen](#borrow-interest-structure) (z. B. `5`)
- **params** (Dictionary) Parameter spezifisch für den Börsen-API-Endpunkt (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Ein Array von [Darlehenszinsstrukturen](#borrow-interest-structure)

### Darlehenszinsstruktur

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

## Margin leihen und zurückzahlen

*nur Margin*

Um Währung als Margin-Darlehen zu leihen und zurückzuzahlen, verwenden Sie `borrowCrossMargin`, `borrowIsolatedMargin`, `repayCrossMargin` und `repayIsolatedMargin`.

```javascript
borrowCrossMargin (code, amount, params = {})
repayCrossMargin (code, amount, params = {})
```
Parameter

- **code** (String) *erforderlich* Der einheitliche Währungscode für die zu leihende oder zurückzuzahlende Währung (z. B. `"USDT"`)
- **amount** (Float) *erforderlich* Der Betrag der zu leihenden oder zurückzuzahlenden Margin (z. B. `20.92`)
- **params** (Dictionary) Parameter spezifisch für den Börsen-API-Endpunkt (z. B. `{"rate": 0.002}`)

Rückgabe

- Eine [Margin-Darlehensstruktur](#margin-loan-structure)

```javascript
borrowIsolatedMargin (symbol, code, amount, params = {})
repayIsolatedMargin (symbol, code, amount, params = {})
```
Parameter

- **symbol** (String) *erforderlich* Das einheitliche CCXT-Marktsymbol eines isolierten Margin-Marktes (z. B. `"BTC/USDT"`)
- **code** (String) *erforderlich* Der einheitliche Währungscode für die zu leihende oder zurückzuzahlende Währung (z. B. `"USDT"`)
- **amount** (Float) *erforderlich* Der Betrag der zu leihenden oder zurückzuzahlenden Margin (z. B. `20.92`)
- **params** (Dictionary) Parameter spezifisch für den Börsen-API-Endpunkt (z. B. `{"rate": 0.002}`)

Rückgabe

- Eine [Margin-Darlehensstruktur](#margin-loan-structure)

### Margin-Darlehensstruktur

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

## Margin

*nur Margin und Kontrakte*

Hinweis: Im Handbuch verwenden wir den Begriff "Sicherheiten" (collateral), der den aktuellen Margin-Saldo bezeichnet; verwechseln Sie ihn nicht mit "Initial Margin" oder "Maintenance Margin":
- `Sicherheiten (aktueller Margin-Saldo) = Initial Margin + realisierter & unrealisierter Gewinn`.

Wenn Sie beispielsweise eine isolierte Position mit einer Initial Margin von **50$** eröffnet haben und die Position einen unrealisierten Verlust von **-15$** aufweist, betragen Ihre **Sicherheiten** für diese Position **35$**. Falls jedoch die von der Börse angegebene Maintenance-Margin-Anforderung (um die Position offen zu halten) **25$** für diese Position beträgt, dürfen Ihre Sicherheiten nicht darunter fallen, da die Position sonst liquidiert wird.

Um Ihren Margin-Saldo (Sicherheiten) in einer offenen gehebelten Position zu erhöhen, zu reduzieren oder festzulegen, verwenden Sie jeweils `addMargin`, `reduceMargin` und `setMargin`. Dies ähnelt der Anpassung des Hebels einer bereits offenen Position.

Einige Anwendungsszenarien für diese Methoden sind:
- Wenn der Handel gegen Sie läuft, können Sie Margin hinzufügen, um das Liquidationsrisiko zu verringern.
- Wenn Ihr Handel gut läuft, können Sie den Margin-Saldo Ihrer Position reduzieren und Gewinne mitnehmen.

```javascript
addMargin (symbol, amount, params = {})
reduceMargin (symbol, amount, params = {})
setMargin (symbol, amount, params = {})
```


Parameter

- **symbol** (String) *erforderlich* Einheitliches CCXT-Marktsymbol (z. B. `"BTC/USDT:USDT"`)
- **amount** (String) *erforderlich* Betrag der hinzuzufügenden oder zu reduzierenden Margin (z. B. `20`)
- **params** (Dictionary) Parameter spezifisch für den Börsen-API-Endpunkt (z. B. `{"leverage": 5}`)

Rückgabe

- eine [Margin-Struktur](#margin-structure)

Sie können den Verlauf der Margin-Anpassungen, die mit den oben genannten Methoden oder automatisch durch die Börse vorgenommen wurden, mit der folgenden Methode abrufen:

```javascript
fetchMarginAdjustmentHistory (symbol = undefined, type = undefined, since = undefined, limit = undefined, params = {})
```

Parameter

- **symbol** (String) Einheitliches CCXT-Marktsymbol (z. B. `"BTC/USDT:USDT"`)
- **type** (String) "add" oder "reduce"
- **since** (Integer) Zeitstempel (ms) des frühesten Zeitpunkts, für den Margin-Anpassungen abgerufen werden sollen (z. B. `1646940314000`)
- **limit** (Integer) Die Anzahl der abzurufenden [Margin-Strukturen](#margin-structure) (z. B. `5`)
- **params** (Dictionary) Parameter spezifisch für den Börsen-API-Endpunkt (z. B. `{"auto": true}`)

Rückgabe

- eine [Margin-Struktur](#margin-structure)

### Margin-Struktur

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

## Margin-Modus festlegen

*nur Kontrakte*

Aktualisiert den verwendeten Margin-Typ auf einen der folgenden:

- `cross` Ein Konto wird verwendet, um Sicherheiten zwischen Märkten zu teilen. Bei Bedarf wird Margin vom gesamten Kontostand abgezogen, um eine Liquidation zu vermeiden.
- `isolated` Jeder Markt hält die Sicherheiten in einem separaten Konto.

```javascript
setMarginMode (marginMode, symbol = undefined, params = {})
```

Parameter

- **marginMode** (String) *erforderlich* der verwendete Margin-Typ
    **Einheitliche Margin-Typen:**
    - `"cross"`
    - `"isolated"`
- **symbol** (String) Einheitliches CCXT-Marktsymbol (z. B. `"BTC/USDT:USDT"`) *erforderlich* bei den meisten Börsen. Nicht erforderlich, wenn der Margin-Modus nicht marktspezifisch ist.
- **params** (Dictionary) Parameter spezifisch für den Börsen-API-Endpunkt (z. B. `{"leverage": 5}`)

Rückgabe

- Antwort der Börse

### Börsen ohne setMarginMode

Häufige Gründe, warum eine Börse möglicherweise

```javascript
exchange.has['setMarginMode'] == false
```

nicht unterstützt:

- Die Börse bietet keinen Hebelhandel an.
- Die Börse bietet nur einen der Modi `cross` oder `isolated` an, aber nicht beide.
- Der Margin-Modus muss über einen börsenspezifischen Parameter in `params` bei Verwendung von `createOrder` festgelegt werden.

### Hinweise zu unterdrückten Fehlern bei setMarginMode

Einige Börsen-APIs geben eine Fehlerantwort zurück, wenn eine Anfrage gesendet wird, den Margin-Modus auf den bereits eingestellten Modus zu setzen (z. B. eine Anfrage zum Setzen des Margin-Modus auf `cross` für den Markt `BTC/USDT:USDT`, wenn das Konto bereits `BTC/USDT:USDT` auf Cross-Margin eingestellt hat). CCXT betrachtet dies nicht als Fehler, da das Endergebnis dem entspricht, was der Benutzer wollte; der Fehler wird daher unterdrückt und das Fehlerergebnis wird als Objekt zurückgegeben.

z. B.

```javascript
{ code: -4046, msg: 'No need to change margin type.' }
```

### Hinweise zum marginMode-Parameter

Einige Methoden erlauben die Verwendung eines `marginMode`-Parameters, der entweder auf `cross` oder `isolated` gesetzt werden kann. Dies kann nützlich sein, um den `marginMode` direkt in den Methoden-Parametern anzugeben, zur Verwendung mit Spot-Margin- oder Kontraktmärkten. Um einen Spot-Margin-Markt anzugeben, müssen Sie ein einheitliches Spot-Symbol verwenden oder den Markttyp auf Spot setzen, während Sie den `marginMode`-Parameter auf `cross` oder `isolated` setzen.

Spot-Margin-Order erstellen:

*Verwenden Sie ein einheitliches Spot-Symbol und setzen Sie dabei den `marginMode`-Parameter.*


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


## Margin-Modus abrufen

*nur Margin und Kontrakte*

Die Methode `fetchMarginMode()` kann verwendet werden, um den eingestellten Margin-Modus für einen Markt abzurufen. Die Methode `fetchMarginModes()` kann verwendet werden, um den eingestellten Margin-Modus für mehrere Märkte gleichzeitig abzurufen.

Sie können auf den eingestellten Margin-Modus wie folgt zugreifen:

- `fetchMarginMode()` (einzelnes Symbol)
- `fetchMarginModes([symbol1, symbol2, ...])` (mehrere Symbole)
- `fetchMarginModes()` (alle Marktsymbole)

```javascript
fetchMarginMode(symbol, params = {})
```

Parameter

- **symbol** (String) *erforderlich* Ein einheitliches CCXT-Symbol (z. B. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"subType": "linear"}`)

Rückgabe

- eine [Margin-Mode-Struktur](#margin-mode-structure)

```javascript
fetchMarginModes(symbols = undefined, params = {})
```

Parameter

- **symbols** (\[String\]) Eine Liste einheitlicher CCXT-Symbole (z. B. `[ "BTC/USDT:USDT" ]`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"subType": "linear"}`)

Rückgabe

- ein Array von [Margin-Mode-Strukturen](#margin-mode-structure)

### Margin-Mode-Struktur

```javascript
{
    "info": { ... }             // response from the exchange
    "symbol": "BTC/USDT:USDT",  // unified market symbol
    "marginMode": "cross",      // the margin mode either cross or isolated
}
```

## Hebel setzen

*nur Margin und Kontrakt*

```javascript
setLeverage (leverage, symbol = undefined, params = {})
```

Parameter

- **leverage** (Integer) *erforderlich* Der gewünschte Hebel
- **symbol** (String) Einheitliches CCXT-Marktsymbol (z. B. `"BTC/USDT:USDT"`) *erforderlich* bei den meisten Börsen. Nicht erforderlich, wenn der Hebel nicht marktspezifisch ist (z. B. wenn der Hebel für das Konto und nicht pro Markt gesetzt wird)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"marginMode": "cross"}`)

Rückgabe

- Antwort der Börse

## Hebel

*nur Margin und Kontrakt*

Die Methode `fetchLeverage()` kann verwendet werden, um den gesetzten Hebel für einen Markt abzurufen. Die Methode `fetchLeverages()` kann verwendet werden, um den gesetzten Hebel für mehrere Märkte auf einmal abzurufen.

Der gesetzte Hebel kann abgerufen werden mit:

- `fetchLeverage()` (einzelnes Symbol)
- `fetchLeverages([symbol1, symbol2, ...])` (mehrere Symbole)
- `fetchLeverages()` (alle Marktsymbole)

```javascript
fetchLeverage(symbol, params = {})
```

Parameter

- **symbol** (String) *erforderlich* Ein einheitliches CCXT-Symbol (z. B. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"marginMode": "cross"}`)

Rückgabe

- eine [Hebel-Struktur](#leverage-structure)

```javascript
fetchLeverages(symbols = undefined, params = {})
```

Parameter

- **symbols** (\[String\]) Eine Liste einheitlicher CCXT-Symbole (z. B. `[ "BTC/USDT:USDT" ]`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"marginMode": "cross"}`)

Rückgabe

- ein Array von [Hebel-Strukturen](#leverage-structure)

### Hebel-Struktur

```javascript
{
    "info": { ... }             // response from the exchange
    "symbol": "BTC/USDT:USDT",  // unified market symbol
    "marginMode": "cross",      // the margin mode either cross or isolated
    "longLeverage": 100,        // the set leverage for a long position
    "shortLeverage": 75,        // the set leverage for a short position
}
```

## Kontrakthandel

Dies kann Futures mit einem festgelegten Ablaufdatum, unbefristete Swaps mit Finanzierungszahlungen sowie inverse Futures oder Swaps umfassen.
Informationen zu den Positionen können je nach Börse von verschiedenen Endpunkten bereitgestellt werden.
Falls mehrere Endpunkte verschiedene Arten von Derivaten bedienen, verwendet CCXT standardmäßig nur die „linearen" (im Gegensatz zu den „inversen") Kontrakte oder die „Swap"- (im Gegensatz zu den „Future"-) Kontrakte.

### Positionen

*nur Kontrakt*

Um Informationen zu aktuell gehaltenen Positionen in Kontraktmärkten zu erhalten, verwenden Sie

- fetchPosition ()            // für einen einzelnen Markt
- fetchPositions ()           // für alle Positionen
- fetchAccountPositions ()    // TODO
- fetchPositionHistory ()     // für eine einzelne historische Position
- fetchPositionsHistory ()     // für historische Positionen

```javascript
fetchPosition (symbol, params = {})                         // for a single market
```

Parameter

- **symbol** (String) *erforderlich* Einheitliches CCXT-Marktsymbol (z. B. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Eine [Positions-Struktur](#position-structure)

```javascript
fetchPositions (symbols = undefined, params = {})
fetchAccountPositions (symbols = undefined, params = {})
```

Parameter

- **symbols** (\[String\]) Einheitliche CCXT-Marktsymbole, leer lassen um alle Positionen abzurufen (z. B. `["BTC/USDT:USDT"]`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Ein Array von [Positions-Strukturen](#position-structure)

```javascript
fetchPositionHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

Parameter

- **symbol** (\[String\]) Einheitliche CCXT-Marktsymbole, leer lassen um alle Positionen abzurufen (z. B. `["BTC/USDT:USDT"]`)
- **since** (Integer) Zeitstempel (ms) des frühesten Zeitpunkts, ab dem Positionen abgerufen werden sollen (z. B. `1646940314000`)
- **limit** (Integer) Die Anzahl der abzurufenden [Positions-Strukturen](#position-structure) (z. B. `5`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Ein Array von [Positions-Strukturen](#position-structure)

#### Positions-Struktur

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
Positionen ermöglichen es Ihnen, Geld von einer Börse zu leihen, um auf einem Markt long oder short zu gehen. Bei einigen Börsen müssen Sie eine Finanzierungsgebühr zahlen, um die Position offen zu halten.

Wenn Sie eine Long-Position eingehen, wetten Sie darauf, dass der Preis in der Zukunft höher sein wird und dass der Preis nie unter den `liquidationPrice` fällt.

Wenn sich der Preis des zugrunde liegenden Index ändert, ändert sich auch der unrealisierte Gewinn und Verlust und damit die Menge an Sicherheiten, die Sie noch in der Position haben (da Sie sie nur zum Marktpreis oder schlechter schließen können). Bei einem bestimmten Preis haben Sie keine Sicherheiten mehr übrig – dies wird als „Bust"- oder „Zero"-Preis bezeichnet. Jenseits dieses Punktes, wenn der Preis weit genug in die entgegengesetzte Richtung geht, fällt die Sicherheit der Position unter die `maintenanceMargin`. Die maintenanceMargin dient als Sicherheitspuffer zwischen Ihrer Position und negativen Sicherheiten – ein Szenario, in dem die Börse Verluste in Ihrem Namen erleidet. Um sich zu schützen, wird die Börse Ihre Position sofort liquidieren, wenn und falls dies eintritt. Auch wenn der Preis wieder über den Liquidationspreis steigt, erhalten Sie Ihr Geld nicht zurück, da die Börse alle `contracts`, die Sie gekauft haben, zum Marktpreis verkauft hat. Mit anderen Worten ist die maintenanceMargin eine versteckte Gebühr für die Geldleihe.

Es wird empfohlen, die `maintenanceMargin` und `initialMargin` anstelle der `maintenanceMarginPercentage` und `initialMarginPercentage` zu verwenden, da diese tendenziell genauer sind. Die maintenanceMargin kann aus anderen Faktoren außerhalb der maintenanceMarginPercentage berechnet werden, einschließlich der Finanzierungsrate und Taker-Gebühren, zum Beispiel bei [kucoin](https://futures.kucoin.com/contract/detail).

Ein inverser Kontrakt ermöglicht es Ihnen, BTC/USD long oder short zu gehen, indem Sie BTC als Sicherheit hinterlegen. Unsere API für inverse Kontrakte ist dieselbe wie für lineare Kontrakte. Die Beträge in einem inversen Kontrakt werden so angegeben, als würden sie in USD/BTC gehandelt, jedoch wird der Preis weiterhin in BTC/USD angegeben. Die Formel für den Gewinn und Verlust eines inversen Kontrakts lautet `(1/markPrice - 1/price) * contracts`. Der Gewinn und Verlust sowie die Sicherheiten werden nun in BTC angegeben, und die Anzahl der Kontrakte wird in USD angegeben.

#### Positionen schließen

*nur Kontrakt*

Um offene Positionen schnell mit einer Marktorder zu schließen, verwenden Sie

- closePosition (symbol)               // für einen einzelnen Markt
- closeAllPositions (symbol)           // für alle Positionen

```typescript
closePosition (symbol: string, side: OrderSide = undefined, params = {}): Promise<Order>
```

Parameter

- **symbol** (String) *erforderlich* Einheitliches CCXT-Marktsymbol (z. B. `"BTC/USDT:USDT"`)
- **side** *optional* ein Zeichenfolgenliteral für die Richtung Ihrer Order. Bei einigen Börsen erforderlich.
  **Einheitliche Seiten:**
  - `buy` gibt Kurswährung und erhält Basiswährung; zum Beispiel bedeutet der Kauf von `BTC/USD`, dass Sie Bitcoins für Ihre Dollar erhalten.
  - `sell` gibt Basiswährung und erhält Kurswährung; zum Beispiel bedeutet der Verkauf von `BTC/USD`, dass Sie Dollar für Ihre Bitcoins erhalten.
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Eine [Order-Struktur](#order-structure)

```typescript
closeAllPositions (params = {}): Promise<Position[]>
```

Parameter
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Eine Liste von [Order-Strukturen](#order-structure)


### Positionsmodus

*nur Margin und Kontrakt*

Methode zum Setzen des Positionsmodus:

```javascript
setPositionMode (hedged, symbol = undefined, params = {})
```

Parameter

- **hedged** (String) *erforderlich* Wert für den Hedging-Modus:
    - `true` - setzt auf den **Hedging**-Modus
    - `false` - setzt auf den **One-Way**-Modus
- **symbol** (String) Einheitliches CCXT-Marktsymbol (z. B. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt

Methode zum Abrufen des Positionsmodus:

```javascript
fetchPositionMode (symbol = undefined, params = {}) {
```

Parameter

- **symbol** (String) Einheitliches CCXT-Marktsymbol (z. B. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt

Rückgabe

```javascript
{
    'info': { ... },
    'hedged': true,
}
```


#### Liquidationspreis

Es ist der Preis, bei dem `initialMargin + unrealized = collateral = maintenanceMargin` gilt. Der Preis ist so weit in die entgegengesetzte Richtung Ihrer Position gegangen, dass nur noch maintenanceMargin-Sicherheiten übrig sind, und wenn er noch weiter geht, wird die Position negative Sicherheiten aufweisen.

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

### Finanzierungshistorie

*nur Kontrakt*

Unbefristete Swap-Kontrakte (auch bekannt als unbefristete Futures) halten einen Marktpreis aufrecht, der den Preis des Vermögenswerts widerspiegelt, auf dem sie basieren, weil Finanzierungsgebühren zwischen Händlern ausgetauscht werden, die Positionen in unbefristeten Swap-Märkten halten.

Wenn der Kontrakt zu einem Preis gehandelt wird, der höher ist als der Preis des Vermögenswerts, den er repräsentiert, zahlen Händler in Long-Positionen zu bestimmten Tageszeiten eine Finanzierungsgebühr an Händler in Short-Positionen, was mehr Händler dazu ermutigt, vor diesen Zeiten Short-Positionen einzugehen.

Wenn der Kontrakt zu einem Preis gehandelt wird, der niedriger ist als der Preis des Vermögenswerts, den er repräsentiert, zahlen Händler in Short-Positionen zu bestimmten Tageszeiten eine Finanzierungsgebühr an Händler in Long-Positionen, was mehr Händler dazu ermutigt, vor diesen Zeiten Long-Positionen einzugehen.

Diese Gebühren werden normalerweise direkt zwischen Händlern ausgetauscht, ohne dass eine Provision an die Börse geht.

Die Methode `fetchFundingHistory` kann verwendet werden, um die Kontohistorie der gezahlten oder erhaltenen Finanzierungsgebühren abzurufen.

```javascript
fetchFundingHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

Parameter

- **symbol** (String) Einheitliches CCXT-Marktsymbol (z. B. `"BTC/USDT:USDT"`)
- **since** (Integer) Zeitstempel (ms) des frühesten Zeitpunkts, ab dem die Finanzierungshistorie abgerufen werden soll (z. B. `1646940314000`)
- **limit** (Integer) Die Anzahl der abzurufenden [Finanzierungshistorie-Strukturen](#funding-history-structure) (z. B. `5`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"endTime": 1645807945000}`)

Rückgabe

- Ein Array von [Finanzierungshistorie-Strukturen](#funding-history-structure)

#### Finanzierungshistorie-Struktur

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


### Umtausch

Die Methode `fetchConvertQuote` kann verwendet werden, um ein Angebot abzurufen, das für einen Umtauschhandel verwendet werden kann.
Das Angebot muss in der Regel innerhalb eines bestimmten, von der Börse angegebenen Zeitrahmens verwendet werden, damit der Umtauschhandel erfolgreich ausgeführt wird.

```javascript
fetchConvertQuote (fromCode, toCode, amount = undefined, params = {})
```

Parameter

- **fromCode** (String) *erforderlich* Der einheitliche Währungscode für die umzutauschende Währung (z. B. `"USDT"`)
- **toCode** (String) *erforderlich* Der einheitliche Währungscode für die Zielwährung (z. B. `"USDC"`)
- **amount** (Float) Umzutauschender Betrag in Einheiten der Ausgangswährung (z. B. `20.0`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"toAmount": 2.9722}`)

Rückgabe

- Eine [Umtausch-Struktur](#conversion-structure)

Die Methode `createConvertTrade` kann verwendet werden, um einen Umtauschhandelsauftrag mit der von fetchConvertQuote abgerufenen ID zu erstellen.
Das Angebot muss in der Regel innerhalb eines bestimmten, von der Börse angegebenen Zeitrahmens verwendet werden, damit der Umtauschhandel erfolgreich ausgeführt wird.

```javascript
createConvertTrade (id, fromCode, toCode, amount = undefined, params = {})
```

Parameter

- **id** (String) *erforderlich* Umtausch-Angebots-ID (z. B. `1645807945000`)
- **fromCode** (String) *erforderlich* Der einheitliche Währungscode für die umzutauschende Währung (z. B. `"USDT"`)
- **toCode** (String) *erforderlich* Der einheitliche Währungscode für die Zielwährung (z. B. `"USDC"`)
- **amount** (Float) Umzutauschender Betrag in Einheiten der Ausgangswährung (z. B. `20.0`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"toAmount": 2.9722}`)

Gibt zurück

- Eine [Konvertierungsstruktur](#conversion-structure)

Die Methode `fetchConvertTrade` kann verwendet werden, um einen bestimmten Konvertierungshandel anhand seiner ID abzurufen.

```javascript
fetchConvertTrade (id, code = undefined, params = {})
```

Parameter

- **id** (String) *erforderlich* ID des Konvertierungshandels (z. B. `"80794187SDHJ25"`)
- **code** (String) Der einheitliche Währungscode des Konvertierungshandels (z. B. `"USDT"`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"toAmount": 2.9722}`)

Gibt zurück

- Eine [Konvertierungsstruktur](#conversion-structure)

Die Methode `fetchConvertTradeHistory` kann verwendet werden, um die Konvertierungshistorie für einen angegebenen Währungscode abzurufen.

```javascript
fetchConvertTradeHistory (code = undefined, since = undefined, limit = undefined, params = {})
```

Parameter

- **code** (String) Der einheitliche Währungscode, für den die Konvertierungshandelshistorie abgerufen werden soll (z. B. `"USDT"`)
- **since** (Integer) Zeitstempel der frühesten Konvertierung (z. B. `1645807945000`)
- **limit** (Integer) Die maximale Anzahl der abzurufenden Konvertierungsstrukturen (z. B. `10`)
- **params** (Dictionary) Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"toAmount": 2.9722}`)

Gibt zurück

- Ein Array von [Konvertierungsstrukturen](#conversion-structure)

#### Konvertierungsstruktur

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

*nur für Kontrakte*

Verwenden Sie die Methoden `fetchPositionADLRank` oder `fetchPositionsADLRank`, um die privaten Details des Auto-De-Leverage-Rangs einer Position von der Börse abzurufen.

```javascript
fetchPositionADLRank (symbol, params = {})
```

Parameter

- **symbol** (String) Einheitliches CCXT-Marktsymbol (z. B. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Zusätzliche Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"category": "futures"}`)

Gibt zurück

- Eine [Auto-De-Leverage-Struktur](#auto-de-leverage)

```javascript
fetchPositionsADLRank (symbols, params = {})
```

Parameter

- **symbols** (\[String\]) Eine Liste einheitlicher CCXT-Symbole (z. B. `[ "BTC/USDT:USDT" ]`)
- **params** (Dictionary) Zusätzliche Parameter spezifisch für den Exchange-API-Endpunkt (z. B. `{"category": "futures"}`)

Gibt zurück

- Eine Liste von [Auto-De-Leverage-Strukturen](#auto-de-leverage)

### Auto-De-Leverage-Struktur

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


## Proxy

In einigen speziellen Fällen möchten Sie möglicherweise einen Proxy verwenden, wenn:
- Die Börse in Ihrem Standort nicht verfügbar ist
- Ihre IP von der Börse gesperrt wurde
- Sie zufällige Einschränkungen durch die Börse erleben, wie [DDoS-Schutz durch Cloudflare](#ddos-protection-by-cloudflare-incapsula)

Beachten Sie jedoch, dass jeder hinzugefügte Vermittler die Anfragen mit etwas Latenz belasten kann.

**Hinweis für Go-Benutzer:** Nach dem Setzen einer Proxy-Eigenschaft müssen Sie `UpdateProxySettings()` aufrufen, um die Änderungen anzuwenden:
```go
exchange := ccxt.NewBinance(nil)
exchange.ProxyUrl = "http://your-proxy-url:8080"
exchange.UpdateProxySettings()  // Required in Go to apply proxy settings
```
Beachten Sie jedoch, dass jeder hinzugefügte Vermittler die Anfragen mit etwas Latenz belasten kann.

### Unterstützte Proxy-Typen
CCXT unterstützt die folgenden Proxy-Typen (beachten Sie, dass jeder von ihnen auch [Callback-Unterstützung](#using-proxy-callbacks) hat):

#### proxyUrl

Diese Eigenschaft stellt einer API-Anfrage eine URL voran. Sie kann nützlich sein für einfache Umleitungen oder das [Umgehen von CORS-Browser-Beschränkungen](#cors-access-control-allow-origin).
```
ex = ccxt.binance();
ex.proxyUrl = 'YOUR_PROXY_URL';
```
wobei 'YOUR_PROXY_URL' beispielsweise so aussehen könnte (verwenden Sie den Schrägstrich entsprechend):
- `https://cors-anywhere.herokuapp.com/`
- `http://127.0.0.1:8080/`
- `http://your-website.com/sample-script.php?url=`
- usw.

Anfragen werden also z. B. an `https://cors-anywhere.herokuapp.com/https://exchange.xyz/api/endpoint` gestellt. (Sie können auch ein kleines Proxy-Skript auf Ihrem Gerät/Webserver ausführen und es in `.proxyUrl` verwenden – „sample-local-proxy-server" im [Beispielordner](https://github.com/ccxt/ccxt/tree/master/examples)). Um die Ziel-URL anzupassen, können Sie auch die Methode `urlEncoderForProxyUrl` der Instanz überschreiben.

Dieser Ansatz funktioniert **nur für REST**-Anfragen, nicht für WebSocket-Verbindungen. ((_Wie Sie testen, ob Ihr Proxy funktioniert_))[#test-if-your-proxy-works]

#### httpProxy und httpsProxy
Um einen echten http(s)-Proxy für Ihre Skripte einzurichten, benötigen Sie Zugriff auf einen entfernten [http- oder https-Proxy](https://stackoverflow.com/q/10440690/2377343), sodass Anfragen direkt an die Zielbörse gesendet werden, getunnelt durch Ihren Proxy-Server:
```
ex.httpProxy = 'http://1.2.3.4:8080/';
// or
ex.httpsProxy = 'http://1.2.3.4:8080/';
```
Dieser Ansatz betrifft nur **Nicht-WebSocket**-Anfragen von ccxt. Um die WebSocket-Verbindungen von CCXT durch einen Proxy zu leiten, müssen Sie zusätzlich zur Eigenschaft `httpProxy` (oder `httpsProxy`) auch die Eigenschaft `wsProxy` (oder `wssProxy`) setzen, sodass Ihr Skript so aussieht:
```
ex.httpProxy = 'http://1.2.3.4:8080/';
ex.wsProxy   = 'http://1.2.3.4:8080/';
```
Damit laufen beide Verbindungen (HTTP & WS) über Proxys.
((_Wie Sie testen, ob Ihr Proxy funktioniert_))[#test-if-your-proxy-works]


#### socksProxy
Sie können auch einen [SOCKS-Proxy](https://www.google.com/search?q=what+is+socks+proxy) im folgenden Format verwenden:
```
// from protocols: socks, socks5, socks5h
ex.socksProxy = 'socks5://1.2.3.4:8080/';
ex.wsSocksProxy = 'socks://1.2.3.4:8080/';
```
((_Wie Sie testen, ob Ihr Proxy funktioniert_))[#test-if-your-proxy-works]

#### Testen, ob Ihr Proxy funktioniert
Nachdem Sie eine der oben aufgeführten Proxy-Eigenschaften in Ihrem ccxt-Snippet gesetzt haben, können Sie testen, ob es funktioniert, indem Sie einige IP-Echo-Websites anpingen – prüfen Sie dazu eine „proxy-usage"-Datei in den [Beispielen](https://github.com/ccxt/ccxt/blob/master/examples/).

#### Proxy-Callbacks verwenden
**Anstatt eine Eigenschaft zu setzen, können Sie auch Callbacks `proxyUrlCallback, http(s)ProxyCallback, socksProxyCallback` verwenden**:
```
myEx.proxyUrlCallback = function (url, method, headers, body) { ... return 'http://1.2.3.4/'; }
```

### Weitere Proxy-Details

#### userAgent

Falls Sie es für besondere Fälle benötigen, können Sie die Eigenschaft `userAgent` wie folgt überschreiben:
```
exchange.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'
```

#### Benutzerdefinierte Proxy-Agenten

Abhängig von Ihrer Programmiersprache können Sie benutzerdefinierte Proxy-Agenten setzen.
 - Für JS, siehe [dieses Beispiel](
https://github.com/ccxt/ccxt/blob/master/examples/js/custom-proxy-agent-for-js.js)
 - Für Python, siehe die folgenden Beispiele: [proxies-for-synchronous-python](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxies-for-synchronous-python.py), [proxy-asyncio-aiohttp-python-3](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxy-asyncio-aiohttp-python-3.py), [proxy-asyncio-aiohttp-socks](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxy-asyncio-aiohttp-socks.py), [proxy-sync-python-requests-2-and-3](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxy-sync-python-requests-2-and-3.py)

#### CORS (Access-Control-Allow-Origin)

CORS (bekannt als [Cross-Origin Resource Sharing](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)) betrifft hauptsächlich Browser und ist die Ursache der bekannten Warnung `No 'Access-Control-Allow-Origin' header is present on the requested resource`. Dies geschieht, wenn ein Skript (das in einem Browser ausgeführt wird) eine Anfrage an eine Drittanbieter-Domain stellt (standardmäßig werden solche Anfragen blockiert, es sei denn, die Zieldomain erlaubt dies ausdrücklich).
In solchen Fällen müssen Sie daher mit einem „CORS"-Proxy kommunizieren, der Anfragen (im Gegensatz zu direkten browserseitigen Anfragen) an die Zielbörse weiterleitet. Um einen CORS-Proxy einzurichten, können Sie die Beispieldatei [sample-local-proxy-server-with-cors](https://github.com/ccxt/ccxt/blob/master/examples/) ausführen und in ccxt die Eigenschaft [`.proxyUrl`](#proxyurl) setzen, um Anfragen über den cors/proxy-Server zu leiten.

## String Math

Einige Benutzer möchten möglicherweise steuern, wie CCXT arithmetische Operationen verarbeitet. Obwohl standardmäßig numerische Typen verwendet werden, können Benutzer mithilfe von String-Typen auf Festkomma-Mathematik umschalten. Dies kann wie folgt erreicht werden:


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


# Fehlerbehandlung

- [Wiederholungsmechanismus](#retry-mechanism)
- [Ausnahmehierarchie](#exception-hierarchy)
- [ExchangeError](#exchangeerror)
- [OperationFailed](#operationfailed)
- [DDoSProtection](#ddosprotection)
- [RateLimitExceeded](#ratelimitexceeded)
- [RequestTimeout](#requesttimeout)
- [RequestTimeout](#requesttimeout)
- [ExchangeNotAvailable](#exchangenotavailable)
- [InvalidNonce](#invalidnonce)

Die Fehlerbehandlung in CCXT erfolgt über den Ausnahme-Mechanismus, der nativ in allen Sprachen verfügbar ist.

Um Fehler zu behandeln, sollten Sie einen `try`-Block um den Aufruf einer einheitlichen Methode hinzufügen und die Ausnahmen abfangen, wie Sie es normalerweise in Ihrer Sprache tun würden:

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

Bei asynchronen Pipelines (`fetchTickerAsync` usw.) umschließt `CompletableFuture`
geworfene Fehler in `CompletionException`. Verwenden Sie `Helpers.unwrap()` innerhalb
von `.exceptionally(...)`, um den Wrapper zu entfernen und den zugrunde liegenden
ccxt-Fehler zu erkennen:

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


## Wiederholungsmechanismus
Bei der Arbeit mit HTTP-Anfragen ist es wichtig zu verstehen, dass Anfragen aus verschiedenen Gründen fehlschlagen können. Häufige Ursachen für diese Fehler sind: der Server ist nicht verfügbar, Netzwerkinstabilität oder vorübergehende Serverprobleme. Um solche Szenarien elegant zu behandeln, bietet CCXT eine Option zum automatischen Wiederholen fehlgeschlagener Anfragen. Sie können den Wert von `maxRetriesOnFailure` und `maxRetriesOnFailureDelay` setzen, um die Anzahl der Wiederholungsversuche und die Verzögerung zwischen den Versuchen zu konfigurieren, Beispiel:

```python
exchange.options['maxRetriesOnFailure'] = 3 # if we get an error like the ones mentioned above we will retry up to three times per request
exchange.options['maxRetriesOnFailureDelay'] = 1000 # we will wait 1000ms (1s) between retries
```

Es ist wichtig hervorzuheben, dass nur server-/netzwerkbezogene Probleme Teil des Wiederholungsmechanismus sind; wenn der Benutzer einen Fehler aufgrund von `InsufficientFunds` oder `InvalidOrder` erhält, wird die Anfrage nicht wiederholt.

## Ausnahmehierarchie

Alle Ausnahmen leiten sich von der Basisklasse BaseError ab, die ihrerseits in der ccxt-Bibliothek wie folgt definiert ist:


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


Die Ausnahmen-Vererbungshierarchie befindet sich in dieser Datei: https://github.com/ccxt/ccxt/blob/master/ts/src/base/errorHierarchy.ts , und kann visuell wie unten dargestellt werden:

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

Die Klasse `BaseError` ist eine generische Wurzel-Fehlerklasse für alle Arten von Fehlern, einschließlich Zugriffsprobleme und Anfrage-/Antwort-Abweichungen. Wenn Sie keine spezifische Unterklasse von Ausnahmen abfangen müssen, können Sie einfach `BaseError` verwenden, wo alle Ausnahmetypen abgefangen werden.

Von `BaseError` leiten sich zwei verschiedene Fehlerfamilien ab: `OperationFailed` und `ExchangeError` (sie haben auch ihre spezifischen Untertypen, wie unten erläutert).

### OperationFailed


Eine `OperationFailed`-Ausnahme kann auftreten, wenn der Benutzer eine **korrekt aufgebaute und gültige Anfrage** an die Börse sendet, aber ein nicht-deterministisches Problem aufgetreten ist:
- laufende Wartungsarbeiten
- Internet-/Netzwerkverbindungsprobleme
- DDoS-Schutzmaßnahmen
- „Server beschäftigt, bitte erneut versuchen"...

Solche Ausnahmen sind vorübergehend und ein erneuter Versuch der Anfrage könnte ausreichen. Wenn der Fehler jedoch weiterhin auftritt, kann dies auf ein dauerhaftes Problem mit der Börse oder Ihrer Verbindung hinweisen.

`OperationFailed` hat die folgenden Untertypen: `RequestTimeout`, `DDoSProtection` (enthält Untertyp `RateLimitExceeded`), `ExchangeNotAvailable`, `InvalidNonce`.


#### DDoSProtection

Diese Ausnahme wird ausgelöst, wenn Cloud-/Hosting-Dienste (Cloudflare, Incapsula o. ä.) Anfragen von Benutzern/Regionen/Standorten einschränken oder wenn die Börsen-API den Benutzer wegen abnormaler Anfragen einschränkt. Diese Ausnahme enthält auch den spezifischen Untertyp `RateLimitExceeded`, der direkt bedeutet, dass der Benutzer häufigere Anfragen stellt als von der Börsen-API-Engine toleriert wird.

#### RequestTimeout

Diese Ausnahme wird ausgelöst, wenn die Verbindung zur Börse fehlschlägt oder Daten nicht innerhalb einer bestimmten Zeit vollständig empfangen werden. Dies wird durch die Eigenschaft `.timeout` der Börse gesteuert. Wenn ein `RequestTimeout` ausgelöst wird, kennt der Benutzer das Ergebnis einer Anfrage nicht (ob sie vom Börsenserver akzeptiert wurde oder nicht).

Daher wird empfohlen, diesen Ausnahmetyp auf folgende Weise zu behandeln:

- Bei Abrufanfragen ist es sicher, den Aufruf zu wiederholen
- Bei einer Anfrage an `cancelOrder()` muss der Benutzer denselben Aufruf ein zweites Mal wiederholen. Ein nachfolgender Wiederholungsversuch von `cancelOrder()` gibt eines der folgenden möglichen Ergebnisse zurück:
  - Eine Anfrage wird erfolgreich abgeschlossen, was bedeutet, dass die Order jetzt ordnungsgemäß storniert wurde
  - Eine `OrderNotFound`-Ausnahme wird ausgelöst, was bedeutet, dass die Order entweder beim ersten Versuch bereits storniert wurde oder in der Zwischenzeit zwischen den beiden Versuchen ausgeführt (gefüllt und geschlossen) wurde.
- Wenn eine Anfrage an `createOrder()` mit einem `RequestTimeout` fehlschlägt, sollte der Benutzer:
  - `fetchOrders()`, `fetchOpenOrders()`, `fetchClosedOrders()` aufrufen, um zu prüfen, ob die Anfrage zur Orderplatzierung erfolgreich war und die Order jetzt offen ist
  - Wenn die Order nicht `'open'` ist, sollte der Benutzer `fetchBalance()` aufrufen, um zu prüfen, ob sich das Guthaben seit der Erstellung der Order beim ersten Durchlauf geändert hat und ob sie dann bis zum Zeitpunkt der zweiten Prüfung gefüllt und geschlossen wurde.

#### ExchangeNotAvailable

Dieser Ausnahmetyp wird ausgelöst, wenn die zugrunde liegende Börse nicht erreichbar ist. Die ccxt-Bibliothek wirft diesen Fehler auch, wenn sie eines der folgenden Schlüsselwörter in der Antwort erkennt:

  - `offline`
  - `unavailable`
  - `busy`
  - `retry`
  - `wait`
  - `maintain`
  - `maintenance`
  - `maintenancing`

#### InvalidNonce

Wird ausgelöst, wenn Ihre Nonce kleiner ist als die zuletzt mit Ihrem Schlüsselpaar verwendete Nonce, wie im Abschnitt [Authentifizierung](#authentication) beschrieben. Dieser Ausnahmetyp wird in folgenden Fällen geworfen (in Reihenfolge der Prüfpriorität):

  - Sie begrenzen Ihre Anfragen nicht oder senden zu viele davon in zu kurzer Zeit.
  - Ihre API-Schlüssel sind nicht frisch und neu (wurden bereits mit anderer Software oder einem anderen Skript verwendet – erstellen Sie beim Hinzufügen einer Börse stets ein neues Schlüsselpaar).
  - Dasselbe Schlüsselpaar wird über mehrere Instanzen der Börsenklasse geteilt (z. B. in einer Mehrfaden-Umgebung oder in separaten Prozessen).
  - Ihre Systemuhr ist nicht synchronisiert. Die Systemzeit sollte mit UTC in einer Zeitzone ohne Sommerzeit mindestens alle zehn Minuten oder noch häufiger synchronisiert werden, da die Uhr driften kann. **Das Aktivieren der Zeitsynchronisierung unter Windows reicht in der Regel nicht aus!** Sie müssen dies über die Betriebssystem-Registrierung einrichten (suchen Sie nach *„time synch frequency"* für Ihr Betriebssystem).


### ExchangeError

Im Gegensatz zu `OperationFailed` tritt der `ExchangeError` meist dann auf, wenn die Anfrage aus den unten aufgeführten Gründen grundsätzlich nicht erfolgreich sein kann – selbst wenn Sie dieselbe Anfrage hunderte Male wiederholen, werden sie weiterhin fehlschlagen, da die Anfrage fehlerhaft formuliert ist.

Mögliche Ursachen für diese Ausnahme:

  - Der Endpunkt wurde von der Börse deaktiviert
  - Symbol auf der Börse nicht gefunden
  - Erforderlicher Parameter fehlt
  - Das Format der Parameter ist falsch
  - Ein Problem auf der Nutzerseite, das behoben werden muss

`ExchangeError` hat folgende Unterausnahme-Typen:

  - `NotSupported`: wenn der Endpunkt/die Operation von der Börsen-API nicht angeboten oder unterstützt wird.
  - `BadRequest`: Der Nutzer sendet eine **falsch** konstruierte Anfrage/Parameter/Aktion, die ungültig/nicht erlaubt ist (z. B.: „ungültige Zahl", „verbotenes Symbol", „Größe außerhalb der Min/Max-Grenzen", „falsche Genauigkeit" usw.). Ein erneuter Versuch hilft in diesem Fall nicht – die Anfrage muss zuerst korrigiert/angepasst werden.
  - `OperationRejected` – Der Nutzer sendet eine **korrekt** konstruierte Anfrage (die von der Börse im Normalfall akzeptiert werden sollte), aber ein deterministischer Faktor verhindert den Erfolg. Zum Beispiel könnte Ihr aktueller Kontostatus dies nicht erlauben (z. B. „Bitte schließen Sie bestehende Positionen, bevor Sie den Hebel ändern", „zu viele ausstehende Aufträge", „Ihr Konto befindet sich im falschen Positions-/Margin-Modus") oder das Symbol ist zum gegebenen Zeitpunkt nicht handelbar (z. B. „MarketClosed") oder es gibt erklärte Faktoren, bei denen Sie eine bestimmte Aktion durchführen müssen (z. B. zuerst eine Einstellung ändern oder bis zu einem bestimmten Zeitpunkt warten). Zusammenfassend: [**OperationFailed**](#operationfailed) kann blind wiederholt werden und sollte dann erfolgreich sein, während `OperationRejected` ein Fehler ist, der von bestimmten exakten Faktoren abhängt, die berücksichtigt werden müssen, bevor die Anfrage wiederholt werden kann.
  - `AuthenticationError`: wenn eine Börse eine der API-Anmeldeinformationen erfordert, die Sie nicht angegeben haben, oder wenn ein Fehler im Schlüsselpaar oder eine veraltete Nonce vorliegt. Meistens benötigen Sie `apiKey` und `secret`, manchmal auch `uid` und/oder `password`, falls die Börsen-API dies verlangt.
  - `PermissionDenied`: wenn kein Zugriff für die angegebene Aktion besteht oder unzureichende Berechtigungen für den angegebenen `apiKey` vorliegen.
  - `InsufficientFunds`: wenn Sie nicht genug Währung auf Ihrem Kontoguthaben haben, um eine Order zu platzieren.
  - `InvalidAddress`: wenn beim Aufruf von `fetchDepositAddress`, `createDepositAddress` oder `withdraw` eine ungültige Einzahlungsadresse oder eine Einzahlungsadresse kürzer als `.minFundingAddressLength` (standardmäßig 10 Zeichen) angetroffen wird.
  - `InvalidOrder`: die Basisklasse für alle Ausnahmen im Zusammenhang mit der einheitlichen Order-API.
  - `OrderNotFound`: wenn Sie versuchen, eine nicht vorhandene Order abzurufen oder zu stornieren.

### Umgang mit Zeitstempelfehlern

Nutzer können gelegentlich auf Fehler wie diese stoßen:

> „Timestamp for this request is outside of the recvWindow."
> „Invalid request, please check your server timestamp or recv_window param."
> „Timestamp for this request was 1000ms ahead of the server's time."

Diese Probleme können aus mehreren Gründen auftreten:

#### 1. Desynchronisierung der Systemuhr
Die Systemuhr Ihres Geräts ist möglicherweise nicht korrekt mit den globalen Zeitstandards synchronisiert, was zu Zeitstempel-Abweichungen führt.
Um dieses Problem zu beheben, stellen Sie sicher, dass Ihre Systemuhr auf die Millisekunde genau ist. Dies sollte keine einmalige Anpassung sein – konfigurieren Sie Ihr Betriebssystem so, dass es die Zeit regelmäßig synchronisiert (z. B. stündlich), um die Genauigkeit zu erhalten.

#### 2. Netzwerkverzögerung oder verzögerte Anfragen
Wenn die Uhr Ihres Geräts korrekt synchronisiert ist, aber Netzwerkverzögerungen dazu führen, dass Anfragen länger dauern als das von der Börse akzeptierte Fenster (üblicherweise etwa `5` Sekunden, obwohl dies je nach Börse variiert), kann Ihre Anfrage abgelehnt werden.


Wenn das Problem weiterhin besteht, können Sie Ihren lokalen Zeitstempel mit der Serverzeit der Börse vergleichen, um Abweichungen zu diagnostizieren:

```
for i in range(0, 20):
    local_time = exchange.milliseconds()
    exchange_time = await exchange.fetch_time()
    print(exchange_time - local_time)
```

####  Anpassen von Börsenoptionen

Wenn Sie nach der Überprüfung der Synchronisierung weiterhin Zeitstempelfehler erleben, können Sie bestimmte Börsenoptionen anpassen, um das Problem zu mildern.

A) `exchange.options['adjustForTimeDifference'] = True`
oder das Fenster auf z. B. 10 Sekunden vergrößern (nur wenn eine Börse dies unterstützt; suchen Sie dieses Schlüsselwort in der entsprechenden [Börsendatei](https://github.com/ccxt/ccxt/tree/master/ts/src)):
B) `exchange.options['recvWindow'] = 10000`


Für weitere Fehlerbehebungsschritte, Community-Diskussionen und verwandte Zeitstempel-/`recvWindow`-Probleme beachten Sie folgende GitHub-Threads:

- [CCXT Issue #773](https://github.com/ccxt/ccxt/issues/773)
- [CCXT Issue #850](https://github.com/ccxt/ccxt/issues/850)
- [CCXT Issue #936](https://github.com/ccxt/ccxt/issues/936)

# Fehlerbehebung

Falls Sie Schwierigkeiten haben, sich mit einer bestimmten Börse zu verbinden, gehen Sie in folgender Reihenfolge vor:

- Stellen Sie sicher, dass Sie die aktuellste Version von ccxt haben.
  Vertrauen Sie niemals Ihrem Paketmanager (ob `npm`, `pip` oder `composer`); überprüfen Sie stattdessen immer Ihre **tatsächliche (echte) Laufzeitversionsnummer**, indem Sie diesen Code in Ihrer Umgebung ausführen:
  ```javascript
  console.log (ccxt.version) // JavaScript
  ```
  ```python
  print('CCXT version:', ccxt.__version__)  # Python
  ```
  ```php
  echo "CCXT v." . \ccxt\Exchange::VERSION . "\n"; // PHP
  ```
- Prüfen Sie die [Issues](https://github.com/ccxt/ccxt/issues) oder [Ankündigungen](#announcements) auf aktuelle Updates.
- Stellen Sie sicher, dass Sie den [Rate-Limiter nicht mit `enableRateLimit: false`](#rate-limit) deaktiviert haben (falls jemand eine eigene Rate-Limit-Lösung gebaut hat, stellen Sie sicher, dass diese sich korrekt verhält).
- Falls Sie die Proxy-Funktionalität von ccxt verwenden, stellen Sie sicher, dass diese sich korrekt verhält.
- Setzen Sie `verbose = true`, um mehr Details zu erhalten!
  ```
  exchange = ccxt.binance()
  exchange.load_markets()
  exchange.verbose = True  # for less noise, you can set that after `load_markets`, but if the error happens during `load_markets` then place this line before it
  # ... your codes here ...
  ```
  Ihr [Code zur Reproduktion des Problems + ausführliche Ausgabe ist erforderlich](/docs/faq#what-is-required-to-get-help), um Hilfe zu erhalten.
- Python-Nutzer können das DEBUG-Protokollierungsniveau mit einem standardmäßigen Python-Logger aktivieren, indem sie diese zwei Zeilen am Anfang ihres Codes hinzufügen:
  ```python
  import logging
  logging.basicConfig(level=logging.DEBUG)
  ```
- Verwenden Sie den ausführlichen Modus, um sicherzustellen, dass die verwendeten API-Anmeldeinformationen den Schlüsseln entsprechen, die Sie verwenden möchten. Achten Sie darauf, dass keine Verwechslung von Schlüsselpaaren vorliegt.
- **Versuchen Sie nach Möglichkeit ein frisches neues Schlüsselpaar.**
- Lesen Sie die Antworten auf häufig gestellte Fragen: /docs/faq
- Überprüfen Sie die Berechtigungen des Schlüsselpaars auf der Börsenwebsite!
- Überprüfen Sie Ihre Nonce. Wenn Sie Ihre API-Schlüssel mit anderer Software verwendet haben, sollten Sie wahrscheinlich [Ihre Nonce-Funktion überschreiben](#overriding-the-nonce), damit sie zu Ihrem vorherigen Nonce-Wert passt. Eine Nonce kann in der Regel einfach zurückgesetzt werden, indem ein neues ungenutztes Schlüsselpaar generiert wird. Wenn Sie Nonce-Fehler mit einem vorhandenen Schlüssel erhalten, versuchen Sie es mit einem neuen API-Schlüssel, der noch nicht verwendet wurde.
- Überprüfen Sie Ihre Anfragerate, wenn Sie Nonce-Fehler erhalten. Ihre privaten Anfragen sollten nicht schnell aufeinander folgen. Sie sollten sie nicht im Sekundentakt oder in kurzen Abständen hintereinander senden. Die Börse wird Sie höchstwahrscheinlich sperren, wenn Sie keine Verzögerung zwischen den einzelnen Anfragen einbauen. Mit anderen Worten: Sie sollten deren Rate-Limit nicht überschreiten, indem Sie zu häufig unbegrenzte private Anfragen senden. Fügen Sie Ihren nachfolgenden Anfragen eine Verzögerung hinzu oder aktivieren Sie den eingebauten Rate-Limiter, wie in den Long-Poller-[Beispielen](https://github.com/ccxt/ccxt/tree/master/examples) gezeigt, auch [hier](#order-book--market-depth).
- Lesen Sie die [Dokumentation für Ihre Börse](/docs/exchange-markets) und vergleichen Sie Ihre ausführliche Ausgabe mit der Dokumentation.
- Überprüfen Sie Ihre Konnektivität mit der Börse, indem Sie sie über Ihren Browser aufrufen.
- Überprüfen Sie Ihre Verbindung zur Börse über einen [Proxy](#proxy).
- Versuchen Sie, von einem anderen Computer oder einem Remote-Server auf die Börse zuzugreifen, um festzustellen, ob es sich um ein lokales oder globales Problem mit der Börse handelt.
- Prüfen Sie, ob es kürzlich Neuigkeiten von der Börse bezüglich Wartungsausfällen gab. Einige Börsen gehen regelmäßig für Updates offline (z. B. einmal pro Woche).
- Stellen Sie sicher, dass Ihre Systemzeit mit den Uhren der übrigen Welt synchronisiert ist, da Sie andernfalls möglicherweise ungültige Nonce-Fehler erhalten.

**Weitere Hinweise:**

- Verwenden Sie die Option `verbose = true` oder instanziieren Sie Ihre problematische Börse mit `new ccxt.exchange ({ 'verbose': true })`, um die HTTP-Anfragen und -Antworten im Detail zu sehen. Die ausführliche Ausgabe ist auch für uns bei der Fehlersuche hilfreich, wenn Sie ein Issue auf GitHub einreichen.
- Verwenden Sie DEBUG-Protokollierung in Python!
- Einige Börsen sind in bestimmten Ländern nicht verfügbar – die Verwendung eines [Proxys](#proxy) kann in solchen Fällen die Lösung sein.
- Wenn Sie Authentifizierungsfehler oder *'ungültige Schlüssel'*-Fehler erhalten, liegen diese höchstwahrscheinlich an einem Nonce-Problem.
- Einige Börsen geben nicht klar an, ob sie Ihre Anfrage nicht authentifizieren konnten. In diesen Fällen antworten sie möglicherweise mit einem ungewöhnlichen Fehlercode, wie HTTP 502 Bad Gateway Error oder etwas, das noch weniger mit der eigentlichen Fehlerursache zu tun hat.
