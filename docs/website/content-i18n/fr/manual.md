---
title: "Manuel"
description: "La bibliothèque ccxt est une collection de plateformes crypto disponibles ou de classes d'échange. Chaque classe implémente l'API publique et privée pour une plateforme crypto…"
---

# Vue d'ensemble

La bibliothèque ccxt est une collection de *plateformes* crypto disponibles ou de classes d'échange. Chaque classe implémente l'API publique et privée pour une plateforme crypto particulière. Toutes les plateformes sont dérivées de la classe de base Exchange et partagent un ensemble de méthodes communes. Pour accéder à une plateforme particulière depuis la bibliothèque ccxt, vous devez créer une instance de la classe d'échange correspondante. Les plateformes prises en charge sont mises à jour fréquemment et de nouvelles plateformes sont ajoutées régulièrement.

La structure de la bibliothèque peut être résumée comme suit :

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

Les API HTTP REST publiques et privées complètes pour toutes les plateformes sont implémentées en JavaScript, Python, PHP, C#, Go et Java. Les implémentations WebSocket sont disponibles dans [CCXT Pro](https://ccxt.pro), avec prise en charge des flux WebSocket.

- [**Plateformes**](#exchanges)
- [**Marchés**](#markets)
- [**API implicite**](#implicit-api)
- [**API unifiée**](#unified-api)
- [**API publique**](#public-api)
- [**API privée**](#private-api)
- [**Gestion des erreurs**](#error-handling)
- [**Dépannage**](#troubleshooting)
- [**CCXT Pro**](#ccxt-pro)

## Réseaux sociaux

- <sub>[![Twitter](https://img.shields.io/twitter/follow/ccxt_official?style=social)](https://twitter.com/ccxt_official)</sub> Suivez-nous sur Twitter
- <sub>[![Medium](https://img.shields.io/badge/read-our%20blog-black?logo=medium)](https://medium.com/@ccxt)</sub> Lisez notre blog sur Medium
- <sub>[![Discord](https://img.shields.io/discord/690203284119617602?logo=discord&logoColor=white)](https://discord.gg/dhzSKYU)</sub> Rejoignez notre Discord
- <sub>[![Telegram Chat](https://img.shields.io/badge/CCXT-Chat-blue?logo=telegram)](https://t.me/ccxt_chat)</sub> Chat CCXT sur Telegram (support technique)

- Canaux d'annonces :
- - <sub>[![Telegram](https://img.shields.io/badge/CCXT-Channel-blue?logo=telegram)](https://t.me/ccxt_announcements)</sub>
- - <sub>[![Discord](https://img.shields.io/badge/CCXT-Channel-blue?logo=discord)](https://discord.com/channels/690203284119617602/1057748769690619984)</sub>


# Plateformes

- [Instanciation](#instantiation)
- [Structure d'une plateforme](#exchange-structure)
- [Limite de débit](#rate-limit)
<!--- init list -->La bibliothèque CCXT prend actuellement en charge les 108 marchés d'échange de cryptomonnaies et API de trading suivants :

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

En plus de passer des ordres de marché et à cours limité de base, certaines bourses proposent le trading sur marge (avec effet de levier), divers produits dérivés (comme les contrats à terme et les options) et disposent également de [dark pools](https://en.wikipedia.org/wiki/Dark_pool), de [OTC](https://en.wikipedia.org/wiki/Over-the-counter_(finance)) (trading de gré à gré), d'APIs marchandes et bien plus encore.

## Instanciation

Pour se connecter à une bourse et commencer à trader, vous devez instancier une classe de bourse depuis la bibliothèque ccxt.

Pour obtenir la liste complète des identifiants des bourses supportées par programmation :


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


Une bourse peut être instanciée comme indiqué dans les exemples ci-dessous :


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

La bibliothèque ccxt en PHP utilise les fonctions UTC/GMT intégrées, vous devez donc définir `date.timezone` dans votre php.ini ou appeler la fonction [date_default_timezone_set()](http://php.net/manual/en/function.date-default-timezone-set.php) avant d'utiliser la version PHP de la bibliothèque. Le paramètre de fuseau horaire recommandé est `"UTC"`.

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


### Fonctionnalités

Les principales bourses disposent de la propriété `.features`, où vous pouvez voir quelles méthodes et fonctionnalités sont supportées pour chaque type de marché (si une méthode est définie à `null/undefined`, cela signifie qu'elle n'est « pas supportée » par la bourse)

*cette fonctionnalité est actuellement en cours de développement et peut être incomplète, n'hésitez pas à signaler tout problème que vous y trouvez*

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


### Redéfinition des propriétés d'une bourse lors de l'instanciation

La plupart des propriétés d'une bourse ainsi que des options spécifiques peuvent être redéfinies lors de l'instanciation de la classe de bourse ou par la suite, comme indiqué ci-dessous :


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


### Redéfinition des méthodes d'une bourse

Dans tous les langages supportés par CCXT, vous pouvez redéfinir les méthodes d'instance pendant l'exécution :


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


### Environnements de test et bacs à sable

Certaines bourses proposent également des APIs séparées à des fins de test, permettant aux développeurs de trader de l'argent virtuel gratuitement et de tester leurs idées. Ces APIs sont appelées _« testnets », « sandboxes » ou « environnements de staging »_ (avec des actifs de test virtuels) par opposition aux _« mainnets » et « environnements de production »_ (avec des actifs réels). Le plus souvent, une API en mode bac à sable est un clone d'une API de production ; c'est donc littéralement la même API, à l'exception de l'URL vers le serveur de la bourse.

CCXT unifie cet aspect et permet à l'utilisateur de basculer vers le bac à sable de la bourse (si supporté par la bourse sous-jacente).
Pour basculer vers le bac à sable, il faut appeler `exchange.setSandboxMode (true)` ou `exchange.set_sandbox_mode(true)` **immédiatement après avoir créé la bourse, avant tout autre appel** !


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


- `exchange.setSandboxMode (true) / exchange.set_sandbox_mode (True)` doit être votre premier appel immédiatement après la création de la bourse (avant tout autre appel)
- Pour obtenir les [clés API](#authentication) du bac à sable, l'utilisateur doit s'inscrire sur le site web du bac à sable de la bourse concernée et créer une paire de clés de bac à sable
- **Les clés de bac à sable ne sont pas interchangeables avec les clés de production !**

## Structure d'une bourse

Chaque bourse possède un ensemble de propriétés et de méthodes, dont la plupart peuvent être redéfinies en passant un tableau associatif de paramètres au constructeur de la classe de bourse. Vous pouvez également créer une sous-classe et tout redéfinir.

Voici un aperçu des propriétés génériques d'une bourse avec des valeurs ajoutées à titre d'exemple :

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

### Propriétés d'une bourse

Vous trouverez ci-dessous une description détaillée de chacune des propriétés de base d'une bourse :

- `id` : Chaque bourse possède un identifiant par défaut. L'identifiant n'est utilisé à aucune fin particulière ; c'est un littéral de chaîne à des fins d'identification de l'instance de bourse côté utilisateur. Vous pouvez avoir plusieurs liens vers la même bourse et les différencier par leurs identifiants. Les identifiants par défaut sont tous en minuscules et correspondent aux noms des bourses.

- `name` : C'est un littéral de chaîne contenant le nom de la bourse lisible par l'être humain.

- `countries` : Un tableau de littéraux de chaîne de codes pays ISO à 2 symboles, indiquant les pays depuis lesquels la bourse opère.

- `urls['api']` : L'URL de base unique sous forme de littéral de chaîne pour les appels API, ou un tableau associatif d'URLs séparées pour les APIs privées et publiques.

- `urls['www']` : L'URL principale du site web HTTP.

- `urls['doc']` : Un lien URL unique vers la documentation originale de l'API de la bourse sur son site web, ou un tableau de liens vers la documentation.

- `version` : Un littéral de chaîne contenant l'identifiant de version pour l'API de bourse actuelle. La bibliothèque ccxt ajoutera cet identifiant de version à l'URL de base de l'API lors de chaque requête. Vous n'avez pas à le modifier, sauf si vous implémentez une nouvelle API de bourse. L'identifiant de version est généralement une chaîne numérique commençant parfois par la lettre « v », comme v1.1. Ne le redéfinissez pas sauf si vous implémentez votre propre nouvelle classe de bourse de crypto-monnaies.

- `api` : Un tableau associatif contenant la définition de tous les points de terminaison API exposés par une bourse de crypto-monnaies. La définition de l'API est utilisée par ccxt pour construire automatiquement des méthodes d'instance appelables pour chaque point de terminaison disponible.

- `has` : C'est un tableau associatif des capacités de la bourse (par ex. `fetchTickers`, `fetchOHLCV` ou `CORS`).

- `timeframes` : Un tableau associatif de périodes temporelles, supportées par la méthode fetchOHLCV de la bourse. Ce tableau n'est renseigné que lorsque la propriété `has['fetchOHLCV']` est vraie.

- `timeout` : Un délai d'expiration en millisecondes pour un aller-retour requête-réponse (le délai par défaut est de 10 000 ms = 10 secondes). Si la réponse n'est pas reçue dans ce délai, la bibliothèque lèvera une exception `RequestTimeout`. Vous pouvez laisser la valeur de délai par défaut ou la définir à une valeur raisonnable. Attendre indéfiniment sans délai d'expiration n'est certainement pas une option. Vous n'avez généralement pas à redéfinir cette option.

- `rateLimit` : La limite de taux en millisecondes. Cette valeur représente le nombre de millisecondes à attendre entre des requêtes consécutives pour rester dans les limites de taux de la bourse. Par exemple, si `rateLimit` vaut 1 000, cela signifie qu'une requête par seconde est autorisée. Le limiteur de taux intégré est activé par défaut et peut être désactivé en définissant la propriété `enableRateLimit` à false.

- `enableRateLimit` : Une valeur booléenne (true/false) qui active le limiteur de taux intégré et régule les requêtes consécutives. Ce paramètre est `true` (activé) par défaut. **L'utilisateur est tenu d'implémenter sa propre [limitation de taux](#rate-limit) ou de laisser le limiteur de taux intégré activé pour éviter d'être banni de la bourse**.

- `userAgent` : Un objet permettant de définir l'en-tête HTTP User-Agent. La bibliothèque ccxt définira son User-Agent par défaut. Certaines bourses pourraient ne pas l'apprécier. Si vous avez du mal à obtenir une réponse d'une bourse et souhaitez désactiver le User-Agent ou utiliser celui par défaut, définissez cette valeur à false, undefined ou une chaîne vide. La valeur de `userAgent` peut être redéfinie par la propriété HTTP `headers` ci-dessous.

- `headers` : Un tableau associatif d'en-têtes HTTP et de leurs valeurs. La valeur par défaut est vide `{}`. Tous les en-têtes seront ajoutés en préfixe à toutes les requêtes. Si l'en-tête `User-Agent` est défini dans `headers`, il remplacera toute valeur définie dans la propriété `userAgent` ci-dessus.

- `verbose` : Un indicateur booléen indiquant si les requêtes HTTP doivent être journalisées vers stdout (l'indicateur verbose est false par défaut). Les utilisateurs de Python disposent d'une autre façon d'activer la journalisation DEBUG avec un logger Python standard, en ajoutant ces deux lignes au début de leur code :
  ```python
  import logging
  logging.basicConfig(level=logging.DEBUG)
  ```
- `returnResponseHeaders` : Si défini à `true`, les en-têtes de réponse HTTP de la bourse seront inclus dans la propriété `responseHeaders` à l'intérieur du champ `info` du résultat retourné pour les appels API REST. Cela peut être utile pour accéder à des métadonnées telles que les informations de limitation de taux ou les en-têtes spécifiques à la bourse. Par défaut, cette valeur est `false` et les en-têtes ne sont pas inclus dans la réponse. Remarque : cela n'est supporté que lorsque la réponse est un objet et non une liste ou une chaîne.

- `markets` : Un tableau associatif de marchés indexés par des paires de trading ou des symboles communs. Les marchés doivent être chargés avant d'accéder à cette propriété. Les marchés ne sont pas disponibles tant que vous n'avez pas appelé la méthode `loadMarkets() / load_markets()` sur l'instance de bourse.

- `symbols` : Un tableau non associatif (une liste) de symboles disponibles sur une bourse, triés par ordre alphabétique. Ce sont les clés de la propriété `markets`. Les symboles sont chargés et rechargés depuis les marchés. Cette propriété est un raccourci pratique pour toutes les clés de marchés.

- `currencies` : Un tableau associatif (un dict) de devises par codes (généralement 3 ou 4 lettres) disponibles sur une bourse. Les devises sont chargées et rechargées depuis les marchés.

- `markets_by_id` : Un tableau associatif de tableaux de marchés indexés par des identifiants spécifiques à la bourse. Il s'agit généralement d'un tableau de longueur un, sauf s'il existe plusieurs marchés avec le même marketId. Les marchés doivent être chargés avant d'accéder à cette propriété.

- `apiKey` : C'est votre littéral de chaîne de clé API publique. La plupart des bourses nécessitent une [configuration des clés API](#api-keys-setup).

- `secret` : Votre littéral de chaîne de clé API secrète privée. La plupart des bourses l'exigent également, en même temps que l'apiKey.

- `password` : Un littéral de chaîne avec votre mot de passe/phrase secrète. Certaines bourses requièrent ce paramètre pour le trading, mais la plupart ne le font pas.

- `uid` : Un identifiant unique de votre compte. Il peut s'agir d'un littéral de chaîne ou d'un nombre. Certaines bourses l'exigent également pour le trading, mais la plupart ne le font pas.

- `requiredCredentials` : Un dictionnaire associatif unifié indiquant lesquels des identifiants API ci-dessus sont requis pour envoyer des appels API privés à la bourse sous-jacente (une bourse peut exiger un ensemble spécifique de clés).

- `options` : Un dictionnaire associatif spécifique à la bourse contenant des clés et options spéciales acceptées par la bourse sous-jacente et supportées dans CCXT.

- `precisionMode` : Le mode de comptage de la précision décimale de la bourse, pour en savoir plus consultez [Précision et limites](#precision-and-limits).

- Pour les proxies - `proxyUrl`, `httpUrl`, `httpsUrl`, `socksProxy`, `wsProxy`, `wssProxy`, `wsSocksProxy` : Une URL de proxy spécifique. Consultez la section [Proxy](#proxy) pour plus de détails.

Consultez cette section sur la [Redéfinition des propriétés d'une bourse](#overriding-exchange-properties-upon-instantiation).

#### Métadonnées d'une bourse

- `has` : Un tableau associatif contenant des indicateurs pour les capacités de la bourse, notamment les suivants :

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

    La signification de chaque indicateur montrant la disponibilité de telle ou telle méthode est :

    - une valeur `undefined` / `None` / `null` signifie que la méthode n'est pas encore implémentée dans ccxt (soit ccxt ne l'a pas encore unifiée, soit la méthode n'est pas nativement disponible depuis l'API de la bourse)
    - le booléen `false` signifie spécifiquement que le point de terminaison n'est pas nativement disponible depuis l'API de la bourse
    - le booléen `true` signifie que le point de terminaison est nativement disponible depuis l'API de la bourse et unifié dans la bibliothèque ccxt
    - la chaîne `'emulated'` signifie que le point de terminaison n'est pas nativement disponible depuis l'API de la bourse mais est reconstruit (autant que possible) par la bibliothèque ccxt à partir d'autres méthodes vraies disponibles

    Pour une liste complète de toutes les bourses et de leurs méthodes supportées, veuillez consulter cet exemple : https://github.com/ccxt/ccxt/blob/master/examples/js/exchange-capabilities.js

## Limitation de taux

Les bourses imposent généralement ce que l'on appelle une *limite de taux*. Les bourses mémorisent et suivent vos identifiants utilisateur et votre adresse IP, et ne vous permettront pas d'interroger l'API trop fréquemment. Elles équilibrent leur charge et contrôlent la congestion du trafic pour protéger les serveurs API contre les attaques (D)DoS et les abus.

**AVERTISSEMENT : Restez en dessous de la limite de débit pour éviter d'être banni !**

La plupart des exchanges autorisent **jusqu'à 1 ou 2 requêtes par seconde**. Les exchanges peuvent restreindre temporairement votre accès à leur API ou vous bannir pendant une certaine période si vous envoyez trop de requêtes de manière agressive.

**La propriété `exchange.rateLimit` est définie par défaut sur une valeur sûre mais sous-optimale. Certains exchanges peuvent avoir des limites de débit variables selon les endpoints. Il appartient à l'utilisateur d'ajuster `rateLimit` en fonction des besoins propres à son application.**

La bibliothèque CCXT dispose d'algorithmes expérimentaux intégrés de limitation de débit qui effectuent la régulation nécessaire en arrière-plan, de manière transparente pour l'utilisateur. **AVERTISSEMENT : les utilisateurs sont responsables d'au moins un certain type de limitation de débit : soit en implémentant un algorithme personnalisé, soit en utilisant le limiteur de débit intégré.**

CCXT dispose des algorithmes de limitation de débit intégrés suivants :

- **Leaky Bucket (par défaut)** : Fonctionne en mettant les requêtes en file d'attente et en les libérant à un rythme régulier et fixe. Les pics de requêtes sont lissés dans le temps plutôt qu'exécutés immédiatement, ce qui permet d'éviter de dépasser les limites de débit des exchanges tout en gérant gracieusement les courtes pointes d'activité.
- **Basé sur une fenêtre (optionnel)** : Si l'utilisateur fournit l'option `{ 'rateLimiterAlgorithm': 'rollingWindow' }`, ccxt passe du modèle leaky bucket à un limiteur de débit basé sur une fenêtre (la taille de la fenêtre peut être personnalisée en fournissant `rollingWindowSize: X0000`, CCXT utilise 60s comme taille de fenêtre par défaut). Un limiteur basé sur une fenêtre impose un nombre maximum de requêtes dans une fenêtre temporelle fixe (par exemple, N requêtes par X millisecondes). Une fois la limite atteinte, les requêtes suivantes sont retardées jusqu'à l'expiration de la fenêtre en cours.

Vous pouvez activer/désactiver le limiteur de débit intégré avec la propriété `.enableRateLimit`, comme suit :


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


Si vos appels atteignent une limite de débit ou génèrent des erreurs de nonce, la bibliothèque ccxt lèvera une exception `InvalidNonce`, ou, dans certains cas, l'un des types suivants :

- `DDoSProtection`
- `ExchangeNotAvailable`
- `ExchangeError`
- `InvalidNonce`

Une nouvelle tentative ultérieure suffit généralement à résoudre le problème.

### Notes sur le limiteur de débit
#### Un limiteur de débit par instance d'exchange

Le limiteur de débit est une propriété de l'instance d'exchange ; autrement dit, chaque instance d'exchange possède son propre limiteur de débit qui n'a pas connaissance des autres instances. Dans de nombreux cas, l'utilisateur devrait réutiliser la même instance d'exchange tout au long du programme. N'utilisez pas plusieurs instances du même exchange avec la même paire de clés API depuis la même adresse IP.

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

Réutilisez l'instance d'exchange autant que possible, comme indiqué ci-dessous :

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

Étant donné que le limiteur de débit appartient à l'instance d'exchange, la destruction de l'instance d'exchange détruira également le limiteur de débit. L'un des pièges les plus courants liés à la limitation de débit consiste à créer et supprimer l'instance d'exchange sans cesse. Si dans votre programme vous créez et détruisez l'instance d'exchange (par exemple, à l'intérieur d'une fonction appelée plusieurs fois), vous réinitialisez effectivement le limiteur de débit à chaque fois, ce qui finira par enfreindre les limites de débit. Si vous recréez l'instance d'exchange à chaque fois au lieu de la réutiliser, CCXT tentera de charger les marchés à chaque fois. Par conséquent, vous forcerez le chargement des marchés encore et encore, comme expliqué dans la section [Chargement des marchés](#loading-markets). Abuser de l'endpoint des marchés finira également par enfreindre le limiteur de débit.

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

Ne contrevenez pas à cette règle à moins de vraiment comprendre le fonctionnement interne du limiteur de débit et d'être sûr à 100% de ce que vous faites. Pour rester en sécurité, réutilisez toujours l'instance d'exchange tout au long de la chaîne d'appels de vos fonctions et méthodes, comme indiqué ci-dessous :

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

### Protection DDoS par Cloudflare / Incapsula

Certains exchanges sont protégés contre les attaques [DDoS](https://en.wikipedia.org/wiki/Denial-of-service_attack) par [Cloudflare](https://www.cloudflare.com) ou [Incapsula](https://www.incapsula.com). Votre IP peut être temporairement bloquée pendant les périodes de forte charge. Parfois, ils restreignent même des pays et régions entiers. Dans ce cas, leurs serveurs renvoient généralement une page indiquant une erreur HTTP 40x ou exécutent un test AJAX de votre navigateur / un test captcha et retardent le rechargement de la page de plusieurs secondes. Votre navigateur/empreinte est ensuite temporairement autorisé et ajouté à une liste blanche ou reçoit un cookie HTTP pour une utilisation ultérieure.

Les symptômes les plus courants d'un problème de protection DDoS, de limitation de débit ou de filtrage géographique :
- Obtenir des exceptions `RequestTimeout` avec tous les types de méthodes d'exchange
- Capturer `ExchangeError` ou `ExchangeNotAvailable` avec les codes d'erreur HTTP 400, 403, 404, 429, 500, 501, 503, etc.
- Avoir des problèmes de résolution DNS, des problèmes de certificat SSL et des problèmes de connectivité de bas niveau
- Recevoir une page HTML modèle au lieu de JSON de l'exchange

Si vous rencontrez des erreurs de protection DDoS et ne pouvez pas atteindre un exchange particulier, alors :

- utilisez un [proxy](#proxy) (bien que cela soit moins réactif)
- demandez au support de l'exchange de vous ajouter à une liste blanche
- essayez une adresse IP alternative dans une région géographique différente
- exécutez votre logiciel dans un réseau distribué de serveurs
- exécutez votre logiciel à proximité de l'exchange (même pays, même ville, même centre de données, même rack de serveurs, même serveur)
- ...

## Capacité maximale de requêtes

En programmation asynchrone, CCXT vous permet de planifier un nombre illimité de requêtes. Cependant, il existe une limite sur la longueur de la file d'attente qui est par défaut fixée à 1000 requêtes simultanées maximum. Si vous tentez de mettre en file d'attente plus que cela, vous rencontrerez l'erreur : "throttle queue is over maxCapacity".

Dans la plupart des cas, avoir autant de tâches en attente indique une conception sous-optimale, car les nouvelles requêtes seront retardées jusqu'à ce que les tâches existantes se terminent.

Cela dit, les utilisateurs qui souhaitent contourner cette restriction peuvent augmenter la valeur par défaut de maxCapacity lors de l'instanciation, comme indiqué ci-dessous :

```
ex = ccxt.binance({'options': {'maxRequestsQueue': 9999}})
```

# Marchés

- [Structure de devise](#currency-structure)
- [Structure de marché](#market-structure)
- [Précision et limites](#precision-and-limits)
- [Chargement des marchés](#loading-markets)
- [Symboles et identifiants de marché](#symbols-and-market-ids)
- [Rechargement forcé du cache de marché](#market-cache-force-reload)

Chaque exchange est un lieu de trading de certains types de valeurs. Les exchanges peuvent utiliser des termes différents pour les désigner : _« une devise »_, _« un actif »_, _« une pièce »_, _« un jeton »_, _« une action »_, _« une matière première »_, _« crypto »_, « fiat », etc. Un lieu permettant d'échanger un actif contre un autre est généralement appelé _« un marché »_, _« un symbole »_, _« une paire de trading »_, _« un contrat »_, etc.

En termes de bibliothèque ccxt, chaque exchange propose plusieurs **marchés** en son sein. Chaque marché est défini par deux devises ou plus. L'ensemble des marchés diffère d'un exchange à l'autre, ouvrant des possibilités d'arbitrage inter-exchanges et inter-marchés.

## Structure de devise

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

Chaque devise est un tableau associatif (aussi appelé dictionnaire) avec les clés suivantes :

- `id`. L'identifiant sous forme de chaîne ou numérique de la devise au sein de l'exchange. Les identifiants de devises sont utilisés en interne par les exchanges pour identifier les pièces lors du processus de requête/réponse.
- `code`. Une représentation sous forme de code en majuscules d'une devise particulière. Les codes de devises sont utilisés pour référencer les devises au sein de la bibliothèque ccxt (expliqué ci-dessous).
- `name`. Un nom lisible par l'homme de la devise (peut être un mélange de caractères majuscules et minuscules).
- `fee`. La valeur des frais de retrait telle que spécifiée par l'exchange. Dans la plupart des cas, il s'agit d'un montant fixe forfaitaire payé dans la même devise. Si l'exchange ne le spécifie pas via des endpoints publics, `fee` peut être `undefined/None/null` ou absent.
- `active`. Un booléen indiquant si le trading ou le financement (dépôt ou retrait) pour cette devise est actuellement possible ; plus d'informations ici : [statut `active`](#active-status).
- `info`. Un tableau associatif de propriétés de marché non communes, incluant les frais, les taux, les limites et d'autres informations générales sur le marché. Le tableau info interne est différent pour chaque marché particulier ; son contenu dépend de l'exchange.
- `precision`. Précision acceptée dans les valeurs par les exchanges lors du référencement de cette devise. La valeur de cette propriété dépend de [`exchange.precisionMode`](#precision-mode).
- `limits`. Les minimums et maximums pour les montants (volumes), les retraits et les dépôts.

## Structure de réseau

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

Chaque réseau est un tableau associatif (aussi appelé dictionnaire) avec les clés suivantes :

- `id`. L'identifiant sous forme de chaîne ou numérique du réseau au sein de l'exchange. Les identifiants de réseaux sont utilisés en interne par les exchanges pour identifier les réseaux lors du processus de requête/réponse.
- `network`. Une représentation sous forme de chaîne en majuscules d'un réseau particulier. Les réseaux sont utilisés pour référencer les réseaux au sein de la bibliothèque ccxt.
- `name`. Un nom lisible par l'homme du réseau (peut être un mélange de caractères majuscules et minuscules).
- `fee`. La valeur des frais de retrait telle que spécifiée par l'exchange. Dans la plupart des cas, il s'agit d'un montant fixe forfaitaire payé dans la même devise. Si l'exchange ne le spécifie pas via des endpoints publics, `fee` peut être `undefined/None/null` ou absent.
- `active`. Un booléen indiquant si le trading ou le financement (dépôt ou retrait) pour cette devise est actuellement possible ; plus d'informations ici : [statut `active`](#active-status).
- `info`. Un tableau associatif de propriétés de marché non communes, incluant les frais, les taux, les limites et d'autres informations générales sur le marché. Le tableau info interne est différent pour chaque marché particulier ; son contenu dépend de l'exchange.
- `precision`. Précision acceptée dans les valeurs par les exchanges lors du référencement de cette devise. La valeur de cette propriété dépend de [`exchange.precisionMode`](#precision-mode).
- `limits`. Les minimums et maximums pour les montants (volumes), les retraits et les dépôts.

## Structure de marché

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

Chaque marché est un tableau associatif (aussi appelé dictionnaire) avec les clés suivantes :

- `id`. L'identifiant sous forme de chaîne ou numérique du marché ou de l'instrument de trading au sein de l'exchange. Les identifiants de marchés sont utilisés en interne par les exchanges pour identifier les paires de trading lors du processus de requête/réponse.
- `symbol`. Une représentation sous forme de code en majuscules d'une paire de trading ou d'un instrument particulier. Elle est généralement écrite sous la forme `DeviseBase/DeviseQuotation` avec une barre oblique, comme dans `BTC/USD`, `LTC/CNY` ou `ETH/EUR`, etc. Les symboles sont utilisés pour référencer les marchés au sein de la bibliothèque ccxt (expliqué ci-dessous).
- `base`. Un code de devise fiat ou crypto de base en majuscules unifié. Il s'agit du code de devise standardisé utilisé pour faire référence à cette devise ou ce jeton dans tout CCXT et dans toute l'API CCXT unifiée ; c'est le langage que CCXT comprend.
- `quote`. Un code de devise fiat ou crypto de cotation en majuscules unifié.
- `baseId`. Un identifiant spécifique à l'exchange de la devise de base pour ce marché, non unifié. Peut être n'importe quelle chaîne, au sens littéral. C'est ce qui est communiqué à l'exchange dans le langage que l'exchange comprend.
- `quoteId`. Un identifiant spécifique à l'exchange de la devise de cotation, non unifié.
- `active`. Un booléen indiquant si le trading sur ce marché est actuellement possible ou non ; plus d'informations ici : [statut `active`](#active-status).
- `maker`. Float, 0.0015 = 0.15%. Les frais maker sont payés lorsque vous fournissez de la liquidité à l'exchange, c'est-à-dire lorsque vous *passez un ordre market-maker* et que quelqu'un d'autre l'exécute. Les frais maker sont généralement inférieurs aux frais taker. Les frais peuvent être négatifs, ce qui est très courant parmi les exchanges de produits dérivés. Des frais négatifs signifient que l'exchange versera un remboursement (récompense) à l'utilisateur pour le trading sur ce marché (remarque : les frais « taker » et « maker » sont des frais publiquement disponibles, sans tenir compte de votre niveau VIP/volume/etc. Utilisez [`fetchTradingFees`](#fee-schedule) pour obtenir les frais spécifiques à votre compte).
- `taker`. Float, 0.002 = 0.2%. Les frais taker sont payés lorsque vous *prenez* de la liquidité à l'exchange et exécutez l'ordre de quelqu'un d'autre.
- `percentage`. Une valeur booléenne vrai/faux indiquant si `taker` et `maker` sont des multiplicateurs ou des montants forfaitaires fixes.
- `tierBased`. Une valeur booléenne vrai/faux indiquant si les frais dépendent de votre niveau de trading (généralement, votre volume tradé sur une période de temps).
- `info`. Un tableau associatif de propriétés de marché non communes, incluant les frais, les taux, les limites et d'autres informations générales sur le marché. Le tableau info interne est différent pour chaque marché particulier ; son contenu dépend de l'exchange.
- `precision`. Précision acceptée dans les valeurs d'ordre par les exchanges lors du placement d'ordre pour le prix, le montant et le coût. (La valeur dans cette propriété dépend de [`exchange.precisionMode`](#precision-mode)).
- `limits`. Les minimums et maximums pour les prix, les montants (volumes) et les coûts (où coût = prix * montant).
- `optionType`. Le type de l'option ; une option `call` représente une option avec le droit d'acheter et une option `put` une option avec le droit de vendre.
- `strike`. Prix auquel une option peut être achetée ou vendue lorsqu'elle est exercée.

## Statut Actif

Le drapeau `active` est généralement utilisé dans les [`currencies`](#currency-structure) et les [`markets`](#market-structure). Les exchanges peuvent lui donner une signification légèrement différente. Si une devise est inactive, la plupart du temps tous les tickers, carnets d'ordres et autres endpoints associés renvoient des réponses vides, des zéros, aucune donnée ou des informations obsolètes. L'utilisateur doit vérifier si la devise est `active` et [recharger les marchés périodiquement](#market-cache-force-reload).

Remarque : la valeur `false` de la propriété `active` ne garantit pas toujours que toutes les fonctionnalités possibles comme le trading, les retraits ou les dépôts sont désactivées sur l'exchange. De même, la valeur `true` ne garantit pas non plus que toutes ces fonctionnalités sont activées sur l'exchange. Consultez la documentation des exchanges sous-jacents ainsi que le code dans CCXT pour connaître la signification exacte du drapeau `active` pour tel ou tel exchange. Ce drapeau n'est pas encore pris en charge ou implémenté par tous les marchés et peut être absent.

**AVERTISSEMENT ! Les informations concernant les frais sont expérimentales, instables et peuvent être partielles ou totalement indisponibles.**

## Précision Et Limites

**Ne confondez pas `limits` avec `precision` !** La précision n'a rien à voir avec les limites minimales. Une précision de `0.01` ne signifie pas nécessairement que la limite minimale pour un marché est `0.01`. L'inverse est également vrai : une limite minimale de `0.01` ne signifie pas nécessairement que la précision est `0.01`.

Exemples :

1.
```
market['limits']['amount']['min'] == 0.05 &&
market['precision']['amount'] == 0.0001 &&
market['precision']['price'] == 0.01
```

  - La *valeur du montant* doit être >= 0.05 :
    ```diff
    + good: 0.05, 0.051, 0.0501, 0.0502, ..., 0.0599, 0.06, 0.0601, ...
    - bad: 0.04, 0.049, 0.0499
    ```
  - La *précision du montant* doit comporter jusqu'à 4 chiffres après la virgule (0.0001) :
    ```diff
    + good: 0.05, 0.0501, ..., 0.06, ..., 0.0719, ...
    - bad: 0.05001, 0.05000, 0.06001
    ```
  - La *précision du prix* doit comporter jusqu'à 2 chiffres après la virgule (0.01) :
    ```diff
    + good: 1.6, 1.61, 123.01, ..., 1234.56, ...
    - bad: 1.601, ..., 123.012, ..., 1234.567
    ```
  - 

2. `(market['precision']['amount'] == -1)`

    Une *précision* négative ne peut théoriquement se produire que si le `precisionMode` de l'exchange est `SIGNIFICANT_DIGIT` ou `DECIMAL_PRECISION`. Cela signifie que le montant doit être un multiple entier de 10 (à la puissance absolue spécifiée) :
    ```diff
    + good: 10, 50, ..., 110, ... 1230, ..., 1000000, ..., 1234560, ...
    - bad: 9.5, ... 10.1, ..., 11, ... 200.71, ...
    ```
    Dans le cas de `-2`, les valeurs acceptables seraient des multiples de `100` (par ex. 100, 200, ...), et ainsi de suite.


#### Mode De Précision

Les modes de précision pris en charge dans `exchange['precisionMode']` sont :

- `TICK_SIZE` – presque tous les exchanges utilisent ce mode de précision. Dans ce mode, les nombres dans `market_or_currency['precision']` désignent les fractions de précision minimales (flottants) pour l'arrondi ou la troncature.
- `SIGNIFICANT_DIGITS` – compte uniquement les chiffres non nuls ; certains exchanges (`bitfinex` et peut-être quelques autres) implémentent ce mode de comptage des décimales. Avec ce mode de précision, les nombres dans `market_or_currency['precision']` désignent la Nième position du dernier chiffre décimal significatif (non nul) après la virgule.
- `DECIMAL_PLACES` (**OBSOLÈTE, CCXT n'utilise plus ce mode nulle part**) – compte tous les chiffres. Avec ce mode de précision, les nombres dans `market_or_currency['precision']` désignent le nombre de chiffres décimaux après la virgule pour l'arrondi ou la troncature ultérieure.

### Remarques Sur La Précision Et Les Limites

L'utilisateur est tenu de respecter toutes les limites et précisions ! Les valeurs de l'ordre doivent satisfaire les conditions suivantes :

- `amount` de l'ordre >= `limits['amount']['min']`
- `amount` de l'ordre <= `limits['amount']['max']`
- `price` de l'ordre >= `limits['price']['min']`
- `price` de l'ordre <= `limits['price']['max']`
- `cost` de l'ordre (`amount * price`) >= `limits['cost']['min']`
- `cost` de l'ordre (`amount * price`) <= `limits['cost']['max']`
- La précision de `amount` doit être <= `precision['amount']`
- La précision de `price` doit être <= `precision['price']`

Les valeurs ci-dessus peuvent être absentes pour certains exchanges qui ne fournissent pas d'informations sur les limites via leur API ou qui ne l'ont pas encore implémenté.

### Méthodes De Formatage Des Décimales

Chaque exchange possède ses propres modes d'arrondi, de comptage et de remplissage.

Les modes d'arrondi pris en charge sont :

- `ROUND` – arrondira les derniers chiffres décimaux à la précision
- `TRUNCATE` – coupera les chiffres après une certaine précision

Le mode de comptage de la précision décimale est disponible dans la propriété `exchange.precisionMode`.

#### Mode De Remplissage

Les modes de remplissage pris en charge sont :

- `NO_PADDING` – par défaut dans la plupart des cas
- `PAD_WITH_ZERO` – ajoute des zéros jusqu'à la précision

#### Formatage À La Précision

La plupart du temps, l'utilisateur n'a pas à se préoccuper du formatage de la précision, car CCXT s'en charge lorsque l'utilisateur passe des ordres ou envoie des demandes de retrait, à condition que l'utilisateur respecte les règles décrites dans [Précision Et Limites](#precision-and-limits). Cependant, dans certains cas, les détails du formatage de la précision peuvent être importants, et les méthodes suivantes peuvent être utiles côté utilisateur.

La classe de base exchange contient la méthode `decimalToPrecision` pour aider à formater les valeurs à la précision décimale requise avec prise en charge de différents modes d'arrondi, de comptage et de remplissage.


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


Pour des exemples d'utilisation de `decimalToPrecision` pour formater des chaînes et des flottants, veuillez consulter les fichiers suivants :

- Typescript: https://github.com/ccxt/ccxt/blob/master/ts/src/test/base/functions/test.number.ts
- JavaScript: https://github.com/ccxt/ccxt/blob/master/js/src/test/base/functions/test.number.js
- Python: https://github.com/ccxt/ccxt/blob/master/python/ccxt/test/base/test_number.py
- PHP: https://github.com/ccxt/ccxt/blob/master/php/test/base/test_number.php

**AVERTISSEMENT Python ! La méthode `decimal_to_precision` est sensible à `getcontext().prec` !**

Pour la commodité des utilisateurs, la classe de base exchange de CCXT implémente également les méthodes suivantes :


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


Chaque exchange possède ses propres paramètres de précision ; les méthodes ci-dessus permettront de formater ces valeurs selon les règles de précision spécifiques à l'exchange, de manière portable et indépendante de l'exchange sous-jacent. Pour rendre cela possible, les marchés et les devises doivent être chargés avant de formater toute valeur.

**Assurez-vous de [charger les marchés avec `exchange.loadMarkets()`](#loading-markets) avant d'appeler ces méthodes !**

Par exemple :


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


Exemples pratiques supplémentaires décrivant le comportement de `exchange.precisionMode` :

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

## Chargement Des Marchés

Dans la plupart des cas, vous devez charger la liste des marchés et des symboles de trading d'un exchange particulier avant d'accéder aux autres méthodes de l'API. Si vous oubliez de charger les marchés, la bibliothèque ccxt le fera automatiquement lors de votre premier appel à l'API unifiée. Elle enverra deux requêtes HTTP, d'abord pour les marchés, puis une seconde pour les autres données, de manière séquentielle. C'est pourquoi votre premier appel à une méthode de l'API CCXT unifiée comme fetchTicker, fetchBalance, etc. prendra plus de temps que les appels suivants, car elle doit effectuer davantage de travail en chargeant les informations de marché depuis l'API de l'exchange. Consultez [Remarques Sur Le Limiteur De Débit](#notes-on-rate-limiter) pour plus de détails.

Pour charger les marchés manuellement à l'avance, appelez la méthode `loadMarkets ()` / `load_markets ()` sur une instance d'exchange. Elle retourne un tableau associatif de marchés indexés par symbole de trading. Si vous souhaitez davantage de contrôle sur l'exécution de votre logique, il est recommandé de précharger les marchés manuellement.


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


En plus des informations de marché, l'appel `loadMarkets()` chargera également les devises de l'exchange et mettra en cache les informations dans les propriétés `.markets` et `.currencies` respectivement.

L'utilisateur peut également contourner le cache et appeler des méthodes unifiées pour récupérer ces informations directement depuis les endpoints de l'exchange, `fetchMarkets()` et `fetchCurrencies()`, bien que l'utilisation de ces méthodes ne soit pas recommandée pour les utilisateurs finaux. La méthode recommandée pour précharger les marchés est d'appeler la méthode unifiée `loadMarkets()`. Cependant, les nouvelles intégrations d'exchanges doivent implémenter ces méthodes si l'exchange sous-jacent dispose des endpoints d'API correspondants.

### Partage Des Marchés Entre Instances D'Exchange

Pour optimiser l'utilisation de la mémoire et réduire les appels API redondants, vous pouvez partager les données de marché entre plusieurs instances du même exchange. Cela est particulièrement utile lors de la création de plusieurs instances d'exchange ou lorsque vous souhaitez réutiliser des données de marché déjà chargées.


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


**Avantages Du Partage De Marché :**
- **Efficacité Mémoire** : Plusieurs instances d'exchange partagent les mêmes objets de marché en mémoire
- **Performance** : Élimine les appels API redondants pour les données de marché
- **Conservation Des Ressources** : Réduit les requêtes réseau et l'utilisation des limites de débit de l'API
- **Persistance** : Les données de marché restent disponibles même si des instances d'exchange individuelles sont détruites

**Affectation Directe Alternative :**

Si vous préférez l'affectation directe de propriété, vous pouvez également partager des marchés en assignant directement la propriété `markets` :

```javascript
// Simple direct assignment (ensure both exchanges are of same type)
exchange2.markets = exchange1.markets;
exchange2.symbols = exchange1.symbols;  // Also copy symbols for full functionality
```

Cependant, l'utilisation de la méthode `setMarketsFromExchange()` est recommandée car elle :
- Valide que les deux exchanges sont du même type
- Garantit que toutes les données de marché associées sont correctement copiées
- Offre une meilleure gestion des erreurs

**Remarques Importantes :**
- Ne partagez des marchés qu'entre instances du même type d'exchange
- Le partage de marchés est le plus efficace lorsque les deux instances utilisent les mêmes identifiants d'API et la même configuration
- Les objets de marché partagés persisteront en mémoire aussi longtemps qu'au moins une référence existe
- La méthode `setMarketsFromExchange()` et l'affectation directe créent des références partagées, pas des copies

## Symboles Et Identifiants De Marché

Un code de devise est un code de trois à cinq lettres, comme `BTC`, `ETH`, `USD`, `GBP`, `CNY`, `JPY`, `DOGE`, `RUB`, `ZEC`, `XRP`, `XMR`, etc. Certains exchanges ont des devises exotiques avec des codes plus longs.

Un symbole est généralement un nom littéral en majuscules d'une paire de devises échangées avec une barre oblique entre les deux. La première devise avant la barre oblique est généralement appelée *devise de base*, et celle après la barre oblique est appelée *devise de cotation*. Des exemples de symboles sont : `BTC/USD`, `DOGE/LTC`, `ETH/EUR`, `DASH/XRP`, `BTC/CNY`, `ZEC/XMR`, `ETH/JPY`.

Les identifiants de marché sont utilisés lors du processus de requête-réponse REST pour référencer les paires de trading au sein des exchanges. L'ensemble des identifiants de marché est unique par exchange et ne peut pas être utilisé entre exchanges. Par exemple, la paire/marché BTC/USD peut avoir des identifiants différents sur divers exchanges populaires, comme `btcusd`, `BTCUSD`, `XBTUSD`, `btc/usd`, `42` (identifiant numérique), `BTC/USD`, `Btc/Usd`, `tBTCUSD`, `XXBTZUSD`. Vous n'avez pas besoin de mémoriser ou d'utiliser les identifiants de marché ; ils sont là à des fins internes de requête-réponse HTTP dans les implémentations d'exchange.

La bibliothèque ccxt abstrait les identifiants de marché peu courants en symboles, standardisés selon un format commun. Les symboles ne sont pas les mêmes que les identifiants de marché. Chaque marché est référencé par un symbole correspondant. Les symboles sont communs entre les exchanges, ce qui les rend adaptés à l'arbitrage et à de nombreuses autres utilisations.

Parfois, l'utilisateur peut remarquer un symbole comme `'XBTM18'` ou `'.XRPUSDM20180101'` ou d'autres *"symboles exotiques/rares"*. Le symbole **n'est pas obligé** de contenir une barre oblique ou d'être une paire de devises. La chaîne dans le symbole dépend vraiment du type de marché (qu'il s'agisse d'un marché au comptant ou d'un marché à terme, d'un marché darkpool ou d'un marché expiré, etc.). Il est fortement déconseillé d'essayer d'analyser la chaîne de symbole ; il ne faut pas se fier au format du symbole, il est recommandé d'utiliser plutôt les propriétés du marché.

Les structures de marché sont indexées par symboles et identifiants. La classe d'échange de base dispose également de méthodes intégrées pour accéder aux marchés par symboles. La plupart des méthodes API nécessitent qu'un symbole soit passé en premier argument. Il vous est souvent demandé de spécifier un symbole lors de la consultation des prix actuels, de la passation d'ordres, etc.

La plupart du temps, les utilisateurs travailleront avec des symboles de marché. Vous obtiendrez une exception standard si vous accédez à des clés inexistantes dans ces dictionnaires.

### Méthodes Pour Les Marchés Et Les Devises


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


### Cohérence Des Noms

Il existe une certaine ambiguïté terminologique entre les différentes plateformes d'échange qui peut prêter à confusion chez les traders débutants. Certaines plateformes appellent les marchés des *paires*, tandis que d'autres appellent les symboles des *produits*. Dans le contexte de la bibliothèque ccxt, chaque plateforme d'échange contient un ou plusieurs marchés de trading. Chaque marché possède un identifiant et un symbole. La plupart des symboles sont des paires composées d'une devise de base et d'une devise de cotation.

``` → Markets → Symbols → Currencies```

Historiquement, divers noms symboliques ont été utilisés pour désigner les mêmes paires de trading. Certaines crypto-monnaies (comme Dash) ont même changé de nom plus d'une fois au cours de leur existence. Par souci de cohérence entre les plateformes d'échange, la bibliothèque ccxt effectuera les substitutions connues suivantes pour les symboles et devises :

- `XBT → BTC` : `XBT` est plus récent, mais `BTC` est plus répandu parmi les plateformes d'échange et ressemble davantage à bitcoin ([en savoir plus](https://www.google.ru/search?q=xbt+vs+btc)).
- `BCC → BCH` : Le fork Bitcoin Cash est souvent désigné par deux noms symboliques différents : `BCC` et `BCH`. Le nom `BCC` est ambigu pour Bitcoin Cash, car il est confondu avec BitConnect. La bibliothèque ccxt convertira `BCC` en `BCH` le cas échéant (certaines plateformes d'échange et agrégateurs les confondent).
- `DRK → DASH` : `DASH` était Darkcoin avant de devenir Dash ([en savoir plus](https://minergate.com/blog/dashcoin-and-dash/)).
- `BCHABC → BCH` : Le 15 novembre 2018, Bitcoin Cash a subi un second fork ; il existe désormais `BCH` (pour BCH ABC) et `BSV` (pour BCH SV).
- `BCHSV → BSV` : Il s'agit d'une substitution courante pour le fork Bitcoin Cash SV (certaines plateformes l'appellent `BSV`, d'autres `BCHSV` ; nous utilisons le premier).
- `DSH → DASH` : Ne pas confondre les symboles et les devises. Le `DSH` (Dashcoin) n'est pas le même que `DASH` (Dash). Certaines plateformes d'échange étiquettent `DASH` de façon incohérente sous le nom `DSH` ; la bibliothèque ccxt effectue également une correction pour cela (`DSH → DASH`), mais uniquement sur certaines plateformes qui confondent ces deux devises, tandis que la plupart des plateformes les distinguent correctement. Souvenez-vous simplement que `DASH/BTC` n'est pas la même chose que `DSH/BTC`.
- `XRB` → `NANO` : `NANO` est le code plus récent pour RaiBlocks ; ainsi, l'API unifiée CCXT remplacera l'ancien `XRB` par `NANO` selon les besoins. https://hackernoon.com/nano-rebrand-announcement-9101528a7b76
- `USD` → `USDT` : Certaines plateformes d'échange, comme Bitfinex, HitBTC et quelques autres, désignent la devise sous le nom `USD` dans leurs listes, mais ces marchés négocient en réalité des `USDT`. La confusion peut provenir d'une limitation à 3 lettres pour les noms de symboles ou d'autres raisons. Dans les cas où la devise négociée est réellement `USDT` et non `USD`, la bibliothèque CCXT effectuera la conversion `USD` → `USDT`. Notez toutefois que certaines plateformes disposent à la fois des symboles `USD` et `USDT` ; par exemple, Kraken propose une paire de trading `USDT/USD`.

#### Notes Sur La Cohérence Des Noms

Chaque plateforme d'échange possède un tableau associatif de substitutions pour les codes symboliques des crypto-monnaies dans la propriété `exchange.commonCurrencies`, tel que :
```
'commonCurrencies' : {
    'XBT': 'BTC',
    'OPTIMISM': 'OP',
    // ... etc
}
```
où la clé représente le nom réel utilisé par le moteur de la plateforme pour désigner cette devise, et la valeur représente ce par quoi vous souhaitez y faire référence via ccxt.

Parfois, l'utilisateur peut remarquer des noms de symboles exotiques avec des mots en casse mixte et des espaces dans le code. La logique derrière ces noms est expliquée par les règles de résolution des conflits de nommage et de codage des devises lorsqu'une ou plusieurs devises partagent le même code symbolique sur différentes plateformes d'échange :

- D'abord, nous collectons toutes les informations disponibles auprès des plateformes d'échange elles-mêmes concernant les codes de devises en question. Elles disposent généralement d'une description de leurs listes de devises quelque part dans leur API, leur documentation, leurs bases de connaissances ou ailleurs sur leurs sites web.
- Lorsque nous identifions chaque crypto-monnaie particulière associée au code de devise, nous les recherchons sur [CoinMarketCap](https://coinmarketcap.com).
- La devise ayant la plus grande capitalisation boursière remporte le code de devise et le conserve. Par exemple, HOT désigne souvent soit `Holo` soit `Hydro Protocol`. Dans ce cas, `Holo` conserve le code `HOT`, et `Hydro Protocol` aura son nom comme code, littéralement `Hydro Protocol`. Il peut donc exister des paires de trading avec des symboles tels que `HOT/USD` (pour `Holo`) et `Hydro Protocol/USD` — ce sont deux marchés distincts.
- Si la capitalisation boursière d'une devise particulière est inconnue ou insuffisante pour déterminer le gagnant, nous prenons également en compte les volumes de trading et d'autres facteurs.
- Une fois le gagnant déterminé, toutes les autres devises concurrentes voient leurs codes correctement remappés et substitués au sein des plateformes conflictuelles via `.commonCurrencies`. **Notez qu'elle doit être définie avant que `.loadMarkets()` ne soit appelé !**
- Malheureusement, ce travail est en cours, car de nouvelles devises sont listées quotidiennement et de nouvelles plateformes d'échange sont ajoutées de temps en temps ; en général, il s'agit d'un processus sans fin d'auto-correction dans un environnement en rapide évolution, pratiquement en *"mode live"*. Nous sommes reconnaissants pour tous les conflits et incohérences signalés que vous pourriez trouver.

#### Questions Sur La Cohérence Des Noms

_Est-il possible que les symboles changent ?_

En bref, oui, parfois, mais rarement. Les correspondances symboliques peuvent être modifiées si c'est absolument nécessaire et inévitable. Cependant, tous les changements symboliques précédents étaient liés à la résolution de conflits ou de forks. Jusqu'à présent, il n'y a eu aucun précédent où la capitalisation boursière d'une devise dépasse celle d'une autre devise avec le même code symbolique dans CCXT.

_Peut-on compter sur le fait que la même crypto sera toujours listée avec le même symbole ?_

Plus ou moins ) Premièrement, cette bibliothèque est un travail en cours, et elle tente de s'adapter à une réalité en constante évolution ; il peut donc y avoir des conflits que nous résoudrons en modifiant certaines correspondances à l'avenir. En fin de compte, la licence stipule « sans garanties, à vos propres risques ». Cependant, nous ne modifions pas les correspondances symboliques de façon aléatoire, car nous en comprenons les conséquences ; nous souhaitons également nous appuyer sur la bibliothèque et nous n'aimons pas du tout rompre la compatibilité ascendante.

S'il arrive qu'un symbole d'un jeton majeur soit forké ou doive être modifié, le contrôle reste entre les mains des utilisateurs. La propriété `exchange.commonCurrencies` peut être [remplacée lors de l'initialisation ou ultérieurement](#overriding-exchange-properties-upon-instantiation), tout comme n'importe quelle autre propriété d'échange. Si un jeton important est impliqué, nous publions généralement des instructions sur la manière de conserver l'ancien comportement en ajoutant quelques lignes aux paramètres du constructeur.

#### Cohérence Des Devises De Base Et De Cotation

Cela dépend de la plateforme d'échange que vous utilisez, mais certaines d'entre elles ont une paire inversée (incohérente) de `base` et `quote`. Elles ont en réalité les devises de base et de cotation inversées (permutées/inversées). Dans ce cas, vous verrez une différence entre les valeurs des devises `base` et `quote` parsées et l'`info` non parsée dans la sous-structure du marché.

Pour ces plateformes d'échange, ccxt effectuera une correction, en permutant et en normalisant les côtés des devises de base et de cotation lors du parsing des réponses de la plateforme. Cette logique est financièrement et terminologiquement correcte. Pour éviter toute confusion, gardez à l'esprit la règle suivante : **la base est toujours avant la barre oblique, la cotation est toujours après la barre oblique dans tout symbole et sur tout marché**.

```text
base currency ↓
             BTC / USDT
             ETH / BTC
            DASH / ETH
                    ↑ quote currency
```

#### Conventions De Nommage Des Contrats

Nous chargeons actuellement les marchés spot avec le schéma de symbole unifié `BASE/QUOTE` dans le mapping `.markets`, indexé par symbole. Cela créerait un conflit de nommage pour les contrats à terme et autres dérivés qui ont le même symbole que leurs homologues sur le marché spot. Pour accueillir les deux types de marchés dans `.markets`, nous exigeons que les symboles des marchés « future » et « spot » soient distincts, ainsi que les symboles des contrats « linear » et « inverse ».

**Veuillez consulter cette annonce : [Unified contract naming conventions](https://github.com/ccxt/ccxt/issues/10931)**

CCXT prend en charge les types de contrats dérivés suivants :

- `future` – pour les contrats à terme avec une date de livraison/règlement [](https://en.wikipedia.org/wiki/Futures_contract)
- `swap` – pour les swaps perpétuels sans date de livraison [](https://en.wikipedia.org/wiki/Perpetual_futures)
- `option` – pour les contrats d'options (https://en.wikipedia.org/wiki/Option_contract)

##### Future

Le symbole d'un marché future est composé de la devise sous-jacente, de la devise de cotation, de la devise de règlement et d'un identifiant arbitraire. Le plus souvent, l'identifiant est la date de règlement du contrat à terme au format `YYMMDD` :

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

##### Swap Perpétuel (Future Perpétuel)

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

### Réseaux Unifiés

| Réseau | Code CCXT  |
|---------------------------------------|--------------|
| Bitcoin                               | BTC          |
| Ethereum                              | ETH (Pour Ethereum) / ERC20 (Pour les jetons)          |
| Ripple                                | XRP          |
| Litecoin                              | LTC          |
| Dogecoin                              | DOGE         |
| Stellar                               | XLM          |
| Tron                                  | TRX (Pour TRX) / TRC20 (Pour les jetons)         |
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

## Rechargement forcé du cache des marchés

La méthode `loadMarkets () / load_markets ()` est également une méthode à effets secondaires qui sauvegarde le tableau des marchés sur l'instance de l'exchange. Vous n'avez besoin de l'appeler qu'une seule fois par exchange. Tous les appels ultérieurs à la même méthode renverront le tableau des marchés sauvegardé localement (en cache).

Une fois les marchés d'un exchange chargés, vous pouvez accéder aux informations sur les marchés à tout moment via la propriété `markets`. Cette propriété contient un tableau associatif des marchés indexés par symbole. Si vous avez besoin de forcer le rechargement de la liste des marchés après les avoir déjà chargés, passez à nouveau le drapeau reload = true à la même méthode.


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


# API implicite

- [Méthodes / Endpoints API](#api-methods--endpoints)
- [Méthodes API implicites](#implicit-api-methods)
- [API publique/privée](#publicprivate-api)
- [Appels synchrones vs asynchrones](#synchronous-vs-asynchronous-calls)
- [Passage de paramètres aux méthodes API](#passing-parameters-to-api-methods)

## Méthodes / Endpoints API

Chaque exchange propose un ensemble de méthodes API. Chaque méthode de l'API est appelée un *endpoint*. Les endpoints sont des URLs HTTP permettant d'interroger différents types d'informations. Tous les endpoints renvoient du JSON en réponse aux requêtes des clients.

En général, il existe un endpoint pour obtenir une liste de marchés d'un exchange, un endpoint pour récupérer un carnet d'ordres pour un marché particulier, un endpoint pour récupérer l'historique des transactions, des endpoints pour passer et annuler des ordres, pour le dépôt et le retrait d'argent, etc. En gros, chaque type d'action que vous pourriez effectuer sur un exchange particulier dispose d'une URL d'endpoint distincte proposée par l'API.

Étant donné que l'ensemble des méthodes diffère d'un exchange à l'autre, la bibliothèque ccxt implémente ce qui suit :
- une API publique et privée pour toutes les URLs et méthodes possibles
- une API unifiée prenant en charge un sous-ensemble de méthodes communes

Les URLs des endpoints sont prédéfinies dans la propriété `api` pour chaque exchange. Vous n'avez pas à les modifier, sauf si vous implémentez une nouvelle API d'exchange (vous devriez au moins savoir ce que vous faites).

La plupart des méthodes API spécifiques à un exchange sont implicites, ce qui signifie qu'elles ne sont pas définies explicitement quelque part dans le code. La bibliothèque implémente une approche déclarative pour définir les méthodes API implicites (non unifiées) des exchanges.

## Méthodes API implicites

Chaque méthode de l'API possède généralement son propre endpoint. La bibliothèque définit tous les endpoints pour chaque exchange particulier dans la propriété `.api`. Lors de la construction d'un exchange, une méthode implicite *magique* (aussi appelée *fonction partielle* ou *closure*) sera créée à l'intérieur de `defineRestApi()/define_rest_api()` sur l'instance de l'exchange pour chaque endpoint de la liste des endpoints `.api`. Ceci est réalisé de manière universelle pour tous les exchanges. Chaque méthode générée sera accessible à la fois en notation `camelCase` et `under_score`.

La définition des endpoints est une **liste complète de TOUTES les URLs API** exposées par un exchange. Cette liste est convertie en méthodes appelables lors de l'instanciation de l'exchange. Chaque URL dans la liste des endpoints API obtient une méthode appelable correspondante. Ceci est fait automatiquement pour tous les exchanges, ainsi la bibliothèque ccxt prend en charge **toutes les URLs possibles** offertes par les exchanges de cryptomonnaies.

Chaque méthode implicite reçoit un nom unique qui est construit à partir de la définition `.api`. Par exemple, un endpoint HTTPS PUT privé `https://api.exchange.com/order/{id}/cancel` aura une méthode d'exchange correspondante nommée `.privatePutOrderIdCancel()`/`.private_put_order_id_cancel()`. Un endpoint HTTPS GET public `https://api.exchange.com/market/ticker/{pair}` donnera lieu à la méthode correspondante nommée `.publicGetTickerPair()`/`.public_get_ticker_pair()`, et ainsi de suite.

Une méthode implicite prend un dictionnaire de paramètres, envoie la requête à l'exchange et renvoie un résultat JSON spécifique à l'exchange provenant de l'API **tel quel, sans analyse**. Pour passer un paramètre, ajoutez-le au dictionnaire explicitement sous une clé égale au nom du paramètre. Pour les exemples ci-dessus, cela ressemblerait à `.privatePutOrderIdCancel ({ id: '41987a2b-...' })` et `.publicGetTickerPair ({ pair: 'BTC/USD' })`.

La façon recommandée de travailler avec les exchanges n'est pas d'utiliser les méthodes implicites spécifiques à un exchange, mais d'utiliser les méthodes ccxt unifiées à la place. Les méthodes spécifiques à un exchange doivent être utilisées comme solution de repli dans les cas où une méthode unifiée correspondante n'est pas (encore) disponible.

Pour obtenir une liste de toutes les méthodes disponibles avec une instance d'exchange, y compris les méthodes implicites et les méthodes unifiées, vous pouvez simplement faire ce qui suit :

```text
console.log (new ccxt.kraken ())   // JavaScript
print(dir(ccxt.kraken()))           # Python
var_dump (new \ccxt\kraken ()); // PHP
```

## API publique/privée

Les URLs d'API sont souvent regroupées en deux ensembles de méthodes appelés *API publique* pour les données de marché et *API privée* pour le trading et l'accès aux comptes. Ces groupes de méthodes API sont généralement préfixés par le mot 'public' ou 'private'.

Une API publique est utilisée pour accéder aux données de marché et ne nécessite aucune authentification. La plupart des exchanges fournissent librement des données de marché à tous (dans la limite de leur débit). Avec la bibliothèque ccxt, n'importe qui peut accéder aux données de marché sans avoir à s'enregistrer auprès des exchanges et sans avoir à configurer des clés de compte et des mots de passe.

Les API publiques comprennent les éléments suivants :

- instruments/paires de trading
- flux de prix (taux de change)
- carnets d'ordres (L1, L2, L3...)
- historique des transactions (ordres clôturés, transactions, exécutions)
- tickers (spot / prix sur 24h)
- séries OHLCV pour les graphiques
- autres endpoints publics

L'API privée est principalement utilisée pour le trading et pour accéder aux données privées spécifiques à un compte, elle nécessite donc une authentification. Vous devez obtenir les clés d'API privées auprès des exchanges. Cela implique souvent de s'inscrire sur le site web d'un exchange et de créer des clés API pour votre compte. La plupart des exchanges exigent des informations personnelles ou une identification. Certains exchanges n'autorisent le trading qu'après la vérification KYC.
Les API privées permettent les actions suivantes :

- gérer les informations personnelles du compte
- consulter les soldes du compte
- trader en passant des ordres au marché et à cours limité
- créer des adresses de dépôt et alimenter des comptes
- demander le retrait de fonds en fiat et en crypto
- consulter les ordres ouverts / clôturés personnels
- consulter les positions dans le trading sur marge/levier
- obtenir l'historique du grand livre
- transférer des fonds entre comptes
- utiliser des services marchands

Certains exchanges proposent la même logique sous différents noms. Par exemple, une API publique est aussi souvent appelée *market data*, *basic*, *market*, *mapi*, *api*, *price*, etc. Tous ces termes désignent un ensemble de méthodes pour accéder aux données disponibles au public. Une API privée est aussi souvent appelée *trading*, *trade*, *tapi*, *exchange*, *account*, etc.

Quelques exchanges exposent également une API marchande qui vous permet de créer des factures et d'accepter des paiements en crypto et en fiat de vos clients. Ce type d'API est souvent appelé *merchant*, *wallet*, *payment*, *ecapi* (pour l'e-commerce).

Pour obtenir une liste de toutes les méthodes disponibles avec une instance d'exchange, vous pouvez simplement faire ce qui suit :

```text
console.log (new ccxt.kraken ())   // JavaScript
print(dir(ccxt.kraken()))           # Python
var_dump (new \ccxt\kraken ()); // PHP
```

**contrat uniquement et marge uniquement**

- les méthodes de cette documentation documentées comme **contrat uniquement** ou **marge uniquement** sont uniquement destinées à être utilisées pour le trading de contrats et le trading sur marge respectivement. Elles peuvent fonctionner lors du trading sur d'autres types de marchés, mais renverront très probablement des informations non pertinentes.

## Appels synchrones vs asynchrones


#### **Javascript**

Dans la version JavaScript de CCXT, toutes les méthodes sont asynchrones et renvoient des [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) qui se résolvent avec un objet JSON décodé. Dans CCXT, nous utilisons la syntaxe moderne *async/await* pour travailler avec les Promises. Si vous n'êtes pas familier avec cette syntaxe, vous pouvez en savoir plus à ce sujet [ici](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function).

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

La bibliothèque ccxt prend en charge le mode de concurrence asynchrone en Python 3.5+ avec la syntaxe async/await. La version Python asynchrone utilise [asyncio](https://docs.python.org/3/library/asyncio.html) pur avec [aiohttp](http://aiohttp.readthedocs.io). En mode async, vous disposez de toutes les mêmes propriétés et méthodes, mais la plupart des méthodes sont décorées avec le mot-clé async. Si vous souhaitez utiliser le mode async, vous devez vous lier au sous-paquet `ccxt.async_support`, comme dans l'exemple suivant :

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

CCXT prend en charge les versions PHP 8+. La bibliothèque dispose à la fois de versions synchrones et asynchrones. Pour utiliser la version synchrone, utilisez l'espace de noms `\ccxt` (c'est-à-dire `new ccxt\binance()`) et pour utiliser la version asynchrone, utilisez l'espace de noms `\ccxt\async` (c'est-à-dire `new ccxt\async\binance()`). La version asynchrone utilise la bibliothèque [ReactPHP](https://reactphp.org/) en arrière-plan. En mode async, vous disposez de toutes les mêmes propriétés et méthodes, mais toute méthode API réseau doit être décorée avec le mot-clé `\React\Async\await` et votre script doit être dans un wrapper ReactPHP :
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

Consultez d'autres exemples dans le répertoire `examples/php` ; recherchez les noms de fichiers qui incluent le mot `async`. Assurez-vous également d'avoir installé les dépendances requises en utilisant `composer require recoil/recoil clue/buzz-react react/event-loop recoil/react react/http`. Enfin, [cet article](https://sergeyzhuk.me/2018/10/26/from-promise-to-coroutines/) fournit une bonne introduction aux méthodes utilisées ici. Bien que syntaxiquement le changement soit simple (c'est-à-dire utiliser simplement un mot-clé `yield` avant les méthodes pertinentes), la concurrence a des implications significatives pour la conception globale de votre code.

#### **Go**

En Go, chaque méthode réseau est synchrone et renvoie une paire `(value, error)` — il n'existe pas de variante async. Vérifiez toujours l'`error` renvoyée avant d'utiliser la valeur :

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

En C#, chaque méthode réseau est asynchrone et renvoie un `Task<T>` que vous `await`. Les méthodes unifiées utilisent le natif `async`/`await` :

```csharp
// C#

var exchange = new Kraken();
var ticker = await exchange.FetchTicker("ETH/BTC");
Console.WriteLine(exchange.id + " " + ticker.last);
```

#### **Java**

En Java, chaque exchange possède sa propre sous-classe typée. Chaque méthode typée fournit
**à la fois** une surcharge sync bloquante et une surcharge async non bloquante retournant un `CompletableFuture` — symétriques pour REST `fetch*` / `fetch*Async` et WS `watch*` /
`watch*Async` :

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

La même paire sync/async s'applique aux classes pro (WebSocket) — `watchTicker`
bloque pour une mise à jour ; `watchTickerAsync` renvoie un `CompletableFuture<Ticker>`
qui se complète à la prochaine mise à jour :

```java
import io.github.ccxt.exchanges.pro.Binance;

var ws = new Binance();
ws.loadMarkets(false);

// WS — synchronous (blocks for one update)
Ticker tick = ws.watchTicker("BTC/USDT");

// WS — asynchronous (composable with allOf, anyOf, thenApply, ...)
CompletableFuture<Ticker> stream = ws.watchTickerAsync("BTC/USDT", null);
```


### Objets JSON retournés

Toutes les méthodes API publiques et privées renvoient des objets JSON bruts décodés en réponse des exchanges, tels quels, sans modification. L'API unifiée renvoie des objets décodés en JSON dans un format commun et structurés de manière uniforme pour tous les exchanges.

## Passage de paramètres aux méthodes API

L'ensemble de tous les endpoints API possibles diffère d'un exchange à l'autre. La plupart des méthodes acceptent un seul tableau associatif (ou un dict Python) de paramètres clé-valeur. Les paramètres sont passés comme suit :

```text
bitso.publicGetTicker ({ book: 'eth_mxn' })                 // JavaScript
ccxt.zaif().public_get_ticker_pair ({ 'pair': 'btc_jpy' })  # Python
$luno->public_get_ticker (array ('pair' => 'XBTIDR'));      // PHP
```

Les méthodes unifiées des exchanges peuvent attendre et accepteront divers `params` qui influencent leur fonctionnalité, comme :

```python
params = {'type':'margin', 'isIsolated': 'TRUE'}  # --------------┑
# params will go as the last argument to the unified method       |
#                                                                 v
binance.create_order('BTC/USDT', 'limit', 'buy', amount, price, params)
```

Un exchange n'acceptera pas les paramètres d'un autre exchange, ils ne sont pas interchangeables. La liste des paramètres acceptés est définie par chaque exchange spécifique.

Pour savoir quels paramètres peuvent être passés à une méthode unifiée :

- soit ouvrir le fichier d'[implémentation spécifique à l'exchange](https://github.com/ccxt/ccxt/tree/master/js) et rechercher la fonction souhaitée (c'est-à-dire `createOrder`) pour inspecter et découvrir les détails de l'utilisation des `params`
- soit se rendre dans la documentation API de l'exchange et lire la liste des paramètres pour votre fonction ou endpoint spécifique (c'est-à-dire `order`)

Pour une liste complète des paramètres de méthode acceptés par chaque exchange, veuillez consulter la [documentation API](#exchanges).

### Conventions de nommage des méthodes API

Le nom d'une méthode d'exchange est une chaîne concaténée composée du type (public ou privé), de la méthode HTTP (GET, POST, PUT, DELETE) et du chemin URL de l'endpoint, comme dans les exemples suivants :

| Nom de la méthode            | URL de base de l'API           | URL de l'endpoint              |
|------------------------------|--------------------------------|--------------------------------|
| publicGetIdOrderbook         | https://bitbay.net/API/Public  | {id}/orderbook                 |
| publicGetPairs               | https://bitlish.com/api        | pairs                          |
| publicGetJsonMarketTicker    | https://www.bitmarket.net      | json/{market}/ticker           |
| privateGetUserMargin         | https://bitmex.com             | user/margin                    |
| privatePostTrade             | https://btc-x.is/api           | trade                          |
| tapiCancelOrder              | https://yobit.net              | tapi/CancelOrder               |
| ...                          | ...                            | ...                            |

La bibliothèque ccxt prend en charge à la fois la notation camelCase (préférée en JavaScript) et la notation avec underscores (préférée en Python et PHP) ; ainsi, toutes les méthodes peuvent être appelées dans l'une ou l'autre notation ou style de codage, dans n'importe quel langage. Ces deux notations fonctionnent en JavaScript, Python et PHP :

```text
exchange.methodName ()  // camelcase pseudocode
exchange.method_name()  // underscore pseudocode
```

Pour obtenir la liste de toutes les méthodes disponibles d'une instance d'exchange, vous pouvez simplement procéder comme suit :

```text
console.log (new ccxt.kraken ())   // JavaScript
print(dir(ccxt.hitbtc()))           # Python
var_dump (new \ccxt\okcoin ()); // PHP
```

# API unifiée

- [Surcharge des paramètres de l'API unifiée](#overriding-unified-api-params)
- [Pagination](#pagination)
- [Pagination automatique](#automatic-pagination)

L'API ccxt unifiée est un sous-ensemble de méthodes communes aux exchanges. Elle contient actuellement les méthodes suivantes :

- `fetchMarkets ()` : Récupère la liste de tous les marchés disponibles sur un exchange et retourne un tableau d'objets Market tels que définis par la [structure Market](#market-structure) (avec des propriétés telles que `symbol`, `base`, `quote`, etc.). Certains exchanges ne disposent pas de moyens pour obtenir la liste des marchés via leur API en ligne. Pour ceux-là, la liste des marchés est codée en dur.
- `fetchCurrencies ()` : Récupère toutes les devises disponibles sur un exchange et retourne un dictionnaire associatif de devises (objets avec des propriétés telles que `code`, `name`, etc.). Certains exchanges ne disposent pas de moyens pour obtenir les devises via leur API en ligne. Pour ceux-là, les devises seront extraites des paires de marchés ou codées en dur.
- `loadMarkets ([reload])` : Retourne la liste des marchés sous forme d'objet indexé par symbole et la met en cache avec l'instance d'exchange. Retourne les marchés mis en cache s'ils sont déjà chargés, à moins que le drapeau `reload = true` ne soit forcé.
- `fetchOrderBook (symbol, limit = undefined, params = {})` : Récupère le carnet d'ordres L2/L3 pour un symbole de trading particulier.
- `fetchStatus (params = {})` : Retourne des informations sur le statut de l'exchange, soit à partir des informations codées en dur dans l'instance d'exchange, soit via l'API si disponible.
- `fetchL2OrderBook (symbol, limit = undefined, params)` : Carnet d'ordres de niveau 2 (agrégé par prix) pour un symbole particulier.
- `fetchTrades (symbol, since, limit, params)` : Récupère les transactions récentes pour un symbole de trading particulier.
- `fetchTicker (symbol)` : Récupère les dernières données de ticker pour un symbole de trading.
- `fetchBalance ()` : Récupère le solde.
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

## Surcharge des paramètres de l'API unifiée

Notez que la plupart des méthodes de l'API unifiée acceptent un argument optionnel `params`. Il s'agit d'un tableau associatif (un dictionnaire, vide par défaut) contenant les paramètres que vous souhaitez surcharger. Le contenu de `params` est spécifique à chaque exchange ; consultez la documentation API des exchanges pour connaître les champs et valeurs pris en charge. Utilisez le dictionnaire `params` si vous devez passer un paramètre personnalisé ou optionnel à votre requête unifiée.


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


## Pagination

La plupart des méthodes unifiées retournent soit un objet unique, soit un tableau simple (une liste) d'objets (transactions, ordres, opérations, etc.). Cependant, très peu d'exchanges (voire aucun) retourneront tous les ordres, toutes les transactions, toutes les bougies OHLCV ou toutes les opérations en une seule fois. La plupart du temps, leurs API `limit` limitent la sortie à un certain nombre d'objets les plus récents. **VOUS NE POUVEZ PAS OBTENIR TOUS LES OBJETS DEPUIS LE DÉBUT DES TEMPS JUSQU'AU MOMENT PRÉSENT EN UN SEUL APPEL**. En pratique, très peu d'exchanges tolèrent ou permettent cela.

Pour récupérer des ordres ou des transactions historiques, l'utilisateur devra parcourir les données par portions ou « pages » d'objets. La pagination implique souvent *« récupérer des portions de données une par une »* dans une boucle.

Dans la plupart des cas, les utilisateurs sont **tenus d'utiliser au moins un certain type de pagination** afin d'obtenir les résultats attendus de manière cohérente. Si l'utilisateur n'applique aucune pagination, la plupart des méthodes retourneront le comportement par défaut de l'exchange, qui peut commencer depuis le début de l'historique ou être un sous-ensemble des objets les plus récents. Le comportement par défaut (sans pagination) est spécifique à chaque exchange ! Les moyens de pagination sont souvent utilisés avec les méthodes suivantes en particulier :

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

Pour les méthodes retournant des listes d'objets, les exchanges peuvent proposer un ou plusieurs types de pagination. CCXT unifie la **pagination basée sur les dates** par défaut, avec des horodatages **en millisecondes** dans toute la bibliothèque.


### Pagination automatique

*Avertissement : il s'agit d'une fonctionnalité expérimentale qui peut produire des résultats inattendus ou incorrects dans certains cas.*

Récemment, CCXT a introduit un moyen de paginer automatiquement plusieurs résultats en fournissant simplement le drapeau `paginate` dans `params,` ce qui libère l'utilisateur de cette tâche. La plupart des exchanges leaders le prennent en charge, et d'autres seront ajoutés à l'avenir, mais le moyen le plus simple de le vérifier est de consulter la documentation de la méthode et de rechercher le paramètre *pagination*. Comme toujours, il existe des exceptions, et certains endpoints peuvent ne pas offrir de moyen de paginer via un horodatage ou un curseur ; dans ces cas, CCXT ne peut rien y faire.


Pour l'instant, nous disposons de trois méthodes de pagination différentes :
- **dynamique/basée sur le temps** : utilise les paramètres `until` et `since` pour paginer à travers des résultats dynamiques (transactions, ordres, opérations, etc.). Comme nous ne savons pas a priori combien d'entrées sont disponibles, elle effectuera une requête à la fois jusqu'à atteindre la fin des données ou le nombre maximum d'appels de pagination (configurable via une option)
- **déterministe** : lorsque nous pouvons pré-calculer les limites de chaque page, les requêtes seront effectuées de manière concurrente pour des performances maximales. Cela s'applique aux données OHLCV, aux taux de financement et à l'intérêt ouvert, et respecte également l'option `paginationCalls`.
- **basée sur un curseur** : lorsque l'exchange fournit un curseur dans la réponse, nous extrayons le curseur et effectuons la requête suivante jusqu'à la fin des données ou jusqu'au nombre maximum d'appels de pagination.

L'utilisateur ne peut pas sélectionner la méthode de pagination utilisée ; elle dépendra de l'implémentation en question, en tenant compte des fonctionnalités de l'API de l'exchange.

#### Paramètres de pagination

Nous ne pouvons pas effectuer un nombre infini de requêtes, et certaines d'entre elles peuvent générer une erreur pour différentes raisons ; c'est pourquoi nous disposons de certaines options qui permettent à l'utilisateur de contrôler ces variables et d'autres spécificités de la pagination.

*Toutes les options ci-dessous doivent être fournies dans `params`, vous pouvez consulter les exemples ci-dessous*

- **paginate** : (**boolean**) indique que l'utilisateur souhaite paginer à travers différentes pages pour obtenir plus de données. La valeur par défaut est *false*.
- **paginationCalls** : (**integer**) permet à l'utilisateur de contrôler le nombre maximum de requêtes pour paginer les données. En raison des limites de débit, cette valeur ne doit pas être trop élevée. La valeur par défaut est 10.
- **maxRetries** : (**integer**) combien de fois le mécanisme de pagination doit-il réessayer en cas d'erreur. La valeur par défaut est 3.
- **paginationDirection** : (**string**) S'applique uniquement à la pagination dynamique et peut être soit *forward* (démarrer la pagination depuis un moment dans le passé et paginer vers l'avant) soit *backward* (démarrer depuis le moment le plus récent et paginer vers l'arrière). Si *forward* est sélectionné, un paramètre *since* doit également être fourni. La valeur par défaut est *backward*.
- **maxEntriesPerRequest** : (**integer**) : Le nombre maximum d'entrées par requête afin de maximiser les données récupérées par appel. Il varie d'un endpoint à l'autre et CCXT remplira cette valeur pour vous, mais vous pouvez la surcharger si nécessaire.

#### Exemples

```python

trades = await binance.fetch_trades("BTC/USDT", params = {"paginate": True}) # dynamic/time-based

ohlcv = await binance.fetch_ohlcv("BTC/USDT", params = {"paginate": True, "paginationCalls": 5}) # deterministic-pagination will perform 5 requests

trades = await binance.fetch_trades("BTC/USDT", since = 1664812416000, params = {"paginate": True, "paginationDirection": "forward"}) # dynamic/time-based pagination starting from 1664812416000

ledger = await bybit.fetch_ledger(params = {"paginate": True}) # bybit returns a cursor so the pagination will be cursor-based

funding_rates = await binance.fetch_funding_rate_history("BTC/USDT:USDT", params = {"paginate": True, "maxEntriesPerRequest": 50}) # customizes the number of entries per request

```


### Utilisation des dates et horodatages

Tous les horodatages unifiés dans toute la bibliothèque CCXT sont des entiers **en millisecondes**, sauf indication contraire explicite.

Voici l'ensemble des méthodes pour travailler avec les dates et horodatages UTC et pour effectuer des conversions entre eux :

```javascript
exchange.parse8601 ('2018-01-01T00:00:00Z') == 1514764800000 // integer in milliseconds, Z = UTC
exchange.iso8601 (1514764800000) == '2018-01-01T00:00:00Z'   // from milliseconds to iso8601 string
exchange.seconds ()      // integer UTC timestamp in seconds
exchange.milliseconds () // integer UTC timestamp in milliseconds
```

### Pagination basée sur les dates

Il s'agit du type de pagination actuellement utilisé dans toute l'API unifiée CCXT. L'utilisateur fournit un horodatage `since` **en millisecondes** (!) et un nombre pour `limit` les résultats. Pour parcourir les objets d'intérêt page par page, l'utilisateur exécute ce qui suit (ci-dessous se trouve du pseudocode, qui peut nécessiter de surcharger certains paramètres spécifiques à l'exchange, selon l'exchange en question) :

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


### Pagination basée sur l'identifiant

L'utilisateur fournit un `from_id` de l'objet à partir duquel la requête doit continuer à retourner des résultats, ainsi qu'un nombre pour `limit` les résultats. Il s'agit du comportement par défaut sur certaines plateformes d'échange, mais ce type n'est pas encore unifié. Pour paginer des objets en fonction de leurs identifiants, l'utilisateur procède comme suit :


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


### Pagination par numéro de page (Curseur)

L'utilisateur fournit un numéro de page ou une valeur *initiale de « curseur »*. La plateforme d'échange retourne une page de résultats ainsi que la valeur du *« curseur » suivant*, pour continuer. La plupart des plateformes d'échange qui implémentent ce type de pagination retournent soit le curseur suivant dans la réponse elle-même, soit dans les en-têtes de la réponse HTTP.

Voir un exemple d'implémentation ici : https://github.com/ccxt/ccxt/blob/master/examples/py/coinbasepro-fetch-my-trades-pagination.py

À chaque itération de la boucle, l'utilisateur doit récupérer le curseur suivant et le placer dans les paramètres surchargés pour la prochaine requête (à l'itération suivante) :


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


# API publique

- [Carnet d'ordres](#order-book)
- [Cours des prix](#price-tickers)
- [Graphiques en chandeliers OHLCV](#ohlcv-candlestick-charts)
- [Transactions publiques](#public-trades)
- [Heure de la plateforme](#exchange-time)
- [Statut de la plateforme](#exchange-status)
- [Taux d'emprunt](#borrow-rates)
- [Historique des taux d'emprunt](#borrow-rate-history)
- [Paliers de levier](#leverage-tiers)
- [Taux de financement](#funding-rate)
- [Historique des taux de financement](#funding-rate-history)
- [Historique des intérêts ouverts](#open-interest-history)
- [Historique de la volatilité](#volatility-history)
- [Actifs sous-jacents](#underlying-assets)
- [Liquidations](#liquidations)
- [Grecques](#greeks)
- [Chaîne d'options](#option-chain)
- [Déléverage automatique](#auto-de-leverage)

## Carnet d'ordres

Les plateformes d'échange exposent des informations sur les ordres ouverts avec des prix d'achat (bid) et de vente (ask), des volumes et d'autres données. Il existe généralement un point de terminaison dédié pour interroger l'état actuel (instantané) du *carnet d'ordres* pour un marché particulier. Un carnet d'ordres est aussi souvent appelé *profondeur de marché*. Les informations du carnet d'ordres sont utilisées dans le processus de prise de décision de trading.

Pour obtenir des données sur les carnets d'ordres, vous pouvez utiliser

- `fetchOrderBook ()` // pour le carnet d'ordres d'un seul marché
- `fetchOrderBooks ( symbols )` // pour les carnets d'ordres de plusieurs marchés
- `fetchOrderBooks ()` // pour les carnets d'ordres de tous les marchés

```javascript
async fetchOrderBook (symbol, limit = undefined, params = {})
```

Paramètres

- **symbol** (String) *obligatoire* Symbole CCXT unifié (ex. `"BTC/USDT"`)
- **limit** (Integer) Le nombre d'ordres à retourner dans le carnet d'ordres (ex. `10`)
- **params** (Dictionary) Paramètres supplémentaires spécifiques au point de terminaison de l'API de la plateforme (ex. `{"endTime": 1645807945000}`)

Retourne

- Une [structure de carnet d'ordres](#order-book-structure)

```javascript
async fetchOrderBooks (symbols = undefined, limit = undefined, params = {})
```

Paramètres

- **symbols** (\[String\]) Symboles CCXT unifiés (ex. `["BTC/USDT", "ETH/USDT"]`)
- **limit** (Integer) Le nombre d'ordres à retourner dans le carnet d'ordres (ex. `10`)
- **params** (Dictionary) Paramètres supplémentaires spécifiques au point de terminaison de l'API de la plateforme (ex. `{"endTime": 1645807945000}`)

Retourne

- Un dictionnaire de [structures de carnet d'ordres](#order-book-structure) indexé par les symboles de marché

### Exemples fetchOrderBook


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


### Structure du carnet d'ordres

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

**L'horodatage et la date/heure peuvent être absents (`undefined/None/null`) si la plateforme d'échange concernée ne fournit pas de valeur correspondante dans la réponse de l'API.**

Les prix et les quantités sont des nombres flottants. Le tableau des offres d'achat (bids) est trié par prix en ordre décroissant. Le meilleur (plus élevé) prix d'achat est le premier élément et le moins bon (plus bas) prix d'achat est le dernier élément. Le tableau des offres de vente (asks) est trié par prix en ordre croissant. Le meilleur (plus bas) prix de vente est le premier élément et le moins bon (plus élevé) prix de vente est le dernier élément. Les tableaux bid/ask peuvent être vides s'il n'y a pas d'ordres correspondants dans le carnet d'ordres d'une plateforme.

Les plateformes d'échange peuvent retourner la pile d'ordres à différents niveaux de détail pour l'analyse. Il peut s'agir d'un détail complet contenant chaque ordre individuel, ou d'une version agrégée avec légèrement moins de détails où les ordres sont regroupés et fusionnés par prix et volume. Un niveau de détail plus élevé nécessite plus de trafic et de bande passante et est généralement plus lent, mais offre l'avantage d'une plus grande précision. Moins de détail est généralement plus rapide, mais peut ne pas être suffisant dans certains cas très spécifiques.

### Remarques sur la structure du carnet d'ordres

- Le `orderbook['timestamp']` correspond au moment où la plateforme d'échange a généré cette réponse de carnet d'ordres (avant de vous la renvoyer). Il peut être absent (`undefined/None/null`), comme indiqué dans le Manuel, toutes les plateformes ne fournissent pas d'horodatage à cet endroit. S'il est défini, il s'agit d'un horodatage UTC **en millisecondes** depuis le 1er janvier 1970 00:00:00.
- Certaines plateformes d'échange peuvent indexer les ordres dans le carnet d'ordres par leurs identifiants ; dans ce cas, l'identifiant de l'ordre peut être retourné comme troisième élément des bids et asks : `[ price, amount, id ]`. C'est souvent le cas avec les carnets d'ordres L3 sans agrégation. L'`id` de l'ordre, s'il est affiché dans le carnet d'ordres, fait référence au carnet d'ordres et ne correspond pas nécessairement à l'identifiant réel de l'ordre dans la base de données de la plateforme tel que vu par le propriétaire ou par les autres. L'identifiant de l'ordre est un `id` de la ligne dans le carnet d'ordres, mais pas nécessairement le vrai `id` de l'ordre (bien qu'ils puissent être égaux, selon la plateforme concernée).
- Dans certains cas, les plateformes d'échange peuvent fournir des carnets d'ordres agrégés L2 avec des comptages d'ordres pour chaque niveau agrégé ; dans ce cas, le nombre d'ordres peut être retourné comme troisième élément des bids et asks : `[ price, amount, count ]`. Le `count` indique combien d'ordres sont agrégés à chaque niveau de prix dans les bids et asks.
- De plus, certaines plateformes d'échange peuvent retourner l'horodatage de l'ordre comme troisième élément des bids et asks : `[ price, amount, timestamp ]`. Le `timestamp` indique quand l'ordre a été placé dans le carnet d'ordres.

### Profondeur de marché

Certaines plateformes d'échange acceptent un dictionnaire de paramètres supplémentaires pour la fonction `fetchOrderBook () / fetch_order_book ()`. **Tous les `params` supplémentaires sont spécifiques à la plateforme (non unifiés)**. Vous devrez consulter la documentation de la plateforme si vous souhaitez remplacer un paramètre particulier, comme la profondeur du carnet d'ordres. Vous pouvez obtenir un nombre limité d'ordres retournés ou un niveau d'agrégation souhaité (alias *profondeur de marché*) en spécifiant un argument `limit` et des `params` supplémentaires spécifiques à la plateforme comme suit :


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


Les niveaux de détail ou niveaux d'agrégation du carnet d'ordres sont souvent étiquetés numériquement comme L1, L2, L3...

- **L1** : moins de détail pour obtenir rapidement des informations très basiques, à savoir uniquement le prix du marché. Cela ressemble à un seul ordre dans le carnet d'ordres.
- **L2** : niveau d'agrégation le plus courant où les volumes d'ordres sont regroupés par prix. Si deux ordres ont le même prix, ils apparaissent comme un seul ordre pour un volume égal à leur somme totale. Il s'agit très probablement du niveau d'agrégation dont vous avez besoin pour la majorité des usages.
- **L3** : niveau de détail le plus fin sans agrégation où chaque ordre est distinct des autres ordres. Ce niveau de détail contient naturellement des doublons dans la sortie. Ainsi, si deux ordres ont des prix égaux, ils ne sont **pas** fusionnés et c'est au moteur de correspondance de la plateforme de décider de leur priorité dans la pile. Vous n'avez pas vraiment besoin du détail L3 pour trader avec succès. En fait, vous n'en avez probablement pas besoin du tout. C'est pourquoi certaines plateformes ne le supportent pas et retournent toujours des carnets d'ordres agrégés.

Si vous souhaitez obtenir un carnet d'ordres L2, quelle que soit la réponse de la plateforme, utilisez la méthode unifiée `fetchL2OrderBook(symbol, limit, params)` ou `fetch_l2_order_book(symbol, limit, params)`.

L'argument `limit` ne garantit pas que le nombre d'offres d'achat ou de vente sera toujours égal à `limit`. Il désigne la limite supérieure ou le maximum, de sorte qu'à un moment donné il peut y avoir moins de `limit` offres d'achat ou de vente. C'est le cas lorsque la plateforme n'a pas suffisamment d'ordres dans le carnet. Cependant, si l'API sous-jacente de la plateforme ne supporte pas du tout un paramètre `limit` pour le point de terminaison du carnet d'ordres, l'argument `limit` sera ignoré. CCXT ne réduit pas les tableaux `bids` et `asks` si la plateforme retourne plus que ce que vous demandez.

### Prix du marché

Pour obtenir le meilleur prix actuel (interroger le prix du marché) et calculer l'écart bid/ask, prenez le premier élément des tableaux bid et ask, comme suit :


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


## Cours des prix

Un cours de prix contient des statistiques pour un marché/symbole particulier sur une certaine période récente, généralement les dernières 24 heures. Les méthodes pour récupérer les cours sont décrites ci-dessous.

### Un seul cours pour un symbole

```javascript
// one ticker
fetchTicker (symbol, params = {})

// example
fetchTicker ('ETH/BTC')
fetchTicker ('BTC/USDT')
```

### Plusieurs cours pour tous les symboles ou plusieurs symboles

```javascript
// multiple tickers
fetchTickers (symbols = undefined, params = {})  // for all tickers at once

// for example
fetchTickers () // all symbols
fetchTickers ([ 'ETH/BTC', 'BTC/USDT' ]) // an array of specific symbols
```

Vérifiez les propriétés `exchange.has['fetchTicker']` et `exchange.has['fetchTickers']` de l'instance de la plateforme pour déterminer si la plateforme concernée supporte ces méthodes.

**Veuillez noter que l'appel de `fetchTickers ()` sans symbole est généralement soumis à des limites de taux strictes, et une plateforme peut vous bloquer si vous interrogez ce point de terminaison trop fréquemment.**

### Structure du cours

Un cours est un calcul statistique avec les informations calculées sur les dernières 24 heures pour un marché spécifique.

La structure d'un cours est la suivante :

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

#### Remarques sur la structure du cours

- Tous les champs du cours représentent les 24 heures précédant le `timestamp`.
- Le `bidVolume` est le volume (quantité) du meilleur prix d'achat actuel dans le carnet d'ordres.
- Le `askVolume` est le volume (quantité) du meilleur prix de vente actuel dans le carnet d'ordres.
- Le `baseVolume` est la quantité de devise de base échangée (achetée ou vendue) au cours des dernières 24 heures.
- Le `quoteVolume` est la quantité de devise de cotation échangée (achetée ou vendue) au cours des dernières 24 heures.

**Tous les prix dans la structure du cours sont en devise de cotation. Certains champs dans une structure de cours retournée peuvent être undefined/None/null.**

```text
base currency ↓
             BTC / USDT
             ETH / BTC
            DASH / ETH
                    ↑ quote currency
```

L'horodatage et la date/heure sont tous deux en Temps Universel Coordonné (UTC) en millisecondes.

- `ticker['timestamp']` est le moment où la plateforme a généré cette réponse (avant de vous la renvoyer). Il peut être absent (`undefined/None/null`), comme indiqué dans le Manuel, toutes les plateformes ne fournissent pas d'horodatage à cet endroit. S'il est défini, il s'agit d'un horodatage UTC **en millisecondes** depuis le 1er janvier 1970 00:00:00.
- `exchange.last_response_headers['Date']` est la chaîne de date/heure de la dernière réponse HTTP reçue (depuis les en-têtes HTTP). Le parseur 'Date' doit respecter le fuseau horaire indiqué. La précision de la date/heure est de 1 seconde, 1000 millisecondes. Cette date doit être définie par le serveur de la plateforme au moment où le message a été émis, conformément aux normes suivantes :
    - https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.18
    - https://tools.ietf.org/html/rfc1123#section-5.2.14
    - https://tools.ietf.org/html/rfc822#section-5

Bien que certaines plateformes d'échange intègrent les meilleurs prix bid/ask du carnet d'ordres dans leurs cours (et que certaines fournissent même les volumes bid/ask les plus élevés), vous ne devriez pas traiter un cours comme un substitut à `fetchOrderBook`. L'objectif principal d'un cours est de fournir des données statistiques ; à ce titre, traitez-le comme un « OHLCV en direct sur 24h ». Il est connu que les plateformes découragent les requêtes fréquentes de `fetchTicker` en imposant des limites de taux plus strictes sur ces requêtes. Si vous avez besoin d'un accès unifié aux prix bid et ask, vous devriez plutôt utiliser la famille `fetchL[123]OrderBook`.

Pour obtenir les prix et volumes historiques, utilisez la méthode unifiée [`fetchOHLCV`](#ohlcv-candlestick-charts) lorsqu'elle est disponible. Pour obtenir les prix historiques de marque, d'index et d'index premium, ajoutez l'un des paramètres `'price': 'mark'`, `'price': 'index'`, `'price': 'premiumIndex'` respectivement aux [substitutions de paramètres](#overriding-unified-api-params) de `fetchOHLCV`. Il existe également des méthodes pratiques `fetchMarkPriceOHLCV`, `fetchIndexPriceOHLCV` et `fetchPremiumIndexOHLCV` qui permettent d'obtenir les prix et volumes historiques de marque, d'index et d'index premium.

Méthodes pour récupérer les tickers :

- `fetchTicker (symbol[, params = {}])`, le symbole est obligatoire, les paramètres sont optionnels
- `fetchTickers ([symbols = undefined[, params = {}]])`, les deux arguments sont optionnels

### Individuellement par symbole

Pour obtenir les données de ticker individuelles d'une plateforme d'échange pour une paire de trading particulière ou un symbole spécifique – appelez `fetchTicker (symbol)` :


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


### Tous à la fois

Certaines plateformes d'échange (pas toutes) prennent également en charge la récupération de tous les tickers en une seule fois. Consultez [leur documentation](#exchanges) pour plus de détails. Vous pouvez récupérer tous les tickers avec un seul appel de la façon suivante :


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


La récupération de tous les tickers nécessite plus de trafic que la récupération d'un seul ticker. Notez également que certaines plateformes d'échange imposent des limites de débit plus élevées lors des récupérations successives de tous les tickers (consultez leur documentation sur les endpoints correspondants pour plus de détails). **Le coût de l'appel `fetchTickers()` en termes de limite de débit est souvent supérieur à la moyenne**. Si vous n'avez besoin que d'un seul ticker, la récupération par symbole particulier est également plus rapide. Vous voudrez probablement récupérer tous les tickers uniquement si vous en avez vraiment besoin, et il est fort probable que vous ne souhaitiez pas appeler fetchTickers plus fréquemment qu'une fois par minute environ.

De plus, certaines plateformes d'échange peuvent imposer des exigences supplémentaires à l'appel `fetchTickers()`. Parfois, vous ne pouvez pas récupérer les tickers de tous les symboles en raison des limitations de l'API de la plateforme concernée. Certaines plateformes acceptent une liste de symboles dans les paramètres de requête URL HTTP, cependant, comme la longueur des URL est limitée, et dans des cas extrêmes les plateformes peuvent avoir des milliers de marchés – une liste de tous leurs symboles ne tiendrait tout simplement pas dans l'URL, il doit donc s'agir d'un sous-ensemble limité de leurs symboles. Parfois, il existe d'autres raisons pour lesquelles une liste de symboles est requise, et il peut y avoir une limite sur le nombre de symboles que vous pouvez récupérer en une seule fois, mais quelle que soit la limitation, veuillez en tenir la plateforme d'échange responsable. Pour transmettre les symboles qui vous intéressent à la plateforme d'échange, vous pouvez fournir une liste de chaînes de caractères comme premier argument de fetchTickers :


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


Notez que la liste de symboles n'est pas requise dans la plupart des cas, mais vous devez ajouter une logique supplémentaire si vous souhaitez gérer toutes les limitations possibles pouvant être imposées du côté des plateformes d'échange.

Comme la plupart des méthodes de l'API CCXT unifiée, le dernier argument de fetchTickers est l'argument `params` permettant de substituer les paramètres de requête envoyés à la plateforme d'échange.

La structure de la valeur retournée est la suivante :

```javascript
{
    'info':    { ... }, // the original JSON response from the exchange as is
    'BTC/USD': { ... }, // a single ticker for BTC/USD
    'ETH/BTC': { ... }, // a ticker for ETH/BTC
    ...
}
```

Une solution générale pour récupérer tous les tickers de toutes les plateformes d'échange (même celles qui n'ont pas d'endpoint API correspondant) est en cours de développement, cette section sera bientôt mise à jour.

```text
UNDER CONSTRUCTION
```

## Graphiques en chandeliers OHLCV

La plupart des plateformes d'échange disposent d'endpoints pour récupérer les données OHLCV, mais certaines n'en ont pas. La propriété booléenne (true/false) de la plateforme d'échange nommée `has['fetchOHLCV']` indique si la plateforme prend en charge les séries de données en chandeliers ou non.

Pour récupérer les bougies/barres OHLCV d'une plateforme d'échange, ccxt dispose de la méthode `fetchOHLCV`, qui est déclarée de la façon suivante :

```javascript
fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {})
```

Vous pouvez appeler la méthode unifiée `fetchOHLCV` / `fetch_ohlcv` pour obtenir la liste des bougies OHLCV pour un symbole particulier comme suit :


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


Pour obtenir la liste des intervalles de temps disponibles pour votre plateforme d'échange, consultez la propriété `timeframes`. Notez qu'elle n'est remplie que lorsque `has['fetchOHLCV']` est également vrai.

La liste de bougies retournée peut comporter une ou plusieurs périodes manquantes, si la plateforme d'échange n'a enregistré aucune transaction pour la plage de temps et le symbole spécifiés. Pour un utilisateur, cela apparaîtrait comme des lacunes dans une liste continue de bougies. Cela est considéré comme normal. Si la plateforme d'échange n'avait pas de bougies à ce moment-là, la bibliothèque CCXT affichera les résultats tels que retournés par la plateforme elle-même.

**Il existe une limite quant à la profondeur temporelle de vos requêtes.** La plupart des plateformes d'échange ne permettent pas d'interroger l'historique détaillé des bougies (comme celles pour les intervalles de 1 minute et 5 minutes) trop loin dans le passé. Elles conservent généralement une quantité raisonnable de bougies récentes, comme les 1000 dernières bougies pour n'importe quel intervalle de temps, ce qui est largement suffisant pour la plupart des besoins. Vous pouvez contourner cette limitation en récupérant continuellement (alias *REST polling*) les derniers OHLCV et en les stockant dans un fichier CSV ou dans une base de données.

**Notez que les informations de la dernière bougie (en cours) peuvent être incomplètes jusqu'à la clôture de la bougie (jusqu'au début de la bougie suivante).**

Comme pour la plupart des autres méthodes unifiées et implicites, la méthode `fetchOHLCV` accepte comme dernier argument un tableau associatif (un dictionnaire) de `params` supplémentaires, qui est utilisé pour [substituer les valeurs par défaut](#overriding-unified-api-params) envoyées dans les requêtes aux plateformes d'échange. Le contenu de `params` est spécifique à chaque plateforme d'échange ; consultez la documentation de l'API des plateformes pour connaître les champs et valeurs pris en charge.

L'argument `since` est un horodatage UTC entier **en millisecondes** (partout dans la bibliothèque avec toutes les méthodes unifiées).

Si `since` n'est pas spécifié, la méthode `fetchOHLCV` retournera la plage de temps telle qu'elle est définie par défaut par la plateforme d'échange elle-même. Ce n'est pas un bug. Certaines plateformes d'échange retourneront des bougies depuis le début des temps, d'autres ne retourneront que les bougies les plus récentes ; le comportement par défaut des plateformes est attendu. Ainsi, sans spécifier `since`, la plage des bougies retournées sera spécifique à chaque plateforme d'échange. Il convient de passer l'argument `since` pour s'assurer d'obtenir précisément la plage d'historique souhaitée.

### Obtenir la réponse OHLCV brute

Actuellement, la structure utilisée par CCXT n'inclut pas la réponse brute de la plateforme d'échange. Cependant, les utilisateurs peuvent être en mesure de substituer la valeur de retour en procédant comme suit :


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


### Notes sur la latence

Les stratégies de trading nécessitent des informations récentes et à jour pour l'analyse technique, les indicateurs et les signaux. La construction d'une stratégie de trading spéculative basée sur les bougies OHLCV reçues de la plateforme d'échange peut présenter des inconvénients critiques. Les développeurs doivent tenir compte des détails expliqués dans cette section pour construire des bots performants.

Tout d'abord, lorsque vous utilisez CCXT, vous communiquez directement avec les plateformes d'échange. CCXT n'est pas un serveur, ni un service, c'est une bibliothèque logicielle. Toutes les données que vous obtenez avec CCXT sont reçues directement des plateformes d'échange en première main.

Les plateformes d'échange fournissent généralement deux catégories de données de marché publiques :

1. Des données primaires de premier ordre rapides qui incluent les carnets d'ordres en temps réel et les transactions ou exécutions
2. Des données de second ordre lentes qui incluent les tickers secondaires et les bougies OHLCV kline, calculées à partir des données de premier ordre

Les données primaires de premier ordre sont mises à jour par les APIs des plateformes d'échange en pseudo temps réel, ou aussi proche du temps réel que possible, aussi rapidement que possible. Les données de second ordre nécessitent du temps à la plateforme d'échange pour les calculer. Par exemple, un ticker n'est rien de plus qu'une coupe statistique glissante sur 24 heures des carnets d'ordres et des transactions. Les bougies et volumes OHLCV sont également calculés à partir des transactions de premier ordre et représentent des coupes statistiques fixes de périodes spécifiques. Le volume échangé en une heure est simplement la somme des volumes échangés des transactions correspondantes qui se sont produites au cours de cette heure.

Il est évident qu'il faut un certain temps à la plateforme d'échange pour collecter les données de premier ordre et calculer les données statistiques secondaires. Cela signifie littéralement que **les tickers et les OHLCV sont toujours plus lents que les carnets d'ordres et les transactions**. En d'autres termes, il y a toujours une certaine latence dans l'API de la plateforme d'échange entre le moment où une transaction se produit et le moment où la bougie OHLCV correspondante est mise à jour ou publiée par l'API de la plateforme.

La latence (ou le temps nécessaire à l'API de la plateforme d'échange pour calculer les données secondaires) dépend de la rapidité du moteur de la plateforme, elle est donc spécifique à chaque plateforme. Les meilleurs moteurs de plateformes d'échange retourneront et mettront généralement à jour les bougies OHLCV et les tickers de la dernière minute à un rythme très rapide. Certaines plateformes peuvent le faire à intervalles réguliers, comme une fois par seconde ou une fois toutes les quelques secondes. Les moteurs de plateformes lents peuvent prendre des minutes pour mettre à jour les informations statistiques secondaires ; leurs APIs peuvent retourner la bougie OHLCV actuelle la plus récente avec quelques minutes de retard.

Si votre stratégie dépend des données récentes les plus fraîches de la dernière minute, vous ne voulez pas la construire sur la base des tickers ou des OHLCV reçus de la plateforme d'échange. Les tickers et les OHLCV des plateformes ne conviennent qu'à des fins d'affichage, ou pour des stratégies de trading simples sur des intervalles horaires ou journaliers qui sont moins sensibles à la latence.

Heureusement, les développeurs de stratégies de trading critiques en termes de temps n'ont pas à se fier aux données secondaires des plateformes d'échange et peuvent calculer les OHLCV et les tickers dans l'espace utilisateur. Cela peut être plus rapide et plus efficace que d'attendre que les plateformes d'échange mettent à jour les informations de leur côté. On peut agréger l'historique des transactions publiques en l'interrogeant fréquemment et calculer les bougies en parcourant la liste des transactions – veuillez consulter le fichier "build-ohlcv-bars" dans le [dossier examples](https://github.com/ccxt/ccxt/tree/master/examples)

En raison des différences dans leurs implémentations internes, les plateformes d'échange peuvent être plus rapides pour mettre à jour leurs données de marché primaires et secondaires via WebSockets. La latence reste spécifique à chaque plateforme, car le moteur de la plateforme a toujours besoin de temps pour calculer les données secondaires, que vous les interrogiez via l'API RESTful avec CCXT ou que vous obteniez des mises à jour via WebSockets avec CCXT Pro. Les WebSockets peuvent améliorer la latence réseau, donc une plateforme rapide fonctionnera encore mieux, mais l'ajout du support des abonnements WS ne fera pas fonctionner un moteur de plateforme lent beaucoup plus vite.

Si vous voulez rester au top de la latence des données de second ordre, vous devrez la calculer de votre côté et surpasser le moteur de la plateforme en termes de vitesse. Selon les besoins de votre application, cela peut s'avérer complexe, car vous devrez gérer la redondance, les "trous de données" dans l'historique, les temps d'arrêt des plateformes et d'autres aspects de l'agrégation des données, ce qui constitue tout un univers en soi qu'il est impossible de couvrir entièrement dans ce Manuel.


### Construire des barres OHLCV à partir des transactions

Comme indiqué dans le paragraphe ci-dessus, les utilisateurs peuvent construire manuellement des bougies en utilisant la méthode `buildOHLCV / build_ohlcv`. Vous pouvez consulter un exemple de fichier nommé "build-ohlcv-bars" dans le [dossier examples](https://github.com/ccxt/ccxt/tree/master/examples). 
Notes :
- Cette méthode s'attend à ce que les transactions fournies soient triées chronologiquement (la transaction la plus récente doit être la dernière dans le tableau)
- En raison de certaines erreurs possibles dans les entrées de transactions (provenant de `watch_ohlcv` ou d'autres sources), à l'intérieur de la méthode `build_ohlcv` nous ignorons les transactions dont le prix est `0`, afin d'éviter des valeurs distordues pour une bougie. Cependant, si vous ne souhaitez pas ignorer ces éléments de transaction, définissez une option :

```
exchange.options['buildOHLCV'] = {
    'skipZeroPrices': false
};
```

### Structure OHLCV

La méthode fetchOHLCV présentée ci-dessus retourne une liste (un tableau plat) de bougies OHLCV représentées par la structure suivante :

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

La liste des bougies est retournée triée par ordre croissant (historique/chronologique), la bougie la plus ancienne en premier, la bougie la plus récente en dernier.

### Graphiques en chandeliers Mark, Index et PremiumIndex

Pour obtenir les bougies historiques Mark, Index Price et Premium Index, passez le paramètre `'price'` [params-override](#overriding-unified-api-params) à `fetchOHLCV`. Le paramètre `'price'` accepte l'une des valeurs suivantes :

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

Il existe également des méthodes pratiques `fetchMarkOHLCV`, `fetchIndexOHLCV` et `fetchPremiumIndexOHLCV`


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


## Transactions publiques

```diff
- this is under heavy development right now, contributions appreciated
```

Vous pouvez appeler la méthode unifiée `fetchTrades` / `fetch_trades` pour obtenir la liste des transactions les plus récentes pour un symbole particulier. La méthode `fetchTrades` est déclarée de la façon suivante :

```javascript
async fetchTrades (symbol, since = undefined, limit = undefined, params = {})
```

Par exemple, si vous souhaitez afficher les transactions récentes pour tous les symboles un par un de manière séquentielle (attention au rateLimit !), vous procéderiez ainsi :


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


La méthode fetchTrades présentée ci-dessus retourne une liste ordonnée de transactions (un tableau plat, trié par horodatage en ordre croissant, la transaction la plus ancienne en premier, la plus récente en dernier). Une liste de transactions est représentée par la [structure de transaction](#trade-structure).

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

La plupart des plateformes retournent la majorité des champs ci-dessus pour chaque transaction, bien que certaines ne retournent pas le type, le sens, l'identifiant de transaction ou l'identifiant d'ordre. La plupart du temps, l'horodatage, la date/heure, le symbole, le prix et la quantité de chaque transaction sont garantis.

Le second argument optionnel `since` réduit le tableau par horodatage, le troisième argument `limit` réduit par nombre (quantité) d'éléments retournés.

Si l'utilisateur ne spécifie pas `since`, la méthode `fetchTrades` retournera la plage par défaut des transactions publiques de la plateforme. L'ensemble par défaut est propre à chaque plateforme : certaines retourneront les transactions depuis la date d'inscription d'une paire sur la plateforme, d'autres retourneront un ensemble réduit de transactions (par exemple, les dernières 24 heures, les 100 dernières transactions, etc.). Si l'utilisateur souhaite un contrôle précis sur la plage temporelle, il est responsable de spécifier l'argument `since`.

La plupart des méthodes unifiées retourneront soit un objet unique, soit un tableau simple (une liste) d'objets (transactions). Cependant, très peu de plateformes (si tant est qu'il en existe) retourneront toutes les transactions en une seule fois. Le plus souvent, leurs API `limit` la sortie à un certain nombre des objets les plus récents. **VOUS NE POUVEZ PAS OBTENIR TOUS LES OBJETS DEPUIS LE DÉBUT DES TEMPS JUSQU'AU MOMENT PRÉSENT EN UN SEUL APPEL**. En pratique, très peu de plateformes le toléreront ou le permettront.

Pour récupérer des transactions historiques, l'utilisateur devra parcourir les données par portions ou « pages » d'objets. La pagination implique souvent *« la récupération de portions de données une par une »* dans une boucle.

Dans la plupart des cas, les utilisateurs sont **tenus d'utiliser au moins un certain type de pagination** afin d'obtenir les résultats attendus de manière cohérente.

D'un autre côté, **certaines plateformes ne prennent pas en charge la pagination pour les transactions publiques du tout**. En général, les plateformes ne fourniront que les transactions les plus récentes.

La méthode `fetchTrades ()` / `fetch_trades()` accepte également un argument optionnel `params` (tableau associatif/dictionnaire, vide par défaut) comme quatrième argument. Vous pouvez l'utiliser pour passer des paramètres supplémentaires aux appels de méthode ou pour remplacer une valeur par défaut particulière (lorsque la plateforme le prend en charge). Consultez la documentation de l'API de votre plateforme pour plus de détails.

## Heure de la plateforme

La méthode `fetchTime()` (si disponible) retourne l'horodatage entier actuel en millisecondes depuis le serveur de la plateforme.

```javascript
fetchTime(params = {})
```

## Statut de la plateforme

Le statut de la plateforme décrit les dernières informations connues sur la disponibilité de l'API de la plateforme. Ces informations sont soit codées en dur dans la classe de la plateforme, soit récupérées en direct directement depuis l'API de la plateforme. La méthode `fetchStatus(params = {})` peut être utilisée pour obtenir ces informations. Le statut retourné par `fetchStatus` est l'un des suivants :

- Codé en dur dans la classe de la plateforme, par exemple si l'API est défaillante ou arrêtée.
- Mis à jour en utilisant le ping de la plateforme ou l'endpoint `fetchTime` pour vérifier si elle est active.
- Mis à jour en utilisant l'endpoint de statut dédié de l'API de la plateforme.

```javascript
fetchStatus(params = {})
```

### Structure du statut de la plateforme

La méthode `fetchStatus()` retournera une structure de statut comme illustré ci-dessous :

```javascript
{
    'status': 'ok', // 'ok', 'shutdown', 'error', 'maintenance'
    'updated': undefined, // integer, last updated timestamp in milliseconds if updated via the API
    'eta': undefined, // when the maintenance or outage is expected to end
    'url': undefined, // a link to a GitHub issue or to an exchange post on the subject
}
```

Les valeurs possibles dans le champ `status` sont :

- `'ok'` signifie que l'API de la plateforme est entièrement opérationnelle
- `'shutdown`' signifie que la plateforme a été fermée, et le champ `updated` doit contenir la date/heure de la fermeture
- `'error'` signifie que l'API de la plateforme est défaillante, ou que l'implémentation de la plateforme dans CCXT est défaillante
- `'maintenance'` signifie une maintenance régulière, et le champ `eta` doit contenir la date/heure à laquelle la plateforme devrait être à nouveau opérationnelle

## Taux d'emprunt

*marge uniquement*

Lors des ventes à découvert ou du trading avec effet de levier sur un marché spot, des devises doivent être empruntées. Des intérêts sont prélevés sur la devise empruntée.

Les données sur le taux d'emprunt pour une devise peuvent être récupérées en utilisant

- `fetchCrossBorrowRate ()` pour le taux d'emprunt d'une seule devise
- `fetchCrossBorrowRates ()` pour les taux d'emprunt de toutes les devises
- `fetchIsolatedBorrowRate ()` pour le taux d'emprunt d'une paire de trading
- `fetchIsolatedBorrowRates ()` pour les taux d'emprunt de toutes les paires de trading
- `fetchBorrowRatesPerSymbol ()` pour les taux d'emprunt des devises sur des marchés individuels

```javascript
fetchCrossBorrowRate (code, params = {})
```

Paramètres

- **code** (String) Code de devise CCXT unifié, requis (ex. `"USDT"`)
- **params** (Dictionary) Paramètres spécifiques à l'endpoint de l'API de la plateforme (ex. `{"settle": "USDT"}`)

Retourne

- Une [structure de taux d'emprunt](#borrow-rate-structure)

```javascript
fetchCrossBorrowRates (params = {})
```

Paramètres

- **params** (Dictionary) Paramètres spécifiques à l'endpoint de l'API de la plateforme (ex. `{"startTime": 1610248118000}`)

Retourne

- Un dictionnaire de [structures de taux d'emprunt](#borrow-rate-structure) avec les codes de devise unifiés comme clés

```javascript
fetchIsolatedBorrowRate (symbol, params = {})
```

Paramètres

- **symbol** (String) Symbole de marché CCXT unifié, requis (ex. `"BTC/USDT"`)
- **params** (Dictionary) Paramètres spécifiques à l'endpoint de l'API de la plateforme (ex. `{"settle": "USDT"}`)

Retourne

- Une [structure de taux d'emprunt isolé](#isolated-borrow-rate-structure)

```javascript
fetchIsolatedBorrowRates (params = {})
```

Paramètres

- **params** (Dictionary) Paramètres spécifiques à l'endpoint de l'API de la plateforme (ex. `{"startTime": 1610248118000}`)

Retourne

- Un dictionnaire de [structures de taux d'emprunt isolé](#isolated-borrow-rate-structure) avec les symboles de marché unifiés comme clés

### Structure du taux d'emprunt isolé

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

### Structure du taux d'emprunt

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

## Historique des taux d'emprunt

*marge uniquement*

La méthode `fetchBorrowRateHistory` récupère l'historique du taux d'intérêt d'emprunt d'une devise à des créneaux horaires spécifiques

```javascript
fetchBorrowRateHistory (code, since = undefined, limit = undefined, params = {})
```

Paramètres

- **code** (String) *requis* Code de devise CCXT unifié (ex. `"USDT"`)
- **since** (Integer) Horodatage pour le taux d'emprunt le plus ancien (ex. `1645807945000`)
- **limit** (Integer) Le nombre maximum de [structures de taux d'emprunt](#borrow-rate-structure) à récupérer (ex. `10`)
- **params** (Dictionary) Paramètres supplémentaires spécifiques à l'endpoint de l'API de la plateforme (ex. `{"endTime": 1645807945000}`)

Retourne

- Un tableau de [structures de taux d'emprunt](#borrow-rate-structure)

## Paliers de levier

*contrat uniquement*

- Les méthodes de paliers de levier sont privées sur **binance**

La méthode `fetchLeverageTiers()` peut être utilisée pour obtenir l'effet de levier maximum pour un marché à différentes tailles de position. Elle peut également être utilisée pour obtenir le taux de marge de maintenance et le montant maximum négociable pour un marché lorsque ces informations ne sont pas disponibles dans l'objet marché.

Bien que vous puissiez obtenir l'effet de levier maximum absolu pour un marché en accédant à `market['limits']['leverage']['max']`, pour de nombreux marchés de contrats, l'effet de levier maximum dépendra de la taille de votre position.

Vous pouvez accéder à ces limites en utilisant

- `fetchMarketLeverageTiers()` (symbole unique)
- `fetchLeverageTiers([symbol1, symbol2, ...])` (plusieurs symboles)
- `fetchLeverageTiers()` (tous les symboles de marché)

```javascript
fetchMarketLeverageTiers(symbol, params = {})
```

Paramètres

- **symbol** (String) *requis* Symbole CCXT unifié (ex. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Paramètres spécifiques à l'endpoint de l'API de la plateforme (ex. `{"settle": "usdt"}`)

Retourne

- une [structure de paliers de levier](#leverage-tiers-structure)

```javascript
fetchLeverageTiers(symbols = undefined, params = {})
```

Paramètres

- **symbols** (\[String\]) Symbole CCXT unifié (ex. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Paramètres spécifiques à l'endpoint de l'API de la plateforme (ex. `{"settle": "usdt"}`)

Retourne

- un tableau de [structures de paliers de levier](#leverage-tiers-structure)

### Structure des paliers de levier

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

Dans l'exemple ci-dessus :

- mises inférieures à 133,33       = un levier maximum de 75
- mises de 200 + 1000              = un levier maximum de 50
- un montant de mise de 150        = un levier maximum de (10000 / 150)   = 66,66
- mises entre 133,33 et 200        = un levier maximum de (10000 / mise) = 50,01 -> 74,99

**Note pour les utilisateurs de Huobi :** Huobi utilise à la fois l'effet de levier et le montant pour déterminer les taux de marge de maintenance : https://www.huobi.com/support/en-us/detail/900000089903

## Taux de financement

*contrat uniquement*

Les données sur les taux de financement actuels, les plus récents et les prochains peuvent être obtenues en utilisant les méthodes

- `fetchFundingRates ()` pour tous les symboles de marché
- `fetchFundingRates ([ symbol1, symbol2, ... ])` pour plusieurs symboles de marché
- `fetchFundingRate (symbol)` pour un symbole de marché unique

```javascript
fetchFundingRate (symbol, params = {})
```

Paramètres

- **symbol** (String) *requis* Symbole CCXT unifié (ex. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Paramètres spécifiques à l'endpoint de l'API de la plateforme (ex. `{"endTime": 1645807945000}`)

Retourne

- une [structure de taux de financement](#funding-rate-structure)

```javascript
fetchFundingRates (symbols = undefined, params = {})
```

Paramètres

- **symbols** (\[String\]) Un tableau/liste optionnel de symboles CCXT unifiés (ex. `["BTC/USDT:USDT", "ETH/USDT:USDT"]`)
- **params** (Dictionary) Paramètres spécifiques à l'endpoint de l'API de la plateforme (ex. `{"endTime": 1645807945000}`)

Retourne

- Un tableau de [structures de taux de financement](#funding-rate-structure) indexé par symboles de marché

## Intervalle de financement

*contrat uniquement*

Récupérez l'intervalle de financement actuel en utilisant les méthodes suivantes :

- `fetchFundingInterval (symbol)` pour un symbole de marché unique
- `fetchFundingIntervals ()` pour tous les symboles de marché
- `fetchFundingIntervals ([ symbol1, symbol2, ... ])` pour plusieurs symboles de marché

```javascript
fetchFundingInterval (symbol, params = {})
```

Paramètres

- **symbol** (String) *requis* Symbole CCXT unifié (ex. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Paramètres spécifiques à l'endpoint de l'API de la plateforme (ex. `{"endTime": 1645807945000}`)

Retourne

- Une [structure de taux de financement](#funding-rate-structure)

```javascript
fetchFundingIntervals (symbols = undefined, params = {})
```

Paramètres

- **symbols** (\[String\]) Un tableau/liste optionnel de symboles CCXT unifiés (ex. `["BTC/USDT:USDT", "ETH/USDT:USDT"]`)
- **params** (Dictionary) Paramètres spécifiques à l'endpoint de l'API de la plateforme (ex. `{"endTime": 1645807945000}`)

Retourne

- Un tableau de [structures de taux de financement](#funding-rate-structure)

### Structure du taux de financement

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

## Historique des taux de financement

*contrat uniquement*

```javascript
fetchFundingRateHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

Paramètres

- **symbol** (String) Symbole CCXT unifié (ex. `"BTC/USDT:USDT"`)
- **since** (Integer) Horodatage pour le taux de financement le plus ancien (ex. `1645807945000`)
- **limit** (Integer) Le nombre maximum de taux de financement à récupérer (ex. `10`)
- **params** (Dictionary) Paramètres supplémentaires spécifiques à l'endpoint de l'API de la plateforme (ex. `{"endTime": 1645807945000}`)

Retourne

- Un tableau de [structures d'historique des taux de financement](#funding-rate-history-structure)

### Structure de l'Historique des Taux de Financement

```javascript
{
    info: { ... },
    symbol: "BTC/USDT:USDT",
    fundingRate: -0.000068,
    timestamp: 1642953600000,
    datetime: "2022-01-23T16:00:00.000Z"
}
```

## Intérêt Ouvert

*contrats uniquement*

Utilisez la méthode `fetchOpenInterest` pour obtenir l'intérêt ouvert actuel d'un symbole depuis la plateforme d'échange. Utilisez `fetchOpenInterests` pour obtenir l'intérêt ouvert actuel de plusieurs symboles

```javascript
fetchOpenInterest (symbol, params = {})
```

Paramètres

- **symbol** (String) Symbole de marché CCXT unifié (ex. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Paramètres supplémentaires spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"endTime": 1645807945000}`)

Retourne

- Une [structure d'intérêt ouvert](#open-interest-structure)

```js
fetchOpenInterests (symbols = undefined, params = {})
```

- **symbols** ([String]) Un tableau/liste optionnel de symboles CCXT unifiés (ex. `["BTC/USDT:USDT", "ETH/USDT:USDT"]`). Laissez à `undefined` pour tous les symboles.
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"endTime": 1645807945000}`)

Retourne

- Un dictionnaire de [structures d'intérêt ouvert](#open-interest-structure)

### Historique de l'Intérêt Ouvert

*contrats uniquement*

Utilisez la méthode `fetchOpenInterestHistory` pour obtenir un historique de l'intérêt ouvert d'un symbole depuis la plateforme d'échange.

```javascript
fetchOpenInterestHistory (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {})
```

Paramètres

- **symbol** (String) Symbole de marché CCXT unifié (ex. `"BTC/USDT:USDT"`)
- **timeframe** (String) Consultez exchange.timeframes pour les valeurs disponibles
- **since** (Integer) Horodatage du premier enregistrement d'intérêt ouvert (ex. `1645807945000`)
- **limit** (Integer) Le nombre maximum de [structures d'intérêt ouvert](#open-interest-structures) à récupérer (ex. `10`)
- **params** (Dictionary) Paramètres supplémentaires spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"endTime": 1645807945000}`)

**Note pour les utilisateurs d'OKX :** au lieu d'un symbole unifié, okx.fetchOpenInterestHistory attend un code de devise CCXT unifié dans l'argument **symbol** (ex. `'BTC'`).

Retourne

- Un tableau de [structures d'intérêt ouvert](#open-interest-structure)

### Structure de l'Intérêt Ouvert

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

## Volatilité Historique

*options uniquement*

Utilisez la méthode `fetchVolatilityHistory` pour obtenir l'historique de volatilité du code d'un actif sous-jacent d'options depuis la plateforme d'échange.

```javascript
fetchVolatilityHistory (code, params = {})
```

Paramètres

- **code** (String) *requis* Code de devise CCXT unifié (ex. `"BTC"`)
- **params** (Dictionary) Paramètres supplémentaires spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"endTime": 1645807945000}`)

Retourne

- Un tableau de [structures d'historique de volatilité](#volatility-structure)

### Structure de Volatilité

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

## Actifs Sous-jacents

*contrats uniquement*

Utilisez la méthode `fetchUnderlyingAssets` pour obtenir les identifiants de marché des actifs sous-jacents pour un type de marché à terme depuis la plateforme d'échange.

```javascript
fetchUnderlyingAssets (params = {})
```

Paramètres

- **params** (Dictionary) Paramètres supplémentaires spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"instType": "OPTION"}`)
- **params.type** (String) Type de marché unifié, la valeur par défaut est 'option' (ex. `"option"`)

Retourne

- Une [structure d'actifs sous-jacents](#underlying-assets-structure)

### Structure des Actifs Sous-jacents

```javascript
[ 'BTC_USDT', 'ETH_USDT', 'DOGE_USDT' ]
```

## Historique des Règlements

*contrats uniquement*

Utilisez la méthode `fetchSettlementHistory` pour obtenir l'historique public des règlements d'un marché à terme depuis la plateforme d'échange. Utilisez `fetchMySettlementHistory` pour obtenir uniquement votre historique de règlements

```javascript
fetchMySettlementHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
fetchSettlementHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

Paramètres

- **symbol** (String) Symbole CCXT unifié (ex. `"BTC/USDT:USDT-230728-25500-P"`)
- **since** (Integer) Horodatage du premier règlement (ex. `1694073600000`)
- **limit** (Integer) Le nombre maximum de règlements à récupérer (ex. `10`)
- **params** (Dictionary) Paramètres supplémentaires spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"endTime": 1645807945000}`)

Retourne

- Un tableau de [structures d'historique de règlements](#settlement-history-structure)

### Structure de l'Historique des Règlements

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

*marge et contrats uniquement*

Utilisez la méthode `fetchLiquidations` pour obtenir les liquidations publiques d'une paire de trading depuis la plateforme d'échange. Utilisez `fetchMyLiquidations` pour obtenir uniquement votre historique de liquidations

```javascript
fetchMyLiquidations (symbol = undefined, since = undefined, limit = undefined, params = {})
fetchLiquidations (symbol, since = undefined, limit = undefined, params = {})
```

Paramètres

- **symbol** (String) Symbole CCXT unifié (ex. `"BTC/USDT:USDT-231006-25000-P"`)
- **since** (Integer) Horodatage de la première liquidation (ex. `1694073600000`)
- **limit** (Integer) Le nombre maximum de liquidations à récupérer (ex. `10`)
- **params** (Dictionary) Paramètres supplémentaires spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"until": 1645807945000}`)

Retourne

- Un tableau de [structures de liquidation](#liquidation-structure)

### Structure de Liquidation

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

## Grecques

*options uniquement*

Utilisez la méthode `fetchGreeks` pour obtenir les grecques publiques et la volatilité implicite d'une paire de trading d'options depuis la plateforme d'échange. Utilisez `fetchAllGreeks` pour obtenir les grecques pour tous les symboles ou plusieurs symboles.
Les grecques mesurent comment des facteurs tels que le prix de l'actif sous-jacent, le temps avant expiration, la volatilité et les taux d'intérêt affectent le prix d'un contrat d'options.

```javascript
fetchGreeks (symbol, params = {})
```

Paramètres

- **symbol** (String) Symbole CCXT unifié (ex. `"BTC/USD:BTC-240927-40000-C"`)
- **params** (Dictionary) Paramètres supplémentaires spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"category": "options"}`)

Retourne

- Une [structure de grecques](#greeks-structure)

```javascript
fetchAllGreeks (symbols = undefined, params = {})
```

Paramètres

- **symbols** (String) Symbole CCXT unifié (ex. `"BTC/USD:BTC-240927-40000-C"`)
- **params** (Dictionary) Paramètres supplémentaires spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"category": "options"}`)

// for example
fetchAllGreeks () // all symbols
fetchAllGreeks ([ 'BTC/USD:BTC-240927-40000-C', 'ETH/USD:ETH-240927-4000-C' ]) // an array of specific symbols

Retourne

- Une liste de [structures de grecques](#greeks-structure)

### Structure des Grecques

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

## Chaîne d'Options

*options uniquement*

Utilisez la méthode `fetchOption` pour obtenir les détails publics d'un contrat d'option unique depuis la plateforme d'échange.

```javascript
fetchOption (symbol, params = {})
```

Paramètres

- **symbol** (String) Symbole de marché CCXT unifié (ex. `"BTC/USD:BTC-240927-40000-C"`)
- **params** (Dictionary) Paramètres supplémentaires spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"category": "options"}`)

Retourne

- Une [structure de chaîne d'options](#option-chain-structure)

Utilisez la méthode `fetchOptionChain` pour obtenir les données publiques de la chaîne d'options d'une devise sous-jacente depuis la plateforme d'échange.

```javascript
fetchOptionChain (code, params = {})
```

Paramètres

- **code** (String) Code de devise CCXT unifié (ex. `"BTC"`)
- **params** (Dictionary) Paramètres supplémentaires spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"category": "options"}`)

Retourne

- Une liste de [structures de chaîne d'options](#option-chain-structure)

### Structure de la Chaîne d'Options

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

## Ratio Long Short

*contrats uniquement*

Utilisez la méthode `fetchLongShortRatio` pour récupérer le ratio long short actuel d'un symbole et utilisez `fetchLongShortRatioHistory` pour récupérer l'historique des ratios long short d'un symbole.

- `fetchLongShortRatio (symbol, period)` pour le ratio actuel d'un symbole de marché unique
- `fetchLongShortRatioHistory (symbol, period, since, limit)` pour l'historique des ratios d'un symbole de marché unique

```javascript
fetchLongShortRatio (symbol, period = undefined, params = {})
```

Paramètres

- **symbol** (String) *requis* Symbole CCXT unifié (ex. `"BTC/USDT:USDT"`)
- **period** (String) La période à partir de laquelle calculer le ratio (ex. `"24h"`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"endTime": 1645807945000}`)

Retourne

- une [structure de ratio long short](#long-short-ratio-structure)

```javascript
fetchLongShortRatioHistory (symbol = undefined, period = undefined, since = undefined, limit = undefined, params = {})
```

Paramètres

- **symbol** (String) Symbole CCXT unifié (ex. `"BTC/USDT:USDT"`)
- **period** (String) La période à partir de laquelle calculer le ratio (ex. `"24h"`)
- **since** (Integer) Horodatage du premier ratio (ex. `1645807945000`)
- **limit** (Integer) Le nombre maximum de ratios à récupérer (ex. `10`)
- **params** (Dictionary) Paramètres supplémentaires spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"endTime": 1645807945000}`)

Retourne

- un tableau de [structures de ratio long short](#long-short-ratio-structure)

### Structure du Ratio Long Short

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

## Délevier Automatique

*contrats uniquement*

Utilisez la méthode `fetchADLRank` pour obtenir les détails publics du rang de délevier automatique d'un symbole depuis la plateforme d'échange.

```javascript
fetchADLRank (symbol, params = {})
```

Paramètres

- **symbol** (String) Symbole de marché CCXT unifié (ex. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Paramètres supplémentaires spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"category": "futures"}`)

Retourne

- Une [structure de délevier automatique](#auto-de-leverage)

### Structure du Délevier Automatique

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

# API Privée

- [Authentification](#authentication)
- [Connexion](#sign-in)
- [Configuration des Clés API](#api-keys-setup)
- [Comptes](#accounts)
- [Solde du Compte](#account-balance)
- [Ordres](#orders)
- [Mes Transactions](#my-trades)
- [Grand Livre](#ledger)
- [Dépôt](#deposit)
- [Retrait](#withdrawal)
- [Adresses de Dépôt](#deposit-addresses)
- [Transferts](#transfers)
- [Frais](#fees)
- [Intérêts d'Emprunt](#borrow-interest)
- [Emprunter et Rembourser la Marge](#borrow-and-repay-margin)
- [Marge](#margin)
- [Mode de Marge](#margin-mode)
- [Levier](#leverage)
- [Positions](#positions)
- [Historique de Financement](#funding-history)
- [Conversion](#conversion)
- [Délevier Automatique](#auto-de-leverage)

Pour pouvoir accéder à votre compte utilisateur, effectuer du trading algorithmique en passant des ordres au marché et à cours limité, consulter les soldes, déposer et retirer des fonds et ainsi de suite, vous devez obtenir vos clés API pour l'authentification auprès de chaque plateforme d'échange avec laquelle vous souhaitez trader. Elles sont généralement disponibles dans un onglet ou une page séparée dans les paramètres de votre compte utilisateur. Les clés API sont spécifiques à chaque plateforme d'échange et ne peuvent en aucun cas être interchangées.

Les API privées des plateformes d'échange permettent généralement les types d'interactions suivants :

- l'état actuel du solde du compte de l'utilisateur peut être obtenu avec la méthode `fetchBalance()` comme décrit dans la section [Solde du Compte](#account-balance)
- l'utilisateur peut passer et annuler des ordres avec `createOrder()`, `cancelOrder()`, ainsi que récupérer les ordres ouverts en cours et l'historique des ordres passés avec des méthodes comme `fetchOrder`, `fetchOrders()`, `fetchOpenOrder()`, `fetchOpenOrders()`, `fetchCanceledOrders`, `fetchClosedOrder`, `fetchClosedOrders`, comme décrit dans la section sur les [Ordres](#orders)
- l'utilisateur peut consulter l'historique des transactions passées exécutées avec son compte en utilisant `fetchMyTrades`, comme décrit dans la section [Mes Transactions](#my-trades), voir également [Comment les Ordres sont Liés aux Transactions](#how-orders-are-related-to-trades)
- l'utilisateur peut consulter ses positions avec `fetchPositions()` et `fetchPosition()` comme décrit dans la section [Positions](#positions)
- l'utilisateur peut récupérer l'historique de ses transactions (transactions on-chain qui sont soit des _dépôts_ sur le compte de la plateforme d'échange, soit des _retraits_ du compte de la plateforme d'échange) avec `fetchTransactions()`, ou avec `fetchDeposit()`, `fetchDeposits()`, `fetchWithdrawal()` et `fetchWithdrawals()` séparément, selon ce qui est disponible depuis l'API de la plateforme d'échange
- si l'API de la plateforme d'échange fournit un point de terminaison de grand livre, l'utilisateur peut récupérer un historique de tous les mouvements d'argent qui ont d'une manière ou d'une autre affecté le solde, avec `fetchLedger` qui retournera toutes les entrées du grand livre comptable telles que les transactions, dépôts, retraits, transferts internes entre comptes, remises, bonus, frais, profits de staking et ainsi de suite, comme décrit dans la section [Grand Livre](#ledger).

## Authentification

L'authentification auprès de toutes les plateformes d'échange est gérée automatiquement si des clés API appropriées sont fournies. Le processus d'authentification suit généralement le schéma suivant :

1. Générer un nouveau nonce. Un nonce est un entier, souvent un horodatage Unix en secondes ou en millisecondes (depuis l'époque du 1er janvier 1970). Le nonce doit être unique à une requête particulière et constamment croissant, afin qu'aucune deux requêtes ne partagent le même nonce. Chaque requête suivante doit avoir un nonce supérieur à la requête précédente. **Le nonce par défaut est un horodatage Unix 32 bits en secondes.**
2. Ajouter la `apiKey` publique et le nonce aux autres paramètres du point de terminaison, le cas échéant, puis sérialiser l'ensemble pour la signature.
3. Signer les paramètres sérialisés à l'aide de HMAC-SHA256/384/512 ou MD5 avec votre clé secrète.
4. Ajouter la signature en Hex ou Base64 ainsi que le nonce aux en-têtes HTTP ou au corps de la requête.

Ce processus peut différer d'une plateforme à l'autre. Certaines plateformes peuvent vouloir la signature dans un encodage différent, certaines varient dans les noms et formats des paramètres d'en-tête et de corps, mais le schéma général est le même pour toutes.

**Vous ne devez pas partager la même paire de clés API entre plusieurs instances d'une plateforme s'exécutant simultanément, dans des scripts séparés ou dans plusieurs threads. L'utilisation de la même paire de clés depuis différentes instances simultanément peut entraîner toutes sortes de comportements inattendus.**

**NE PAS RÉUTILISER DES CLÉS API AVEC D'AUTRES LOGICIELS ! L'autre logiciel va faire monter votre nonce trop haut. Si vous obtenez des erreurs [InvalidNonce](#invalid-nonce) – assurez-vous de générer une nouvelle paire de clés fraîche avant tout.**

L'authentification est déjà gérée pour vous, vous n'avez donc pas besoin d'effectuer ces étapes manuellement, sauf si vous implémentez une nouvelle classe de plateforme. La seule chose dont vous avez besoin pour le trading est la paire de clés API réelle.

### Configuration des clés API

#### Identifiants requis

Les identifiants API comprennent généralement les éléments suivants :

- `apiKey`. Il s'agit de votre clé API et/ou jeton public. Cette partie est *non secrète*, elle est incluse dans l'en-tête ou le corps de votre requête et envoyée en HTTPS en texte clair pour identifier votre requête. Il s'agit souvent d'une chaîne en encodage Hex ou Base64 ou d'un identifiant UUID.
- `secret`. Il s'agit de votre clé privée. Gardez-la secrète, ne la communiquez à personne. Elle est utilisée pour signer vos requêtes localement avant de les envoyer aux plateformes. La clé secrète n'est pas envoyée sur Internet lors du processus requête-réponse et ne doit pas être publiée ni envoyée par e-mail. Elle est utilisée conjointement avec le nonce pour générer une signature cryptographiquement robuste. Cette signature est envoyée avec votre clé publique pour authentifier votre identité. Chaque requête possède un nonce unique et donc une signature cryptographique unique.
- `uid`. Certaines plateformes (pas toutes) génèrent également un identifiant utilisateur ou *uid* en abrégé. Il peut s'agir d'une chaîne ou d'un littéral numérique. Vous devez le définir si cela est explicitement requis par votre plateforme. Consultez [leur documentation](#exchanges) pour plus de détails.
- `password`. Certaines plateformes (pas toutes) requièrent également votre mot de passe/phrase pour le trading. Vous devez définir cette chaîne si cela est explicitement requis par votre plateforme. Consultez [leur documentation](#exchanges) pour plus de détails.

Pour créer des clés API, trouvez l'onglet ou le bouton API dans les paramètres utilisateur sur le site web de la plateforme. Créez ensuite vos clés et copiez-collez-les dans votre fichier de configuration. Les permissions de votre fichier de configuration doivent être définies de manière appropriée, illisibles par quiconque sauf le propriétaire.

**N'oubliez pas de garder votre `apiKey` et votre clé secrète à l'abri de toute utilisation non autorisée, ne les envoyez ni ne les communiquez à personne. Une fuite de la clé secrète ou une violation de la sécurité peut vous coûter une perte de fonds.**

#### Validation des identifiants

Pour vérifier si l'utilisateur a fourni tous les identifiants requis, la classe de base `Exchange` dispose d'une méthode appelée `exchange.checkRequiredCredentials()` ou `exchange.check_required_credentials()`. L'appel de cette méthode lèvera une `AuthenticationError` si certains identifiants sont manquants ou vides. La classe de base `Exchange` dispose également d'une propriété `exchange.requiredCredentials` qui permet à un utilisateur de voir quels identifiants sont requis pour telle ou telle plateforme, comme indiqué ci-dessous :

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


#### Configuration des clés API

Pour configurer une plateforme pour le trading, assignez simplement les identifiants API à une instance de plateforme existante ou transmettez-les au constructeur de la plateforme lors de l'instanciation, comme suit :


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


Notez que vos requêtes privées échoueront avec une exception ou une erreur si vous ne configurez pas vos identifiants API avant de commencer le trading. Pour éviter l'échappement de caractères, **écrivez toujours vos identifiants entre guillemets simples**, pas doubles (`'VERY_GOOD'`, `"VERY_BAD"`).

#### Permissions des clés API
Lorsque vous obtenez des erreurs comme `"Invalid API-key, IP, or permissions for action."` ou `"API-key format invalid"`, le problème ne se situe très probablement pas dans ccxt. Veuillez éviter d'ouvrir un nouveau problème à moins de vous assurer que :
1) Vous n'avez pas de fautes de frappe, d'espaces vides ou de guillemets dans vos clés
2) Votre adresse IP actuelle (vérifiez [IPv4](https://api.ipify.org/) ou [IPv6](https://api64.ipify.org/)) est ajoutée à la liste blanche de la clé API (si vous utilisez un proxy, tenez-en compte également)
3) Vous avez sélectionné les bonnes options dans la liste des permissions pour cette clé API
4) Vous ne mélangez pas accidentellement des clés API « testnet » ou le mode « testnet » dans votre script
5) Vous avez déjà vérifié les [problèmes signalés](https://github.com/ccxt/ccxt/issues?q=is%3Aissue+%22Invalid+Api-Key+ID%22) concernant cette erreur


#### Connexion

Certaines plateformes vous demandent de vous connecter avant d'appeler des méthodes privées, ce qui peut être effectué à l'aide de la méthode `signIn`


```javascript tab="JavaScript"
signIn (params = {})
```

Paramètres

- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de la plateforme (ex. `{"2fa": "329293"}`)

Retours

- réponse de la plateforme

## Remplacement du nonce

**Le nonce par défaut est défini par la plateforme sous-jacente. Vous pouvez le remplacer par un nonce en millisecondes si vous souhaitez effectuer des requêtes privées plus fréquemment qu'une fois par seconde ! La plupart des plateformes limiteront vos requêtes si vous atteignez leurs limites de débit, lisez attentivement [la documentation API de votre plateforme](/docs/exchange-markets) !**

Si vous avez besoin de réinitialiser le nonce, il est beaucoup plus simple de créer une autre paire de clés à utiliser avec les API privées. Créer de nouvelles clés et configurer une nouvelle paire de clés inutilisée dans votre configuration est généralement suffisant pour cela.

Dans certains cas, vous ne pouvez pas créer de nouvelles clés en raison d'un manque de permissions ou autre. Si cela se produit, vous pouvez quand même remplacer le nonce. La classe de marché de base dispose des méthodes suivantes pour des raisons pratiques :

- `seconds ()` : retourne un horodatage Unix en secondes.
- `milliseconds ()` : même chose en millisecondes (ms = 1000 * s, millièmes de seconde).
- `microseconds ()` : même chose en microsecondes (μs = 1000 * ms, millionièmes de seconde).

Il existe des plateformes qui confondent les millisecondes avec les microsecondes dans leur documentation API, pardonnons-leur cela, chers utilisateurs. Vous pouvez utiliser les méthodes listées ci-dessus pour remplacer la valeur du nonce. Si vous avez besoin d'utiliser la même paire de clés depuis plusieurs instances simultanément, utilisez des fermetures ou une fonction commune pour éviter les conflits de nonce. En JavaScript, vous pouvez remplacer le nonce en fournissant un paramètre `nonce` au constructeur de la plateforme ou en le définissant explicitement sur l'objet de la plateforme :

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

En Python et PHP, vous pouvez faire de même en créant une sous-classe et en remplaçant la fonction nonce d'une classe de plateforme particulière :

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

## Comptes

Vous pouvez obtenir tous les comptes associés à un profil en utilisant la méthode `fetchAccounts()`

```javascript
fetchAccounts (params = {})
```

### Structure des comptes

La méthode `fetchAccounts()` retournera une structure comme indiqué ci-dessous :

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

Les types de compte sont l'un des [types de compte unifiés](####account-balance) ou `subaccount`

## Solde du compte

Pour interroger le solde et obtenir le montant des fonds disponibles pour le trading ou les fonds bloqués dans des ordres, utilisez la méthode `fetchBalance` :

```javascript
fetchBalance (params = {})
```

Paramètres

- **params** (Dictionary) Paramètres supplémentaires spécifiques au point de terminaison de l'API de la plateforme (ex. `{"currency": "usdt"}`)

Retours

- Une [structure de solde](#balance-structure)

### Structure du solde

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

Les valeurs `timestamp` et `datetime` peuvent être indéfinies ou manquantes si la plateforme sous-jacente ne les fournit pas.

Certaines plateformes peuvent ne pas retourner des informations complètes sur le solde. De nombreuses plateformes ne retournent pas les soldes pour vos comptes vides ou inutilisés. Dans ce cas, certaines devises peuvent être manquantes dans la structure de solde retournée.
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


## Ordres

```diff
- this part of the unified API is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

### Interrogation des ordres

La plupart du temps, vous pouvez interroger les ordres par un identifiant ou par un symbole, bien que toutes les plateformes n'offrent pas un ensemble complet et flexible de points de terminaison pour interroger les ordres. Certaines plateformes peuvent ne pas avoir de méthode pour récupérer les ordres récemment clôturés, d'autres peuvent manquer d'une méthode pour obtenir un ordre par identifiant, etc. La bibliothèque ccxt ciblera ces cas en créant des solutions de contournement là où c'est possible.

La liste des méthodes pour interroger les ordres comprend les suivantes :

- `fetchCanceledOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`
- `fetchClosedOrder (id, symbol = undefined, params = {})`
- `fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`
- `fetchOpenOrder (id, symbol = undefined, params = {})`
- `fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`
- `fetchOrder (id, symbol = undefined, params = {})`
- `fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`

Notez que le nom de ces méthodes indique si la méthode retourne un seul ordre ou plusieurs ordres (un tableau/une liste d'ordres). La méthode `fetchOrder()` nécessite un argument d'identifiant d'ordre obligatoire (une chaîne). Certaines plateformes requièrent également un symbole pour récupérer un ordre par identifiant, où les identifiants d'ordre peuvent se croiser avec diverses paires de trading. Notez également que toutes les autres méthodes ci-dessus retournent un tableau (une liste) d'ordres. La plupart d'entre elles nécessiteront également un argument de symbole, cependant, certaines plateformes permettent d'interroger sans symbole spécifié (c'est-à-dire *tous les symboles*).

La bibliothèque lèvera une exception NotSupported si un utilisateur appelle une méthode qui n'est pas disponible sur la plateforme ou qui n'est pas implémentée dans ccxt.

Pour vérifier si l'une des méthodes ci-dessus est disponible, consultez la propriété `.has` de la plateforme :


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


Une structure typique de la propriété `.has` contient généralement les indicateurs suivants correspondant aux méthodes d'API d'ordre pour interroger les ordres :

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

La signification des valeurs booléennes `true` et `false` est évidente. Une valeur de chaîne `emulated` signifie que la méthode particulière est absente de l'API de la plateforme et que ccxt contournera cela côté client là où c'est possible.

#### Comprendre la conception de l'API des ordres

Les API de gestion des ordres des plateformes diffèrent par leur conception. L'utilisateur doit comprendre le but de chaque méthode spécifique et comment elles sont combinées pour former une API d'ordre complète :

- `fetchCanceledOrders()` - récupère une liste d'ordres annulés
- `fetchClosedOrder()` - récupère un seul ordre clôturé par identifiant d'ordre
- `fetchClosedOrders()` – récupère une liste d'ordres clôturés (ou annulés).
- `fetchMyTrades()` – bien que ne faisant pas partie de l'API des ordres, elle est étroitement liée, car elle fournit l'historique des trades réglés.
- `fetchOpenOrder()` - récupère un seul ordre ouvert par identifiant d'ordre
- `fetchOpenOrders()` – récupère une liste d'ordres ouverts.
- `fetchOrder()` – récupère un seul ordre (ouvert ou clôturé) par `id` d'ordre.
- `fetchOrders()` – récupère une liste de tous les ordres (ouverts ou clôturés/annulés).
- `createOrder()` – utilisé pour passer des ordres
- `createOrders()` – utilisé pour passer plusieurs ordres dans la même requête
- `cancelOrder()` – utilisé pour annuler un seul ordre
- `cancelOrders()` - utilisé pour annuler plusieurs ordres
- `cancelAllOrders()` - utilisé pour annuler tous les ordres
- `cancelAllOrdersAfter()` - utilisé pour annuler tous les ordres après le délai d'expiration donné

La majorité des exchanges proposent un moyen de récupérer les ordres actuellement ouverts. C'est pourquoi il existe `exchange.has['fetchOpenOrders']`. Si cette méthode n'est pas disponible, il est probable que `exchange.has['fetchOrders']` fournisse une liste de tous les ordres. L'exchange retournera une liste des ordres ouverts soit via `fetchOpenOrders()`, soit via `fetchOrders()`. L'une de ces deux méthodes est généralement disponible sur n'importe quel exchange.

Certains exchanges fourniront l'historique des ordres, d'autres non. Si l'exchange sous-jacent fournit l'historique des ordres, alors `exchange.has['fetchClosedOrders']` ou `exchange.has['fetchOrders']` sera disponible. Si l'exchange sous-jacent ne fournit pas l'historique des ordres, alors `fetchClosedOrders()` et `fetchOrders()` ne sont pas disponibles. Dans ce dernier cas, l'utilisateur est tenu de construire un cache local des ordres et de suivre les ordres ouverts en utilisant `fetchOpenOrders()` et `fetchOrder()` pour les statuts des ordres et pour les marquer comme fermés localement dans l'espace utilisateur (lorsqu'ils ne sont plus ouverts).

Si l'exchange sous-jacent ne dispose pas de méthodes pour l'historique des ordres (`fetchClosedOrders()` et `fetchOrders()`), il fournira `fetchOpenOrders` ainsi que l'historique des trades avec `fetchMyTrades` (voir [Comment les ordres sont liés aux trades](#how-orders-are-related-to-trades)). Cet ensemble d'informations est dans de nombreux cas suffisant pour le suivi dans un robot de trading en direct. S'il n'y a pas d'historique des ordres, vous devez suivre vos ordres en direct et reconstituer les informations historiques à partir des ordres ouverts et des trades historiques.

En général, les exchanges sous-jacents fourniront habituellement un ou plusieurs des types de données historiques suivants :

- `fetchClosedOrders()`
- `fetchOrders()`
- `fetchMyTrades()`

L'une quelconque des trois méthodes ci-dessus peut être absente, mais les APIs des exchanges fourniront généralement au moins l'une de ces trois méthodes.

Si l'exchange sous-jacent ne fournit pas d'historique des ordres, la bibliothèque CCXT n'émulera pas la fonctionnalité manquante – elle doit être ajoutée côté utilisateur si nécessaire.

**Veuillez noter qu'une certaine méthode peut être manquante soit parce que l'exchange ne dispose pas d'un endpoint API correspondant, soit parce que CCXT ne l'a pas encore implémentée (la bibliothèque est également en cours de développement). Dans ce dernier cas, la méthode manquante sera ajoutée dès que possible.**

#### Interroger plusieurs ordres et trades

Toutes les méthodes retournant des listes de trades et des listes d'ordres acceptent le deuxième argument `since` et le troisième argument `limit` :

- `fetchTrades()` (public)
- `fetchMyTrades()` (privé)
- `fetchOrders()`
- `fetchOpenOrders()`
- `fetchClosedOrders()`
- `fetchCanceledOrders()`

Le deuxième argument `since` filtre le tableau par horodatage, le troisième argument `limit` filtre par nombre (quantité) d'éléments retournés.

Si l'utilisateur ne spécifie pas `since`, les méthodes `fetchTrades()/fetchOrders()` retourneront l'ensemble de résultats par défaut de l'exchange. L'ensemble par défaut est spécifique à l'exchange ; certains exchanges retourneront des trades ou des ordres récents à partir de la date d'inscription d'une paire sur l'exchange, d'autres exchanges retourneront un ensemble réduit de trades ou d'ordres (comme les 24 dernières heures, les 100 derniers trades, les 100 premiers ordres, etc.). Si l'utilisateur souhaite un contrôle précis sur la période, il est responsable de spécifier l'argument `since`.

**REMARQUE : tous les exchanges ne fournissent pas de moyens pour filtrer les listes de trades et d'ordres par heure de début, donc la prise en charge de `since` et `limit` est spécifique à l'exchange. Cependant, la plupart des exchanges proposent au moins une alternative pour la « pagination » et le « défilement » qui peut être remplacée avec l'argument supplémentaire `params`.**

Certains exchanges ne disposent pas de méthode pour récupérer les ordres fermés ou tous les ordres. Ils ne proposeront que l'endpoint `fetchOpenOrders()`, et parfois aussi un endpoint `fetchOrder`. Ces exchanges n'ont aucune méthode pour récupérer l'historique des ordres. Pour maintenir l'historique des ordres pour ces exchanges, l'utilisateur doit stocker un dictionnaire ou une base de données d'ordres dans l'espace utilisateur et mettre à jour les ordres dans la base de données après avoir appelé des méthodes comme `createOrder()`, `fetchOpenOrders()`, `cancelOrder()`, `cancelAllOrders()`.

#### Par identifiant d'ordre

Pour obtenir les détails d'un ordre particulier par son identifiant, utilisez la méthode `fetchOrder()` / `fetch_order()`. Certains exchanges exigent également un symbole même lors de la récupération d'un ordre particulier par identifiant.

La signature de la méthode fetchOrder/fetch_order est la suivante :

```javascript
if (exchange.has['fetchOrder']) {
    //  you can use the params argument for custom overrides
    let order = await exchange.fetchOrder (id, symbol = undefined, params = {})
}
```

**Certains exchanges ne disposent pas d'endpoint pour récupérer un ordre par identifiant, ccxt l'émulera là où c'est possible.** Pour l'instant, cela peut encore manquer ici et là, car c'est un travail en cours.

Vous pouvez passer des paires clé-valeur personnalisées remplacées dans l'argument params supplémentaire pour fournir un type d'ordre spécifique, ou tout autre paramètre si nécessaire.

Voici des exemples d'utilisation de la méthode fetchOrder pour obtenir des informations sur un ordre depuis une instance d'exchange authentifiée :

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


#### Tous les ordres

```javascript
if (exchange.has['fetchOrders'])
    exchange.fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {})
```

**Certains exchanges ne disposent pas d'endpoint pour récupérer tous les ordres, ccxt l'émulera là où c'est possible.** Pour l'instant, cela peut encore manquer ici et là, car c'est un travail en cours.

#### Ordres ouverts

```javascript
if (exchange.has['fetchOpenOrders'])
    exchange.fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {})
```

#### Ordres fermés

Ne confondez pas les *ordres fermés* avec les *trades* alias *fills* ! Un ordre peut être fermé (exécuté) avec plusieurs trades opposés ! Ainsi, un *ordre fermé* n'est pas la même chose qu'un *trade*. En général, l'ordre ne comporte pas du tout de `fee`, mais chaque trade utilisateur particulier a bien un `fee`, un `cost` et d'autres propriétés. Cependant, de nombreux exchanges propagent ces propriétés aux ordres également.

**Certains exchanges ne disposent pas d'endpoint pour récupérer les ordres fermés, ccxt l'émulera là où c'est possible.** Pour l'instant, cela peut encore manquer ici et là, car c'est un travail en cours.

```javascript
if (exchange.has['fetchClosedOrders'])
    exchange.fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {})
```

### Structure d'un ordre

La plupart des méthodes retournant des ordres dans l'API unifiée de ccxt produiront une structure d'ordre telle que décrite ci-dessous :

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

- Le `status` d'un ordre est généralement soit `'open'` (non exécuté ou partiellement exécuté), `'closed'` (entièrement exécuté), ou `'canceled'` (non exécuté et annulé, ou partiellement exécuté puis annulé).
- Certains exchanges permettent à l'utilisateur de spécifier un horodatage d'expiration lors du placement d'un nouvel ordre. Si l'ordre n'est pas exécuté avant ce délai, son `status` devient `'expired'`.
- Utilisez la valeur `filled` pour déterminer si l'ordre est exécuté, partiellement exécuté ou entièrement exécuté, et de quelle quantité.
- Le travail sur les informations de `'fee'` est encore en cours, les informations sur les frais peuvent être partiellement ou entièrement absentes, selon les capacités de l'exchange.
- La devise du `fee` peut être différente des deux devises échangées (par exemple, un ordre ETH/BTC avec des frais en USD).
- L'horodatage `lastTradeTimestamp` peut ne pas avoir de valeur et peut être `undefined/None/null` lorsque non pris en charge par l'exchange ou dans le cas d'un ordre ouvert (un ordre qui n'a pas encore été exécuté ni partiellement exécuté).
- Le `lastTradeTimestamp`, le cas échéant, désigne l'horodatage du dernier trade, au cas où l'ordre est exécuté entièrement ou partiellement, sinon `lastTradeTimestamp` est `undefined/None/null`.
- Le `status` de l'ordre prévaut ou a la priorité sur le `lastTradeTimestamp`.
- Le `cost` d'un ordre est : `{ filled * price }`
- Le `cost` d'un ordre représente le volume total en devise de *cotation* de l'ordre (tandis que le `amount` est le volume en devise de *base*). La valeur de `cost` doit être aussi proche que possible du coût réel le plus récent connu de l'ordre. Le champ `cost` lui-même est principalement là pour des raisons de commodité et peut être déduit d'autres champs.
- Le champ `clientOrderId` peut être défini lors du placement des ordres par l'utilisateur avec des [paramètres d'ordre personnalisés](#custom-order-params). En utilisant le `clientOrderId`, l'utilisateur peut ultérieurement distinguer ses propres ordres. Cela n'est disponible que pour les exchanges qui prennent en charge le `clientOrderId` pour l'instant.

#### timeInForce

Le champ `timeInForce` peut être `undefined/None/null` s'il n'est pas spécifié par l'exchange. L'unification de `timeInForce` est un travail en cours.

Valeurs possibles pour le champ `timeInForce` :

- `'GTC'` = _Good Till Cancel(ed)_ (Valable jusqu'à annulation), l'ordre reste dans le carnet d'ordres jusqu'à ce qu'il soit exécuté ou annulé.
- `'IOC'` = _Immediate Or Cancel_ (Immédiat ou annuler), l'ordre doit être mis en correspondance immédiatement et exécuté partiellement ou complètement, le reliquat non exécuté est annulé (ou l'ordre entier est annulé).
- `'FOK'` = _Fill Or Kill_ (Exécuter ou annuler), l'ordre doit être entièrement exécuté et clôturé immédiatement, sinon l'ordre entier est annulé.
- `'PO'` = _Post Only_ (Publication uniquement), l'ordre est soit placé comme ordre de teneur de marché, soit annulé. Cela signifie que l'ordre doit être placé dans le carnet d'ordres pendant au moins un certain temps à l'état non exécuté. L'unification de `PO` comme option `timeInForce` est un travail en cours avec les exchanges unifiés ayant `exchange.has['createPostOnlyOrder'] == True`.

### Passer des ordres

Il existe différents types d'ordres qu'un utilisateur peut envoyer à l'exchange ; les ordres réguliers atterrissent finalement dans le carnet d'ordres d'un symbole correspondant, d'autres ordres peuvent être plus avancés. Voici une liste décrivant les différents types d'ordres :

- [Ordres limites](#limit-orders) – ordres réguliers ayant un `amount` en devise de base (combien vous souhaitez acheter ou vendre) et un `price` en devise de cotation (au prix auquel vous souhaitez acheter ou vendre).
- [Ordres au marché](#market-orders) – ordres réguliers ayant un `amount` en devise de base (combien vous souhaitez acheter ou vendre)
  - [Achats au marché](#market-buys) – certains exchanges exigent des ordres d'achat au marché avec un `amount` en devise de cotation (combien vous souhaitez dépenser pour acheter)
- [Ordres déclencheurs](#conditional-orders) alias *ordres conditionnels* – un type d'ordre avancé utilisé pour attendre une certaine condition sur un marché puis réagir automatiquement : lorsqu'un `triggerPrice` est atteint, l'ordre déclencheur est activé, puis un ordre régulier à cours limité `price` ou au prix du marché est passé, ce qui résulte finalement à l'entrée ou à la sortie d'une position
- [Ordres stop-loss](#stop-loss-orders) – presque identiques aux ordres déclencheurs, mais utilisés pour clôturer une position afin de stopper les pertes supplémentaires sur cette position : lorsque le prix atteint `triggerPrice`, l'ordre stop-loss est déclenché, ce qui entraîne le placement d'un autre ordre régulier à cours limité ou au marché pour clôturer une position à un `price` limite spécifique ou au prix du marché (une position avec un ordre stop-loss attaché).
- [Ordres take-profit](#take-profit-orders) – un pendant aux ordres stop-loss, ce type d'ordre est utilisé pour clôturer une position afin de prendre les profits existants sur cette position : lorsque le prix atteint `triggerPrice`, l'ordre take-profit est déclenché, ce qui entraîne le placement d'un autre ordre régulier à cours limité ou au marché pour clôturer une position à un `price` limite spécifique ou au prix du marché (une position avec un ordre take-profit attaché).
- [Ordres StopLoss et TakeProfit attachés à une position](#stoploss-and-takeprofit-orders-attached-to-a-position) – ordres avancés, composés de trois ordres des types listés ci-dessus : un ordre régulier à cours limité ou au marché passé pour entrer dans une position avec des ordres stop-loss et/ou take-profit qui seront placés à l'ouverture de cette position et seront utilisés pour clôturer cette position ultérieurement (lorsqu'un stop-loss est atteint, il clôturera la position et annulera son pendant take-profit, et vice versa, lorsqu'un take-profit est atteint, il clôturera la position et annulera son pendant stop-loss, ces deux pendants sont également connus sous le nom d'« ordres OCO – l'un annule l'autre »), en plus du `amount` (et du `price` pour l'ordre à cours limité) pour ouvrir une position, il nécessitera également un `triggerPrice` pour un ordre stop-loss (avec un `price` limite s'il s'agit d'un ordre stop-loss à cours limité) et/ou un `triggerPrice` pour un ordre take-profit (avec un `price` limite s'il s'agit d'un ordre take-profit à cours limité).
- [Ordres trailing](#trailing-orders) – un ordre qui est automatiquement ajusté par rapport à une position ouverte, `trailingAmount` peut être défini pour suivre un montant de cotation spécifié derrière la position ouverte ou `trailingPercent` peut être défini pour suivre un pourcentage spécifié derrière la position ouverte ; lorsque le prix du marché de la position est égal à l'ordre trailing, cela résulte en l'entrée d'une nouvelle position ou la sortie d'une position selon que l'ordre trailing a le paramètre `reduceOnly` défini à true ou non.

Passer un ordre nécessite toujours un `symbol` que l'utilisateur doit spécifier (le marché sur lequel vous souhaitez trader).

Pour passer un ordre, utilisez la méthode `createOrder`. Vous pouvez utiliser l'`id` retourné dans la [structure d'ordre](#order-structure) unifiée pour interroger ultérieurement le statut et l'état de l'ordre. Si vous devez passer plusieurs ordres simultanément, vous pouvez vérifier la disponibilité de la méthode `createOrders`.

```javascript
createOrder (symbol, type, side, amount, price = undefined, params = {})
```

```javascript
createOrders (orders, params = {}) // orders is a list in which each element contains a symbol, type, side, amount, price and params
```

Paramètres

- **symbol** (String) *requis* Symbole de marché CCXT unifié
  - Assurez-vous que le symbole en question existe sur l'exchange cible et est disponible pour le trading.
- **side** *requis* une chaîne littérale indiquant la direction de votre ordre.
  **Côtés unifiés :**
  - `buy` donner la devise de cotation et recevoir la devise de base ; par exemple, acheter `BTC/USD` signifie que vous recevrez des bitcoins contre vos dollars.
  - `sell` donner la devise de base et recevoir la devise de cotation ; par exemple, vendre `BTC/USD` signifie que vous recevrez des dollars contre vos bitcoins.
- **type** une chaîne littérale indiquant le type d'ordre
  **Types unifiés :**
  - [market](#market-orders) non autorisé par certains exchanges, voir [leur documentation](#exchanges) pour plus de détails
  - [limit](#limit-orders)
  - voir #custom-order-params et #other-order-types pour les types non unifiés
- **amount**, la quantité de devise que vous souhaitez trader, généralement mais pas toujours exprimée en unités de la devise de base de la paire de trading (les unités dépendent du côté de l'ordre pour certains exchanges : consultez leur documentation API pour plus de détails).
- **price** le prix auquel l'ordre doit être exécuté, exprimé en unités de la devise de cotation (ignoré pour les ordres au marché)
- **params** (Dictionary) Paramètres supplémentaires spécifiques à l'endpoint de l'API de l'exchange (ex. `{"settle": "usdt"}`)

Retours

- Un appel d'ordre réussi retourne une [structure d'ordre](#order-structure)

**Notes sur createOrder**

- Certains exchanges n'autorisent que les ordres à cours limité.

Certains champs de la structure d'ordre retournée peuvent être `undefined / None / null` si ces informations ne sont pas retournées par la réponse de l'API de l'exchange. Il est garanti que la méthode `createOrder` retournera une [structure d'ordre](#order-structure) unifiée contenant au minimum l'`id` de l'ordre et l'`info` (une réponse brute de l'exchange « telle quelle ») :

```javascript
{
    'id': 'string',  // order id
    'info': { ... }, // decoded original JSON response from the exchange as is
}
```

##### Pièges courants

- Il existe une erreur fréquente lors de la création d'ordres sur des marchés à contrats :

```
"must be greater than minimum amount precision of 1"
```

Cette erreur survient lorsque l'exchange attend un nombre entier de contrats (1, 2, 3, etc.) dans l'argument `amount` de `createOrder`. La [structure de marché](#market-structure) possède une clé appelée `contractSize`. Chaque contrat vaut une certaine quantité de l'actif de base déterminée par le `contractSize`. Le nombre de contrats multiplié par le `contractSize` est égal au montant en actif de base. `Montant en base = (contrats * contractSize)`, donc pour dériver le nombre de contrats à entrer dans l'argument `amount`, vous pouvez résoudre pour les contrats : `contrats = (Montant en base / contractSize)`.

Voici un exemple pour trouver le `contractSize` :
```python
await exchange.loadMarkets()
symbol = 'BTC/USDT:USDT'
market = exchange.market(symbol)
print(market['contractSize'])

# Let's say you want to convert 0.5 BTC to the number of contracts:
number_contracts = round((0.5 * 1) / market['contractSize'])
```

#### Ordres à cours limité

Les ordres à cours limité sont placés dans le carnet d'ordres de l'exchange à un prix spécifié par le trader. Ils sont exécutés (clôturés) lorsqu'il n'y a aucun ordre sur le même marché à un meilleur prix, et qu'un autre trader crée un [ordre au marché](#market-orders) ou un ordre opposé à un prix égal ou supérieur au prix de l'ordre à cours limité.

Les ordres à cours limité peuvent ne pas être entièrement exécutés. Cela se produit lorsque l'ordre d'exécution porte sur un montant inférieur à celui spécifié par l'ordre à cours limité.

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

#### Ordres au marché

*également connus sous le nom de*

- ordres au prix du marché
- ordres au prix spot
- ordres instantanés

Les ordres au marché sont exécutés immédiatement en satisfaisant un ou plusieurs ordres déjà existants du côté vendeur du carnet d'ordres de l'exchange. Les ordres que votre ordre au marché satisfait sont choisis depuis le haut de la pile du carnet d'ordres, ce qui signifie que votre ordre au marché est exécuté au meilleur prix disponible. Lors du passage d'un ordre au marché, vous n'avez pas besoin de spécifier le prix de l'ordre, et si un prix est spécifié, il sera ignoré.

Il n'est pas garanti que l'ordre sera exécuté au prix que vous observez avant de passer votre ordre. Plusieurs raisons expliquent cela, notamment :

- **glissement de prix** une légère variation du prix du marché tradé pendant que votre ordre est en cours d'exécution. Les causes du glissement de prix comprennent, sans s'y limiter :

    - la latence aller-retour réseau
    - une charge élevée sur l'exchange
    - la volatilité des prix

- **tailles d'ordres inégales** si un ordre au marché porte sur un montant supérieur à la taille du premier ordre du carnet d'ordres, alors une fois le premier ordre exécuté, l'ordre au marché continuera à satisfaire l'ordre suivant du carnet, ce qui signifie que l'ordre au marché est exécuté à plusieurs prix

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

**Notez que certains exchanges n'acceptent pas les ordres au marché (ils n'autorisent que les ordres à cours limité).** Pour détecter par programmation si l'exchange en question prend en charge les ordres au marché ou non, vous pouvez utiliser la propriété d'exchange `.has['createMarketOrder']` :

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


#### Achats au marché

En général, lors du passage d'un ordre `market buy` ou `market sell`, l'utilisateur doit simplement spécifier le montant de la devise de base à acheter ou à vendre. Cependant, certains exchanges implémentent une approche différente pour calculer la valeur de l'ordre d'achat au marché.

Supposons que vous tradiez BTC/USD et que le prix actuel du marché pour BTC est supérieur à 9 000 USD. Pour un achat ou une vente au marché, vous pourriez spécifier un `amount` de 2 BTC, ce qui entraînerait _plus ou moins_ 18 000 USD (environ ;)) sur votre compte, selon le côté de l'ordre.

**Pour les achats au marché, certains exchanges exigent le coût total de l'ordre en devise de cotation !** La logique est simple : au lieu de prendre le montant de la devise de base à acheter ou à vendre, certains exchanges fonctionnent avec _« combien de devise de cotation vous souhaitez dépenser en total pour l'achat »_.

Pour passer un ordre d'achat au marché sur ces exchanges, vous ne spécifieriez pas un montant de 2 BTC, mais devriez d'une manière ou d'une autre spécifier le coût total de l'ordre, soit 18 000 USD dans cet exemple. Les exchanges qui traitent les ordres `market buy` de cette façon disposent d'une option spécifique à l'exchange `createMarketBuyOrderRequiresPrice` qui permet de spécifier le coût total d'un ordre `market buy` de deux manières.

La première est celle par défaut : si vous spécifiez le `price` avec le `amount`, le coût total de l'ordre sera calculé dans la bibliothèque à partir de ces deux valeurs par une simple multiplication (`cost = amount * price`). Le `cost` résultant sera le montant en devise de cotation USD qui sera dépensé pour cet ordre d'achat au marché particulier.

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

La deuxième alternative est utile lorsque l'utilisateur souhaite calculer et spécifier lui-même le coût total résultant de l'ordre. Cela peut être fait en définissant l'option `createMarketBuyOrderRequiresPrice` à `false` pour la désactiver :

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

Pour en savoir plus :

- https://github.com/ccxt/ccxt/issues/564#issuecomment-347458566
- https://github.com/ccxt/ccxt/issues/4914#issuecomment-478199357
- https://github.com/ccxt/ccxt/issues/4799#issuecomment-470966769
- https://github.com/ccxt/ccxt/issues/5197#issuecomment-496270785

#### Émulation des ordres au marché avec des ordres à cours limité

Il est également possible d'émuler un ordre `market` avec un ordre `limit`.

**AVERTISSEMENT : cette méthode peut être risquée en raison d'une forte volatilité, utilisez-la à vos propres risques et uniquement si vous savez vraiment ce que vous faites !**

La plupart du temps, une `market sell` peut être émulée avec une `limit sell` à un prix très bas — l'exchange en fera automatiquement un ordre preneur au prix du marché (le prix actuellement le plus avantageux parmi ceux disponibles dans le carnet d'ordres). Lorsque l'exchange détecte que vous vendez à un prix très bas, il vous proposera automatiquement le meilleur prix acheteur disponible dans le carnet d'ordres. C'est effectivement la même chose que de passer un ordre de vente au marché. Ainsi, les ordres au marché peuvent être émulés avec des ordres à cours limité (là où ils manquent).

L'inverse est également vrai — un `market buy` peut être émulé avec un `limit buy` à un prix très élevé. La plupart des exchanges clôtureront à nouveau votre ordre au meilleur prix disponible, c'est-à-dire le prix du marché.

Cependant, vous ne devriez jamais vous y fier entièrement, **TESTEZ TOUJOURS cela avec un petit montant d'abord !** Vous pouvez d'abord essayer cela dans leur interface web pour vérifier la logique. Vous pouvez vendre le montant minimal à un prix limité spécifié (un montant abordable à perdre, juste au cas où) puis vérifier le prix d'exécution réel dans l'historique des trades.

#### Ordres à cours limité

Les ordres à prix limité sont également connus sous le nom d'*ordres à cours limité*. Certains exchanges n'acceptent que les ordres à cours limité. Les ordres à cours limité nécessitent qu'un prix (taux par unité) soit soumis avec l'ordre. L'exchange clôturera les ordres à cours limité si et seulement si le prix du marché atteint le niveau souhaité.

```javascript
// camelCaseStyle
exchange.createLimitBuyOrder (symbol, amount, price[, params])
exchange.createLimitSellOrder (symbol, amount, price[, params])

// underscore_style
exchange.create_limit_buy_order (symbol, amount, price[, params])
exchange.create_limit_sell_order (symbol, amount, price[, params])
```


#### Ordres conditionnels

Issu du trading traditionnel, le terme « ordre stop » a été quelque peu ambigu, aussi, au lieu de celui-ci, CCXT utilise le terme d'ordre « déclencheur » (Trigger). Lorsque le prix d'un symbole atteint votre prix « déclencheur » (« stop »), l'ordre est activé en tant qu'ordre `market` ou `limit`, selon celui que vous avez choisi.

Nous avons différentes classifications des ordres déclencheurs :
1) ordre [Trigger](#trigger-order) autonome pour acheter/vendre une crypto (ouvrir/fermer une position)
2) [Stop Loss](#stop-loss-orders) ou [Take Profit](#take-profit-orders) autonome conçu pour clôturer des positions ouvertes.
3) un ordre Stop Loss ou Take Profit attaché à un ordre primaire ([Ordre Trigger Conditionnel](#stoploss-and-takeprofit-orders-attached-to-a-position)).


##### Ordre déclencheur

L'ordre « stop » traditionnel (que vous pourriez voir sur les sites web des exchanges) est désormais appelé ordre « déclencheur » (trigger) dans la bibliothèque CCXT. Implémenté en ajoutant un paramètre `triggerPrice`. Ce sont des ordres déclencheurs de base indépendants qui peuvent ouvrir ou fermer une position.

* Pour s'assurer que l'exchange supporte cette fonctionnalité, vérifiez `exchange.features` ou utilisez la méthode d'assistance `exchange.featureValue('BTC/USDT', 'createOrder', 'triggerPrice')`.
* En général, il est activé lorsque le prix de l'actif/contrat sous-jacent franchit le `triggerPrice` **dans n'importe quelle direction**. Cependant, l'API de certains exchanges exige également de définir `triggerDirection`, ce qui déclenche l'ordre selon que le prix est au-dessus ou en dessous du `triggerPrice`. Par exemple, si vous souhaitez déclencher un ordre à cours limité (acheter 0,1 `ETH` au prix limité de `1500`) une fois que le prix de la paire dépasse `1700` :


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


En général, l'exchange détermine automatiquement la direction du `triggerPrice` (si elle est « au-dessus » ou « en dessous » du prix actuel), cependant, certains exchanges exigent que vous fournissiez `triggerDirection` avec les valeurs `ascending` ou `descending` :

```
params = {
    'triggerPrice': 1700,
    'triggerDirection': 'ascending', // order will be triggered when price goes upward and touches 1700
}
```

Notez que vous pouvez également ajouter le paramètre `reduceOnly: true` à l'ordre déclencheur (avec un éventuel paramètre `triggerDirection: 'ascending/descending'`), de sorte qu'il agirait comme un ordre « stop-loss » ou « take-profit ». Cependant, pour certains exchanges, nous supportons les types d'ordres déclencheurs « stop-loss » et « take-profit », qui impliquent automatiquement la gestion de `reduceOnly` et `triggerDirection` (voir ci-dessous).

##### Ordres Stop Loss

Identique aux ordres déclencheurs, mais la direction est importante. Implémenté en spécifiant un paramètre `stopLossPrice` (pour le triggerPrice du stop loss), et `triggerDirection` est également automatiquement implémenté au nom de l'utilisateur, de sorte qu'au lieu d'un ordre déclencheur ordinaire, vous pouvez l'utiliser comme alternative.

* Pour s'assurer que l'exchange prend en charge cette fonctionnalité, vérifiez `exchange.features` ou utilisez la méthode auxiliaire `exchange.featureValue('BTC/USDT', 'createOrder', 'stopLossPrice')`.

Supposons que vous ayez pris une position longue (vous avez acheté) à 1000 et que vous souhaitiez vous protéger des pertes en cas de chute du prix en dessous de 700. Vous placeriez un ordre stop loss avec un triggerPrice à 700. Pour cet ordre stop loss, vous pouvez soit spécifier un prix limite, soit il sera exécuté au prix du marché.

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

Supposons que vous ayez pris une position courte (vous avez vendu) à 700 et que vous souhaitiez vous protéger des pertes en cas de hausse du prix au-dessus de 1300. Vous placeriez un ordre stop loss avec un triggerPrice à 1300. Pour cet ordre stop loss, vous pouvez soit spécifier un prix limite, soit il sera exécuté au prix du marché.

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

Les ordres Stop Loss sont activés lorsque le prix de l'actif/contrat sous-jacent :

* descend en dessous du `stopLossPrice` par le haut, pour les ordres de vente. (ex. : pour clôturer une position longue et éviter des pertes supplémentaires)
* monte au-dessus du `stopLossPrice` par le bas, pour les ordres d'achat (ex. : pour clôturer une position courte et éviter des pertes supplémentaires)


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


##### Ordres Take Profit

Identique aux ordres Stop Loss, mais la direction est importante. Implémenté en spécifiant un paramètre `takeProfitPrice` (pour le triggerPrice du take profit).

Supposons que vous ayez pris une position longue (vous avez acheté) à 1000 et que vous souhaitiez réaliser vos profits en cas de hausse du prix au-dessus de 1300. Vous placeriez un ordre take profit avec un triggerPrice à 1300. Pour cet ordre take profit, vous pouvez soit spécifier un prix limite, soit il sera exécuté au prix du marché.

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

Supposons que vous ayez pris une position courte (vous avez vendu) à 700 et que vous souhaitiez réaliser vos profits en cas de chute du prix en dessous de 600. Vous placeriez un ordre take profit avec un triggerPrice à 600. Pour cet ordre take profit, vous pouvez soit spécifier un prix limite, soit il sera exécuté au prix du marché.

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

Les ordres Take Profit sont activés lorsque le prix du sous-jacent :

* monte au-dessus du `takeProfitPrice` par le bas, pour les ordres de vente (ex. : pour clôturer une position longue avec un profit)
* descend en dessous du `takeProfitPrice` par le haut, pour les ordres d'achat (ex. : pour clôturer une position courte avec un profit)


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


#### Ordres StopLoss et TakeProfit attachés à une position

Ordres **Take Profit** / **Stop Loss** liés à un ordre principal d'ouverture de position. Implémenté en fournissant des paramètres sous forme de dictionnaire pour `stopLoss` et `takeProfit` décrivant chacun respectivement.

* Par défaut, les montants des ordres stopLoss et takeProfit seront identiques à ceux de l'ordre principal, mais dans la direction opposée.
* Les ordres déclencheurs attachés sont conditionnels à l'exécution de l'ordre principal.
* Non pris en charge par tous les exchanges. Pour vérifier si le stop-loss est pris en charge, utilisez cette approche :
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


Pour les exchanges où il n'est pas possible d'utiliser des SL et TP attachés, après avoir soumis un ordre d'entrée, vous pouvez immédiatement soumettre un autre ordre (même si la position n'est peut-être pas encore ouverte) avec `stopLossPrice/takeProfitPrice` dans `params`, (ou `triggerPrice` et `reduceOnly: true`), de sorte qu'il puisse toujours agir comme un ordre stop loss pour votre position à venir (remarque : cette approche pourrait ne pas fonctionner sur certains exchanges).

Exemple :

```
    symbol = 'ADA/USDT:USDT'
    main_order = await binance.create_order(symbol, 'market', 'buy', 50) # open position
    tp_order = await binance.create_order(symbol, 'limit', 'sell', 50, 1.5, {"takeProfitPrice": 1.6}) # take profit order
    sl_order = await binance.create_order(symbol, 'limit', 'sell', 50, 0.24, {"stopLossPrice": 0.25}) # stop loss order
```

#### Ordres Trailing

Les ordres **Trailing** suivent une position ouverte. Implémenté en fournissant des paramètres float pour `trailingPercent` ou `trailingAmount`.

* Un ordre trailing ajuste continuellement le prix de l'ordre à un pourcentage fixe ou un montant en devise de cotation fixe par rapport au prix du marché actuel.
* Un ordre trailing suit une position lorsqu'elle se déplace dans une direction, mais pas dans la direction opposée.
* Si la valeur de la position augmente, l'ordre trailing change, mais si la valeur de la position baisse, l'ordre trailing reste inchangé jusqu'à l'exécution de l'ordre.
* Un ordre trailing peut être placé indépendamment après l'ouverture d'une position.
* Implémenté en renseignant soit le paramètre `trailingPercent` soit `trailingAmount` selon l'exchange.
* L'argument price peut être utilisé comme `trailingTriggerPrice`, et l'argument type peut être utilisé pour différencier les ordres trailing limite et marché si nécessaire.

*Non pris en charge par tous les exchanges.*

*Remarque : Ceci est encore en cours d'unification et est un travail en cours*


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


#### Paramètres d'ordre personnalisés

Certains exchanges vous permettent de spécifier des paramètres optionnels pour votre ordre. Vous pouvez passer vos paramètres optionnels et remplacer votre requête avec un tableau associatif en utilisant l'argument `params` dans votre appel API unifié. Tous les paramètres personnalisés sont spécifiques à chaque exchange, bien entendu, et ne sont pas interchangeables — ne vous attendez pas à ce que les paramètres personnalisés d'un exchange fonctionnent avec un autre exchange.


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


##### `clientOrderId` défini par l'utilisateur

```text
- this part of the unified API is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

L'utilisateur peut spécifier un champ `clientOrderId` personnalisé qui peut être défini lors du placement d'ordres via `params`. En utilisant le `clientOrderId`, on peut ensuite distinguer ses propres ordres. Ceci n'est disponible que pour les exchanges qui prennent en charge `clientOrderId` à ce jour. Pour les exchanges qui ne le prennent pas en charge, cela renverra soit une erreur lors de la fourniture du `clientOrderId`, soit il sera ignoré en définissant le `clientOrderId` à `undefined/None/null`.


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


##### Mode hedge pour un ordre

Si l'exchange prend en charge la [fonctionnalité](#features) pour les ordres `hedged`, l'utilisateur peut passer `params['hedged'] = true` dans `createOrder` pour ouvrir une position `hedged` au lieu de l'ordre en mode `one-way` par défaut. Cependant, si l'exchange prend en charge `.has['setPositionMode']`, ces exchanges pourraient ne pas prendre en charge le paramètre `hedged` directement via `createOrder` ; à la place, sur un tel exchange, vous devez d'abord changer le mode du compte en utilisant [setPositionMode()](#set-position-mode), puis exécuter `createOrder` (sans le paramètre `hedged`) et il placera l'ordre hedged par défaut.


### Modification des ordres

Pour modifier un ordre, vous pouvez utiliser la méthode `editOrder`

```javascript
editOrder (id, symbol, type, side, amount, price = undefined, params = {})
```

Paramètres

- **id** (String) *requis* Identifiant de l'ordre (ex. `1645807945000`)
- **symbol** (String) *requis* Symbole de marché CCXT unifié
- **side** (String) *requis* la direction de votre ordre.
  **Côtés unifiés :**
  - `buy` donner la devise de cotation et recevoir la devise de base ; par exemple, acheter `BTC/USD` signifie que vous recevrez des bitcoins en échange de vos dollars.
  - `sell` donner la devise de base et recevoir la devise de cotation ; par exemple, vendre `BTC/USD` signifie que vous recevrez des dollars en échange de vos bitcoins.
- **type** (String) *requis* type d'ordre
  **Types unifiés :**
  - [`market`](#market-orders) non autorisé par certains exchanges, voir [leur documentation](#exchanges) pour plus de détails
  - [`limit`](#limit-orders)
  - voir #custom-order-params et #other-order-types pour les types non unifiés
- **amount** (Number) *requis* la quantité de devise que vous souhaitez échanger, généralement, mais pas toujours, en unités de la devise de base de la paire de trading (les unités pour certains exchanges dépendent du côté de l'ordre : voir leur documentation API pour plus de détails.)
- **price** (Float) le prix auquel l'ordre doit être exécuté, en unités de la devise de cotation (ignoré pour les ordres au marché)
- **params** (Dictionary) Paramètres supplémentaires spécifiques au point de terminaison de l'API de l'exchange (ex. `{"settle": "usdt"}`)

Retourne

- Une [structure d'ordre](#order-structure)

### Annulation des ordres

Pour annuler un ordre existant, utilisez

- `cancelOrder ()` pour un seul ordre
- `cancelOrders ()` pour plusieurs ordres
- `cancelAllOrders ()` pour tous les ordres ouverts
- `cancelAllOrdersAfter ()` pour tous les ordres ouverts après le délai imparti

```javascript
cancelOrder (id, symbol = undefined, params = {})
```

Paramètres

- **id** (String) *requis* Identifiant de l'ordre (ex. `1645807945000`)
- **symbol** (String) Symbole de marché CCXT unifié **requis** sur certains exchanges (ex. `"BTC/USDT"`)
- **params** (Dictionary) Paramètres supplémentaires spécifiques au point de terminaison de l'API de l'exchange (ex. `{"settle": "usdt"}`)

Retourne

- Une [structure d'ordre](#order-structure)

```javascript
cancelOrders (ids, symbol = undefined, params = {})
```

Paramètres

- **ids** (\[String\]) *requis* Identifiants des ordres (ex. `1645807945000`)
- **symbol** (String) Symbole de marché CCXT unifié **requis** sur certains exchanges (ex. `"BTC/USDT"`)
- **params** (Dictionary) Paramètres supplémentaires spécifiques au point de terminaison de l'API de l'exchange (ex. `{"settle": "usdt"}`)

Retourne

- Un tableau de [structures d'ordre](#order-structure)

```javascript
async cancelAllOrders (symbol = undefined, params = {})
```

Paramètres

- **symbol** (String) Symbole de marché CCXT unifié **requis** sur certains exchanges (ex. `"BTC/USDT"`)
- **params** (Dictionary) Paramètres supplémentaires spécifiques au point de terminaison de l'API de l'exchange (ex. `{"settle": "usdt"}`)

Retourne

- Un tableau de [structures d'ordre](#order-structure)

```javascript
async cancelAllOrdersAfter (timeout, params = {})
```

Paramètres

- **timeout** (number) temps de décompte en millisecondes **requis** sur certains exchanges, 0 représente l'annulation du minuteur (ex. ``10``\ )
- **params** (Dictionary) Paramètres supplémentaires spécifiques au point de terminaison de l'API de l'exchange (ex. ``{"type": "spot"}``\ )

Retourne

- Un objet

#### Exceptions lors de l'annulation des ordres

La méthode `cancelOrder()` est généralement utilisée uniquement sur les ordres ouverts. Cependant, il peut arriver que votre ordre soit exécuté (rempli et clôturé) avant que votre demande d'annulation n'arrive, de sorte qu'une demande d'annulation peut concerner un ordre déjà clôturé.

Une demande d'annulation peut également lever une exception `OperationFailed` indiquant que l'ordre a peut-être ou n'a peut-être pas été annulé avec succès et si vous devez réessayer ou non. Des appels consécutifs à `cancelOrder()` peuvent également concerner un ordre déjà annulé.

Ainsi, `cancelOrder()` peut lever une exception `OrderNotFound` dans ces cas :
- annulation d'un ordre déjà clôturé
- annulation d'un ordre déjà annulé

## Mes transactions

```text
- this part of the unified API is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

### Comment les ordres sont liés aux transactions

Une transaction est aussi souvent appelée `a fill` (exécution). Chaque transaction est le résultat de l'exécution d'un ordre. Notez que les ordres et les transactions ont une relation un-à-plusieurs : l'exécution d'un ordre peut donner lieu à plusieurs transactions. Cependant, lorsqu'un ordre correspond à un autre ordre opposé, la paire de deux ordres correspondants produit une transaction. Ainsi, lorsqu'un ordre correspond à plusieurs ordres opposés, cela produit plusieurs transactions, une transaction par paire d'ordres correspondants.

En résumé, un ordre peut contenir *une ou plusieurs* transactions. Autrement dit, un ordre peut être *exécuté* avec une ou plusieurs transactions.

Par exemple, un carnet d'ordres peut contenir les ordres suivants (quel que soit le symbole ou la paire de trading) :

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

Tous les chiffres spécifiques ci-dessus ne sont pas réels, c'est simplement pour illustrer la façon dont les ordres et les transactions sont liés en général.

Un vendeur décide de placer un ordre de vente limite du côté de l'offre à un prix de 0,700 et un montant de 150.

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

Comme le prix et le montant de l'ordre de vente entrant (offre) couvrent plus d'un ordre d'achat (ordres `b` et `i`), la séquence d'événements suivante se produit généralement très rapidement au sein d'un moteur d'exchange, mais pas immédiatement :

1. L'ordre `b` est mis en correspondance avec la vente entrante car leurs prix se croisent. Leurs volumes *« s'annihilent mutuellement »*, ainsi, l'acheteur reçoit 100 au prix de 0,800. Le vendeur (celui qui offre) verra son ordre de vente partiellement exécuté par le volume d'achat de 100 au prix de 0,800. Notez que pour la partie exécutée de l'ordre, le vendeur obtient un meilleur prix que celui qu'il avait initialement demandé. Il demandait au minimum 0,7 mais a obtenu 0,8, ce qui est encore meilleur pour le vendeur. La plupart des exchanges conventionnels exécutent les ordres au meilleur prix disponible.

2. Un trade est généré pour l'ordre `b` en face de l'ordre de vente entrant. Ce trade *"remplit"* entièrement l'ordre `b` et la majeure partie de l'ordre de vente. Un trade est généré pour chaque paire d'ordres correspondants, que le montant ait été rempli complètement ou partiellement. Dans cet exemple, le montant du vendeur (100) remplit complètement l'ordre `b` (clôture l'ordre `b`) et remplit également l'ordre de vente partiellement (le laisse ouvert dans le carnet d'ordres).

3. L'ordre `b` a désormais un statut `closed` et un volume exécuté de 100. Il contient un trade contre l'ordre de vente. L'ordre de vente a un statut `open` et un volume exécuté de 100. Il contient un trade contre l'ordre `b`. Ainsi, chaque ordre n'a jusqu'à présent qu'un seul trade d'exécution.

4. L'ordre de vente entrant a un montant exécuté de 100 et doit encore remplir le montant restant de 50 sur son montant initial total de 150.

L'état intermédiaire du carnet d'ordres est maintenant le suivant (l'ordre `b` est `closed` et n'est plus dans le carnet d'ordres) :

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

5. L'ordre `i` est mis en correspondance avec la partie restante de la vente entrante, car leurs prix se croisent. Le montant de l'ordre d'achat `i`, qui est de 200, annule complètement le montant de vente restant de 50. L'ordre `i` est partiellement exécuté à hauteur de 50, mais le reste de son volume, soit le montant restant de 150, demeurera dans le carnet d'ordres. L'ordre de vente, en revanche, est intégralement satisfait par cette deuxième correspondance.

6. Un trade est généré pour l'ordre `i` en face de l'ordre de vente entrant. Ce trade remplit partiellement l'ordre `i` et complète l'exécution de l'ordre de vente. Là encore, il s'agit d'un seul trade pour une paire d'ordres correspondants.

7. L'ordre `i` a maintenant un statut `open`, un montant exécuté de 50 et un montant restant de 150. Il contient un trade d'exécution contre l'ordre de vente. L'ordre de vente a désormais un statut `closed` et a intégralement rempli son montant initial total de 150. Il contient cependant deux trades : le premier contre l'ordre `b` et le second contre l'ordre `i`. Ainsi, chaque ordre peut avoir un ou plusieurs trades d'exécution, selon la manière dont leurs volumes ont été mis en correspondance par le moteur de l'exchange.

Après la séquence ci-dessus, le carnet d'ordres mis à jour se présentera comme suit.

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

Notez que l'ordre `b` a disparu, et que l'ordre de vente n'est plus présent non plus. Tous les ordres clôturés et intégralement exécutés disparaissent du carnet d'ordres. L'ordre `i`, qui a été partiellement exécuté, qui dispose encore d'un volume restant et d'un statut `open`, est toujours présent.

### Trades personnels

La plupart des méthodes unifiées retournent soit un objet unique, soit un tableau simple (une liste) d'objets (trades). Cependant, très peu d'exchanges (voire aucun) ne retournent tous les trades en une seule fois. Leurs APIs `limit` limitent le plus souvent la sortie à un certain nombre d'objets les plus récents. **VOUS NE POUVEZ PAS OBTENIR TOUS LES OBJETS DEPUIS LE DÉBUT DES TEMPS JUSQU'AU MOMENT PRÉSENT EN UN SEUL APPEL**. En pratique, très peu d'exchanges le tolèrent ou le permettent.

Comme pour toutes les autres méthodes unifiées de récupération de données historiques, la méthode `fetchMyTrades` accepte un argument `since` pour la [pagination basée sur la date](#date-based-pagination). Comme pour toutes les autres méthodes unifiées de la bibliothèque CCXT, l'argument `since` de `fetchMyTrades` doit être un **timestamp entier en millisecondes**.

Pour récupérer les trades historiques, l'utilisateur devra parcourir les données par portions ou « pages » d'objets. La pagination implique souvent *« la récupération de portions de données une par une »* dans une boucle.

Dans de nombreux cas, un argument `symbol` est requis par les APIs des exchanges ; vous devez donc itérer sur tous les symboles pour obtenir tous vos trades. Si le `symbol` est manquant et que l'exchange l'exige, CCXT lèvera une exception `ArgumentsRequired` pour signaler l'exigence à l'utilisateur. Le `symbol` doit alors être spécifié. L'une des approches consiste à filtrer les symboles pertinents dans la liste de tous les symboles en examinant les soldes non nuls ainsi que les transactions (retraits et dépôts). Par ailleurs, les exchanges ont une limite sur la période de temps en arrière que vous pouvez consulter.

Dans la plupart des cas, les utilisateurs sont **tenus d'utiliser au moins un certain type de [pagination](#pagination)** afin d'obtenir les résultats attendus de manière cohérente.


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


Retourne un tableau ordonné `[]` de trades (le trade le plus récent en dernier).

#### Structure d'un trade

Les trades désignent l'échange d'une devise contre une autre, contrairement aux [transactions](#transaction-structure), qui désignent un transfert d'une pièce donnée.

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

- Le travail sur les informations `'fee'` et `'fees'` est encore en cours ; les informations de frais peuvent être partiellement ou entièrement absentes, selon les capacités de l'exchange.
- La devise de `fee` peut être différente des deux devises échangées (par exemple, un ordre ETH/BTC avec des frais en USD).
- Le `cost` du trade signifie `amount * price`. C'est le volume *quote* total du trade (alors que `amount` est le volume *base*). Le champ cost lui-même est là principalement pour la commodité et peut être déduit des autres champs.
- Le `cost` du trade est une valeur _« brute »_. C'est-à-dire la valeur avant frais, et les frais doivent être appliqués ensuite.

### Trades par identifiant d'ordre

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


## Grand livre (Ledger)

Le grand livre est simplement l'historique des modifications, des actions effectuées par l'utilisateur ou des opérations ayant modifié le solde de l'utilisateur de quelque manière que ce soit, c'est-à-dire l'historique des mouvements de tous les fonds depuis/vers tous les comptes de l'utilisateur, ce qui comprend

- les dépôts et retraits (financement)
- les montants entrants et sortants résultant d'un trade ou d'un ordre
- les frais de trading
- les transferts entre comptes
- les remises, cashbacks et autres types d'événements sujets à comptabilisation.

Les données sur les entrées du grand livre peuvent être récupérées à l'aide de

- `fetchLedgerEntry ()` pour une entrée du grand livre
- `fetchLedger ( code )` pour plusieurs entrées du grand livre de la même devise
- `fetchLedger ()` pour toutes les entrées du grand livre

```javascript
fetchLedgerEntry (id, code = undefined, params = {})
```

Paramètres

- **id** (String) *requis* Identifiant de l'entrée du grand livre
- **code** (String) Code de devise CCXT unifié, requis (ex. `"USDT"`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange (ex. `{"type": "deposit"}`)

Retourne

- Une [structure d'entrée du grand livre](#ledger-entry-structure)

```javascript
async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {})
```

Paramètres

- **code** (String) Code de devise CCXT unifié ; *requis* si la récupération de toutes les entrées du grand livre pour tous les actifs à la fois n'est pas prise en charge (ex. `"USDT"`)
- **since** (Integer) Timestamp (ms) du moment le plus ancien pour lequel récupérer les retraits (ex. `1646940314000`)
- **limit** (Integer) Le nombre de [structures d'entrées du grand livre](#ledger-entry-structure) à récupérer (ex. `5`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange (ex. `{"endTime": 1645807945000}`)

Retourne

- Un tableau de [structures d'entrées du grand livre](#ledger-entry-structure)

### Structure d'une entrée du grand livre

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

#### Notes sur la structure d'une entrée du grand livre

Le type de l'entrée du grand livre est le type de l'opération qui lui est associée. Si le montant provient d'un ordre de vente, il est associé à une entrée du grand livre de type trade correspondant, et le referenceId contiendra l'identifiant du trade associé (si l'exchange en question le fournit). Si le montant est débité suite à un retrait, il est associé à une transaction correspondante.

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

Le champ `referenceId` contient l'identifiant de l'événement correspondant qui a été enregistré en ajoutant un nouvel élément au grand livre.

Le champ `status` est là pour prendre en charge les exchanges qui incluent les modifications en attente et annulées dans le grand livre. Le grand livre représente naturellement les modifications réelles qui ont eu lieu, donc le statut est `'ok'` dans la plupart des cas.

Le type d'entrée du grand livre peut être associé à un trade ordinaire, une transaction de financement (dépôt ou retrait) ou un `transfer` interne entre deux comptes du même utilisateur. Si l'entrée du grand livre est associée à un transfert interne, le champ `account` contiendra l'identifiant du compte modifié par l'entrée du grand livre en question. Le champ `referenceAccount` contiendra l'identifiant du compte opposé vers lequel/depuis lequel les fonds sont transférés, selon la `direction` (`'in'` ou `'out'`).

## Dépôt

Pour déposer des fonds en cryptomonnaie sur un exchange, vous devez obtenir une adresse de l'exchange pour la devise que vous souhaitez déposer en utilisant `fetchDepositAddress`. Vous pouvez ensuite appeler la méthode `withdraw` avec la devise et l'adresse spécifiées.

Pour déposer une devise fiat sur un exchange, vous pouvez utiliser la méthode `deposit` avec les données récupérées via la méthode `fetchDepositMethodId`.
*cette fonctionnalité de dépôt est actuellement prise en charge uniquement sur coinbase, n'hésitez pas à signaler tout problème que vous rencontrez*

- `deposit ()`

```javascript
deposit (id, code = undefined, params = {})
```

Paramètres

- **id** (String) *requis* Identifiant du dépôt
- **code** (String) Code de devise fiat, requis (ex. `"USD"`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange (ex. `{"account": "fiat"}`)

Retourne

- Une [structure de transaction](#transaction-structure)

- `fetchDepositMethodId ()`

```javascript
fetchDepositMethodId (id, params = {})
```

Paramètres

- **id** (String) *requis* Identifiant du dépôt
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange (ex. `{"account": "fiat"}`)

Retourne

- Une [structure d'identifiant de dépôt](#deposit-id-structure)

- `fetchDepositMethodIds ()`

```javascript
fetchDepositMethodIds (params = {})
```

Paramètres

- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange (ex. `{"account": "fiat"}`)

Retourne

- Un tableau de [structures d'identifiants de dépôt](#deposit-id-structure)

### Structure d'un identifiant de dépôt

La structure d'identifiant de dépôt retournée par `fetchDepositMethodId`, `fetchDepositMethodIds` se présente comme suit :

```javascript
{
    'info': {},                 // raw unparsed data as returned from the exchange
    'id': '75ab52ff-f25t',      // the deposit id
    'currency': 'USD',          // fiat currency
    'verified': true,           // whether funding through this id is verified or not
    'tag': 'from credit card',  // tag / memo / name of funding source
}
```

Les données sur les dépôts effectués sur un compte peuvent être récupérées à l'aide de

- `fetchDeposit ()` pour un seul dépôt
- `fetchDeposits ( code )` pour plusieurs dépôts de la même devise
- `fetchDeposits ()` pour tous les dépôts sur un compte

```javascript
fetchDeposit (id, code = undefined, params = {})
```

Paramètres

- **id** (String) *requis* Identifiant du dépôt
- **code** (String) Code de devise CCXT unifié, requis (ex. `"USDT"`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange (ex. `{"network": "TRX"}`)

Retourne

- Une [structure de transaction](#transaction-structure)

```javascript
fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {})
```

Paramètres

- **code** (String) Code de devise CCXT unifié (ex. `"USDT"`)
- **since** (Integer) Timestamp (ms) du moment le plus ancien pour lequel récupérer les dépôts (ex. `1646940314000`)
- **limit** (Integer) Le nombre de [structures de transaction](#transaction-structure) à récupérer (ex. `5`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange (ex. `{"endTime": 1645807945000}`)

Retourne

- Un tableau de [structures de transaction](#transaction-structure)

## Retrait

La méthode `withdraw` peut être utilisée pour retirer des fonds d'un compte.

Certains exchanges exigent une approbation manuelle de chaque retrait via la 2FA (authentification à deux facteurs). Pour approuver votre retrait, vous devez généralement soit cliquer sur leur lien secret dans votre boîte de réception email, soit saisir un code Google Authenticator ou un code Authy sur leur site web pour vérifier que la transaction de retrait a bien été demandée intentionnellement.

Dans certains cas, vous pouvez également utiliser l'identifiant de retrait pour vérifier ultérieurement le statut du retrait (qu'il ait réussi ou non) et pour soumettre des codes de confirmation 2FA, là où cela est pris en charge par l'exchange. Consultez [leur documentation](#exchanges) pour plus de détails.

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


Paramètres

- **code** (String) *requis* Code de devise CCXT unifié (ex. `"USDT"`)
- **amount** (Float) *requis* Le montant de devise à retirer (ex. `20`)
- **address** (String) *requis* L'adresse du destinataire du retrait (ex. `"TEY6qjnKDyyq5jDc3DJizWLCdUySrpQ4yp"`)
- **tag** (String) Requis pour certains réseaux (ex. `"52055"`)
- **params** (Dictionary) Paramètres spécifiques à l'endpoint de l'API de l'exchange (ex. `{"network": "TRX"}`)

Retourne

- Une [structure de transaction](#transaction-structure)

---

Les données sur les retraits effectués vers un compte peuvent être récupérées en utilisant

- `fetchWithdrawal ()` pour un seul retrait
- `fetchWithdrawals ( code )` pour plusieurs retraits de la même devise
- `fetchWithdrawals ()` pour tous les retraits d'un compte

```javascript
fetchWithdrawal (id, code = undefined, params = {})
```

Paramètres

- **id** (String) *requis* Identifiant du retrait
- **code** (String) Code de devise CCXT unifié (ex. `"USDT"`)
- **params** (Dictionary) Paramètres spécifiques à l'endpoint de l'API de l'exchange (ex. `{"network": "TRX"}`)

```javascript
fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {})
```

Paramètres

- **code** (String) Code de devise CCXT unifié (ex. `"USDT"`)
- **since** (Integer) Horodatage (ms) de la date la plus ancienne pour laquelle récupérer les retraits (ex. `1646940314000`)
- **limit** (Integer) Le nombre de [structures de transaction](#transaction-structure) à récupérer (ex. `5`)
- **params** (Dictionary) Paramètres spécifiques à l'endpoint de l'API de l'exchange (ex. `{"endTime": 1645807945000}`)

Retourne

- Un tableau de [structures de transaction](#transaction-structure)

### Réseaux de dépôt et de retrait

Il est également possible de passer les paramètres comme quatrième argument avec ou sans tag spécifié

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


Les alias suivants de `network` permettent de retirer des cryptomonnaies sur plusieurs chaînes

| Devise | Réseau |
|:---:|:---:|
| ETH  | ERC20 |
| TRX  | TRC20 |
| BSC  | BEP20 |
| BNB  | BEP2  |
| HT   | HECO  |
| OMNI | OMNI  |

Vous pouvez définir la valeur de `exchange.withdraw ('USDT', 100, 'TVJ1fwyJ1a8JbtUxZ8Km95sDFN9jhLxJ2D', { 'network': 'TRX' })` afin de retirer des USDT sur la chaîne TRON, ou 'BSC' pour retirer des USDT sur la Binance Smart Chain. Dans le tableau ci-dessus, BSC et BEP20 sont des alias équivalents, donc peu importe lequel vous utilisez car ils produiront tous les deux le même effet.

### Structure de transaction

Les transactions désignent un transfert d'une devise donnée, contrairement aux [trades](#trade-structure), qui désignent l'échange d'une devise contre une autre.

- *structure de dépôt*
- *structure de retrait*

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

#### Notes sur la structure de transaction

- `addressFrom` ou `addressTo` peut être `undefined/None/null`, si l'exchange en question ne spécifie pas tous les côtés de la transaction
- La sémantique du champ `address` est spécifique à l'exchange. Dans certains cas, il peut contenir l'adresse de l'expéditeur, dans d'autres cas il peut contenir l'adresse du destinataire. La valeur réelle dépend de l'exchange.
- Le champ `updated` est l'horodatage UTC en millisecondes de la modification de statut la plus récente de cette opération de financement, qu'il s'agisse d'un `withdrawal` ou d'un `deposit`. Il est nécessaire si vous souhaitez suivre vos changements dans le temps, au-delà d'un instantané statique. Par exemple, si l'exchange en question rapporte `created_at` et `confirmed_at` pour une transaction, alors le champ `updated` prendra la valeur de `Math.max (created_at, confirmed_at)`, c'est-à-dire l'horodatage du changement de statut le plus récent.
- Le champ `updated` peut être `undefined/None/null` dans certains cas spécifiques à l'exchange.
- La sous-structure `fee` peut être absente, si elle n'est pas fournie dans la réponse de l'exchange.
- Le champ `comment` peut être `undefined/None/null`, sinon il contiendra un message ou une note définie par l'utilisateur lors de la création de la transaction.
- Soyez prudent lors de la manipulation du `tag` et de l'`address`. Le `tag` n'est **PAS une chaîne arbitraire définie par l'utilisateur** selon votre choix ! Vous ne pouvez pas envoyer des messages utilisateur et des commentaires dans le `tag`. Le but du champ `tag` est d'adresser correctement votre portefeuille, il doit donc être correct. Vous devez uniquement utiliser le `tag` reçu de l'exchange avec lequel vous travaillez, sinon votre transaction pourrait ne jamais arriver à destination.
- Le champ `type` peut être `deposit/withdrawal` ou, dans certains cas (lorsque l'endpoint de l'exchange renvoie à la fois des transferts internes et des transactions blockchain, ex. `ccxt.coinlist`), peut être `transfer`.

### Exemples fetchDeposits

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


### Exemples fetchWithdrawals


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


### Exemples fetchTransactions


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


## Adresses de dépôt

L'adresse de dépôt peut être soit une adresse déjà existante créée précédemment auprès de l'exchange, soit être créée à la demande. Pour voir laquelle des deux méthodes est prise en charge, vérifiez les propriétés `exchange.has['fetchDepositAddress']` et `exchange.has['createDepositAddress']`.

```javascript
fetchDepositAddress (code, params = {})
createDepositAddress (code, params = {})
```

Paramètres

- **code** (String) *requis* Code de devise CCXT unifié (ex. `"USDT"`)
- **params** (Dictionary) Paramètres spécifiques à l'endpoint de l'API de l'exchange (ex. `{"endTime": 1645807945000}`)

Retourne

- une [structure d'adresse](#address-structure)

---

Certains exchanges peuvent également avoir une méthode pour récupérer plusieurs adresses de dépôt à la fois ou toutes en même temps.

```javascript
fetchDepositAddresses (codes = undefined, params = {})
```

Paramètres

- **code** (\[String\]) Tableau de codes de devise CCXT unifiés. Peut être requis ou non selon l'exchange (ex. `["USDT", "BTC"]`)
- **params** (Dictionary) Paramètres spécifiques à l'endpoint de l'API de l'exchange (ex. `{"endTime": 1645807945000}`)

Retourne

- un tableau de [structures d'adresse](#address-structure)

```javascript
fetchDepositAddressesByNetwork (code, params = {})
```

Paramètres

- **code** (String) *requis* Code de devise CCXT unifié (ex. `"USDT"`)
- **params** (Dictionary) Paramètres spécifiques à l'endpoint de l'API de l'exchange (ex. `{"endTime": 1645807945000}`)

Retourne

- un tableau de [structures d'adresse](#address-structure)

### Structure d'adresse

Les structures d'adresse retournées par `fetchDepositAddress`, `fetchDepositAddresses`, `fetchDepositAddressesByNetwork` et `createDepositAddress` ressemblent à ceci :

```javascript
{
    'info': response,       // raw unparsed data as returned from the exchange
    'currency': 'USDC',     // currency code
    'network': 'ERC20',     // a deposit/withdraw networks, ERC20, TRC20, BSC20 (see below)
    'address': '0x',        // blockchain address in terms of the requested currency and network
    'tag': undefined,       // tag / memo / paymentId for particular currencies (XRP, XMR, ...)
}
```

Avec certaines devises, comme AEON, BTS, GXS, NXT, SBD, STEEM, STR, XEM, XLM, XMR, XRP, un argument supplémentaire `tag` est généralement requis par les exchanges. Les autres devises auront le `tag` défini sur `undefined / None / null`. Le tag est un mémo, un message ou un identifiant de paiement joint à une transaction de retrait. Le tag est obligatoire pour ces devises et identifie le compte utilisateur destinataire.

Soyez prudent lors de la spécification du `tag` et de l'`address`. Le `tag` n'est **PAS une chaîne arbitraire définie par l'utilisateur** selon votre choix ! Vous ne pouvez pas envoyer des messages utilisateur et des commentaires dans le `tag`. Le but du champ `tag` est d'adresser correctement votre portefeuille, il doit donc être correct. Vous devez uniquement utiliser le `tag` reçu de l'exchange avec lequel vous travaillez, sinon votre transaction pourrait ne jamais arriver à destination.

**Le champ `network` est relativement nouveau, il peut être `undefined / None / null` ou totalement absent dans certains cas (avec certains exchanges), mais sera ajouté partout éventuellement. Il est encore en cours d'unification.**

## Transferts

La méthode `transfer` effectue des transferts internes de fonds entre comptes sur le même exchange. Cela peut inclure des sous-comptes ou des comptes de différents types (`spot`, `margin`, `future`, ...). Si un exchange est séparé dans CCXT en une classe spot et futures (ex. `binanceusdm`, `kucoinfutures`, ...), alors la méthode `transferIn` peut être disponible pour transférer des fonds vers le compte futures, et la méthode `transferOut` peut être disponible pour transférer des fonds hors du compte futures

```javascript
transfer (code, amount, fromAccount, toAccount, params = {})
```

Paramètres

- **code** (String) Code de devise CCXT unifié (ex. `"USDT"`)
- **amount** (Float) Le montant de devise à transférer (ex. `10.5`)
- **fromAccount** (String) Le compte depuis lequel transférer les fonds.
- **toAccount** (String) Le compte vers lequel transférer les fonds.
- **params** (Dictionary) Paramètres spécifiques à l'endpoint de l'API de l'exchange (ex. `{"endTime": 1645807945000}`)
- **params.symbol** (String) Symbole de marché lors du transfert vers ou depuis un compte margin (ex. `'BTC/USDT'`)

### Types de compte

`fromAccount` et `toAccount` peuvent accepter l'identifiant de compte de l'exchange ou l'une des valeurs unifiées suivantes :

- `funding` *pour certains exchanges, `funding` et `spot` sont le même compte*
- `main` *pour certains exchanges qui permettent des sous-comptes*
- `spot`
- `margin`
- `future`
- `swap`
- `lending`

Vous pouvez récupérer tous les types de compte en sélectionnant les clés depuis `exchange.options['accountsByType']`

Certains exchanges permettent les transferts vers des adresses e-mail, des numéros de téléphone ou vers d'autres utilisateurs par identifiant utilisateur.

Retourne

- Une [structure de transfert](#transfer-structure)

```javascript
transferIn (code, amount, params = {})
transferOut (code, amount, params = {})
```

Paramètres

- **code** (String) Code de devise CCXT unifié (ex. `"USDT"`)
- **amount** (Float) Le montant de devise à transférer (ex. `10.5`)
- **params** (Dictionary) Paramètres spécifiques à l'endpoint de l'API de l'exchange (ex. `{"endTime": 1645807945000}`)

Retourne

- Une [structure de transfert](#transfer-structure)

```javascript
fetchTransfers (code = undefined, since = undefined, limit = undefined, params = {})
```

Paramètres

- **code** (String) Code de devise CCXT unifié (ex. `"USDT"`)
- **since** (Integer) Horodatage (ms) de la date la plus ancienne pour laquelle récupérer les transferts (ex. `1646940314000`)
- **limit** (Integer) Le nombre de [structures de transfert](#transfer-structure) à récupérer (ex. `5`)
- **params** (Dictionary) Paramètres spécifiques à l'endpoint de l'API de l'exchange (ex. `{"endTime": 1645807945000}`)

Retourne

- Un tableau de [structures de transfert](#transfer-structure)

```javascript
fetchTransfer (id, since = undefined, limit = undefined, params = {})
```

Paramètres

- **id** (String) identifiant du transfert (ex. `"12345"`)
- **since** (Integer) Horodatage (ms) de la date la plus ancienne pour laquelle récupérer les transferts (ex. `1646940314000`)
- **limit** (Integer) Le nombre de [structures de transfert](#transfer-structure) à récupérer (ex. `5`)
- **params** (Dictionary) Paramètres spécifiques à l'endpoint de l'API de l'exchange (ex. `{"endTime": 1645807945000}`)

Retourne

- Une [structure de transfert](#transfer-structure)

### Structure de transfert

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
## Frais

**Cette section de l'API CCXT unifiée est en cours de développement.**

Les frais sont souvent regroupés en deux catégories :

- Frais de trading. Les frais de trading sont le montant payable à l'exchange, généralement un pourcentage du volume tradé (exécuté).
- Frais de transaction. Le montant payable à l'exchange lors des dépôts et des retraits ainsi que les frais de transaction crypto sous-jacents (frais tx).

Étant donné que la structure des frais peut dépendre du volume réel de devises tradées par l'utilisateur, les frais peuvent être spécifiques au compte. Méthodes pour travailler avec des frais spécifiques au compte :

```javascript
fetchTradingFee (symbol, params = {})
fetchTradingFees (params = {})
fetchDepositWithdrawFees (codes = undefined, params = {})
fetchDepositWithdrawFee (code, params = {})
```


Les méthodes de frais retourneront une structure de frais unifiée, qui est souvent présente avec les ordres et les trades également. La structure de frais est un format commun pour représenter les informations de frais dans toute la bibliothèque. Les structures de frais sont généralement indexées par marché ou par devise.

Étant donné que c'est encore un travail en cours, certaines ou toutes les méthodes et informations décrites dans cette section peuvent être absentes pour tel ou tel exchange.

**N'utilisez PAS la propriété `.fees` de l'instance d'exchange car elle contient le plus souvent des informations prédéfinies/codées en dur. Les frais réels doivent uniquement être accessibles depuis les marchés et les devises.**

**REMARQUE : Auparavant, nous utilisions fetchTransactionFee(s) pour récupérer les frais de transaction, ces fonctions sont désormais OBSOLÈTES et ont été remplacées par fetchDepositWithdrawFee(s)**

Vous appelez `fetchTradingFee` / `fetchTradingFees` pour récupérer les frais de trading, `fetchDepositWithdrawFee` / `fetchDepositWithdrawFees` pour récupérer les frais de dépôt et de retrait.

### Structure des frais

Les ordres, les transactions privées, les opérations et les entrées de grand livre peuvent définir les informations suivantes dans leur champ `fee` :

```javascript
{
    'currency': 'BTC', // the unified fee currency code
    'rate': percentage, // the fee rate, 0.05% = 0.0005, 1% = 0.01, ...
    'cost': feePaid, // the fee cost (amount * fee rate)
}
```

### Barème des frais

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

### Frais de trading

Les frais de trading sont des propriétés des marchés. Le plus souvent, les frais de trading sont chargés dans les marchés lors de l'appel `fetchMarkets`. Parfois, cependant, les plateformes d'échange servent les frais depuis des points de terminaison différents.

La méthode `calculateFee` peut être utilisée pour précalculer les frais de trading qui seront payés (utilisez `calculateFeeWithRate` si vous disposez d'un frais de trading personnalisé / d'un niveau, comme VIP-X, au lieu du frais utilisateur par défaut). **AVERTISSEMENT ! Cette méthode est expérimentale, instable et peut produire des résultats incorrects dans certains cas.** Vous ne devez l'utiliser qu'avec précaution. Les frais réels peuvent différer des valeurs retournées par `calculateFee`, ceci est uniquement à titre de précalcul. Ne vous fiez pas aux valeurs précalculées, car les conditions du marché changent fréquemment. Il est difficile de savoir à l'avance si votre ordre sera un preneur ou un faiseur de marché.

```javascript
    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {})
    calculateFeeWithRate (symbol, type, side, amount, price, takerOrMaker = 'taker', customRate, params = {})
```

La méthode `calculateFee` retournera une structure de frais unifiée avec les frais précalculés pour un ordre avec les paramètres spécifiés.

L'accès aux taux de frais de trading doit se faire via [`fetchTradingFees`](#fee-schedule), ce qui est l'approche recommandée. Si cette méthode n'est pas supportée par la plateforme d'échange, alors via la propriété `.markets`, comme suit :

```javascript
exchange.markets['ETH/BTC']['taker'] // taker fee rate for ETH/BTC
exchange.markets['BTC/USD']['maker'] // maker fee rate for BTC/USD
```

Les marchés stockés sous la propriété `.markets` peuvent contenir des informations supplémentaires relatives aux frais :

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

**AVERTISSEMENT ! Les informations relatives aux frais sont expérimentales, instables et peuvent n'être que partiellement disponibles ou pas du tout.**

Les frais de faiseur sont payés lorsque vous fournissez de la liquidité à la plateforme d'échange, c'est-à-dire que vous *tenez le marché* pour un ordre et que quelqu'un d'autre le remplit. Les frais de faiseur sont généralement inférieurs aux frais de preneur. De même, les frais de preneur sont payés lorsque vous *prenez* de la liquidité sur la plateforme d'échange et remplissez l'ordre de quelqu'un d'autre.

Les frais peuvent être négatifs, ce qui est très courant parmi les plateformes d'échange de produits dérivés. Un frais négatif signifie que la plateforme d'échange versera un remboursement (récompense) à l'utilisateur pour le trading.

De plus, certaines plateformes d'échange peuvent ne pas spécifier les frais en pourcentage du volume, vérifiez le champ `percentage` du marché pour en être sûr.

#### Barème des frais de trading

Certaines plateformes d'échange disposent d'un point de terminaison pour récupérer le barème des frais de trading, celui-ci est associé aux méthodes unifiées `fetchTradingFees` et `fetchTradingFee`

```javascript
fetchTradingFee (symbol, params = {})
```

Paramètres

- **symbol** (String) *requis* Symbole de marché unifié (ex. `"BTC/USDT"`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"currency": "quote"}`)

Retourne

- Une [structure de frais de trading](#trading-fee-structure)

```javascript
fetchTradingFees (params = {})
```

Paramètres

- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"currency": "quote"}`)

Retourne

- Un tableau de [structures de frais de trading](#trading-fee-structure)

#### Structure de frais de trading

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

### Frais de transaction

Les frais de transaction sont des propriétés des devises (solde du compte).

L'accès aux taux de frais de transaction doit se faire via la propriété `.currencies`. Cet aspect n'est pas encore unifié et est susceptible de changer.

```javascript
exchange.currencies['ETH']['fee'] // tx/withdrawal fee rate for ETH
exchange.currencies['BTC']['fee'] // tx/withdrawal fee rate for BTC
```

#### Barème des frais de transaction

Certaines plateformes d'échange disposent d'un point de terminaison pour récupérer le barème des frais de transaction, celui-ci est associé aux méthodes unifiées

- `fetchTransactionFee ()` pour un seul barème de frais de transaction
- `fetchTransactionFees ()` pour tous les barèmes de frais de transaction

```javascript
fetchTransactionFee (code, params = {})
```

Paramètres

- **code** (String) *requis* Code de devise CCXT unifié, requis (ex. `"USDT"`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"type": "deposit"}`)
- **params.network** (String) Spécifiez le réseau CCXT unifié (ex. `{"network": "TRC20"}`)

Retourne

- Une [structure de frais de transaction](#transaction-fee-structure)

```javascript
fetchTransactionFees (codes = undefined, params = {})
```

Paramètres

- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"type": "deposit"}`)

Retourne

- Un tableau de [structures de frais de transaction](#transaction-fee-structure)

#### Structure de frais de transaction

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

## Intérêts d'emprunt

* marge uniquement

Pour trader avec un effet de levier sur les marchés au comptant ou de marge, la devise doit être empruntée sous forme de prêt. Cette devise empruntée doit être remboursée avec des intérêts. Pour obtenir le montant des intérêts accumulés, vous pouvez utiliser la méthode `fetchBorrowInterest`

```javascript
fetchBorrowInterest (code = undefined, symbol = undefined, since = undefined, limit = undefined, params = {})
```

Paramètres

- **code** (String) Le code de devise unifié pour la devise des intérêts (ex. `"USDT"`)
- **symbol** (String) Le symbole de marché d'un marché de marge isolé, si non défini, les intérêts pour les marchés de marge croisée sont retournés (ex. `"BTC/USDT:USDT"`)
- **since** (Integer) Horodatage (ms) du moment le plus ancien pour lequel récupérer les enregistrements d'intérêts (ex. `1646940314000`)
- **limit** (Integer) Le nombre de [structures d'intérêts d'emprunt](#borrow-interest-structure) à récupérer (ex. `5`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"endTime": 1645807945000}`)

Retourne

- Un tableau de [structures d'intérêts d'emprunt](#borrow-interest-structure)

### Structure d'intérêts d'emprunt

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

## Emprunter et rembourser la marge

*marge uniquement*

Pour emprunter et rembourser une devise sous forme de prêt sur marge, utilisez `borrowCrossMargin`, `borrowIsolatedMargin`, `repayCrossMargin` et `repayIsolatedMargin`.

```javascript
borrowCrossMargin (code, amount, params = {})
repayCrossMargin (code, amount, params = {})
```
Paramètres

- **code** (String) *requis* Le code de devise unifié pour la devise à emprunter ou à rembourser (ex. `"USDT"`)
- **amount** (Float) *requis* Le montant de la marge à emprunter ou à rembourser (ex. `20.92`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"rate": 0.002}`)

Retourne

- Une [structure de prêt sur marge](#margin-loan-structure)

```javascript
borrowIsolatedMargin (symbol, code, amount, params = {})
repayIsolatedMargin (symbol, code, amount, params = {})
```
Paramètres

- **symbol** (String) *requis* Le symbole de marché CCXT unifié d'un marché de marge isolé (ex. `"BTC/USDT"`)
- **code** (String) *requis* Le code de devise unifié pour la devise à emprunter ou à rembourser (ex. `"USDT"`)
- **amount** (Float) *requis* Le montant de la marge à emprunter ou à rembourser (ex. `20.92`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"rate": 0.002}`)

Retourne

- Une [structure de prêt sur marge](#margin-loan-structure)

### Structure de prêt sur marge

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

## Marge

*marge et contrat uniquement*

Remarque : dans ce manuel, nous utilisons le terme « garantie » qui désigne le solde de marge actuel, mais ne le confondez pas avec la « marge initiale » ou la « marge de maintenance » :
- `garantie (solde de marge actuel) = marge initiale + profit réalisé et non réalisé`.

Par exemple, si vous avez ouvert une position isolée avec une marge initiale de **50 $** et que la position présente un profit non réalisé de **-15 $**, alors la **garantie** de votre position sera de **35 $**. Cependant, si nous prenons en compte que l'exigence de marge de maintenance (pour maintenir la position ouverte) indiquée par la plateforme d'échange est de **25 $** pour cette position, alors votre garantie ne doit pas descendre en dessous, sinon la position sera liquidée.

Pour augmenter, réduire ou définir votre solde de marge (garantie) dans une position à effet de levier ouverte, utilisez respectivement `addMargin`, `reduceMargin` et `setMargin`. C'est un peu comme ajuster le montant de l'effet de levier que vous utilisez avec une position déjà ouverte.

Voici quelques scénarios d'utilisation de ces méthodes :
- si la transaction évolue contre vous, vous pouvez ajouter de la marge pour réduire le risque de liquidation
- si votre transaction se déroule bien, vous pouvez réduire le solde de marge de votre position et prendre des bénéfices

```javascript
addMargin (symbol, amount, params = {})
reduceMargin (symbol, amount, params = {})
setMargin (symbol, amount, params = {})
```


Paramètres

- **symbol** (String) *requis* Symbole de marché CCXT unifié (ex. `"BTC/USDT:USDT"`)
- **amount** (String) *requis* Montant de marge à ajouter ou à réduire (ex. `20`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"leverage": 5}`)

Retourne

- une [structure de marge](#margin-structure)

Vous pouvez récupérer l'historique des ajustements de marge effectués à l'aide des méthodes ci-dessus ou automatiquement par la plateforme d'échange en utilisant la méthode suivante

```javascript
fetchMarginAdjustmentHistory (symbol = undefined, type = undefined, since = undefined, limit = undefined, params = {})
```

Paramètres

- **symbol** (String) Symbole de marché CCXT unifié (ex. `"BTC/USDT:USDT"`)
- **type** (String) "add" ou "reduce"
- **since** (Integer) Horodatage (ms) du moment le plus ancien pour lequel récupérer les ajustements de marge (ex. `1646940314000`)
- **limit** (Integer) Le nombre de [structures de marge](#margin-structure) à récupérer (ex. `5`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"auto": true}`)

Retourne

- une [structure de marge](#margin-structure)

### Structure de marge

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

## Définir le mode de marge

*contrat uniquement*

Met à jour le type de marge utilisé pour être soit

- `cross` Un seul compte est utilisé pour partager la garantie entre les marchés. La marge est prélevée sur le solde total du compte pour éviter la liquidation si nécessaire.
- `isolated` Chaque marché conserve la garantie dans un compte séparé

```javascript
setMarginMode (marginMode, symbol = undefined, params = {})
```

Paramètres

- **marginMode** (String) *requis* le type de marge utilisé
    **Types de marge unifiés :**
    - `"cross"`
    - `"isolated"`
- **symbol** (String) Symbole de marché CCXT unifié (ex. `"BTC/USDT:USDT"`) *requis* sur la plupart des plateformes d'échange. Non requis lorsque le mode de marge n'est pas spécifique à un marché
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de la plateforme d'échange (ex. `{"leverage": 5}`)

Retourne

- réponse de la plateforme d'échange

### Plateformes d'échange sans setMarginMode

Raisons courantes pour lesquelles une plateforme d'échange pourrait ne pas avoir

```javascript
exchange.has['setMarginMode'] == false
```

inclure

- la plateforme d'échange ne propose pas de trading avec effet de levier
- la plateforme d'échange ne propose qu'un seul mode de marge `cross` ou `isolated`, mais ne propose pas les deux
- le mode de marge doit être défini à l'aide d'un paramètre spécifique à la plateforme d'échange dans `params` lors de l'utilisation de `createOrder`

### Remarques sur les erreurs supprimées pour setMarginMode

Certaines API de plateformes d'échange retournent une réponse d'erreur lorsqu'une demande est envoyée pour définir le mode de marge sur le mode déjà défini (ex. Envoyer une demande pour définir le mode de marge sur `cross` pour le marché `BTC/USDT:USDT` alors que le compte a déjà `BTC/USDT:USDT` configuré pour utiliser la marge croisée). CCXT ne considère pas cela comme une erreur car le résultat final est ce que l'utilisateur souhaitait, donc l'erreur est supprimée et le résultat d'erreur est retourné sous forme d'objet.

ex.

```javascript
{ code: -4046, msg: 'No need to change margin type.' }
```

### Remarques sur le paramètre marginMode

Certaines méthodes permettent l'utilisation d'un paramètre `marginMode` qui peut être défini sur `cross` ou `isolated`. Cela peut être utile pour spécifier le `marginMode` directement dans les paramètres des méthodes, pour une utilisation avec des marchés de marge au comptant ou de contrat. Pour spécifier un marché de marge au comptant, vous devez utiliser un symbole au comptant unifié ou définir le type de marché sur spot, tout en définissant le paramètre marginMode sur `cross` ou `isolated`.

Créer un ordre de marge au comptant :

*Utilisez un symbole au comptant unifié, tout en définissant le paramètre marginMode.*


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


## Récupérer le mode de marge

*marge et contrat uniquement*

La méthode `fetchMarginMode()` peut être utilisée pour obtenir le mode de marge défini pour un marché. La méthode `fetchMarginModes()` peut être utilisée pour obtenir le mode de marge défini pour plusieurs marchés à la fois.

Vous pouvez accéder au mode de marge défini en utilisant :

- `fetchMarginMode()` (symbole unique)
- `fetchMarginModes([symbol1, symbol2, ...])` (plusieurs symboles)
- `fetchMarginModes()` (tous les symboles de marché)

```javascript
fetchMarginMode(symbol, params = {})
```

Paramètres

- **symbol** (String) *requis* Un symbole CCXT unifié (ex. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange (ex. `{"subType": "linear"}`)

Retourne

- une [structure de mode de marge](#margin-mode-structure)

```javascript
fetchMarginModes(symbols = undefined, params = {})
```

Paramètres

- **symbols** (\[String\]) Une liste de symboles CCXT unifiés (ex. `[ "BTC/USDT:USDT" ]`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange (ex. `{"subType": "linear"}`)

Retourne

- un tableau de [structures de mode de marge](#margin-mode-structure)

### Structure du Mode de Marge

```javascript
{
    "info": { ... }             // response from the exchange
    "symbol": "BTC/USDT:USDT",  // unified market symbol
    "marginMode": "cross",      // the margin mode either cross or isolated
}
```

## Définir le Levier

*marge et contrat uniquement*

```javascript
setLeverage (leverage, symbol = undefined, params = {})
```

Paramètres

- **leverage** (Integer) *requis* Le levier souhaité
- **symbol** (String) Symbole de marché CCXT unifié (ex. `"BTC/USDT:USDT"`) *requis* sur la plupart des exchanges. N'est pas requis lorsque le levier n'est pas spécifique à un marché (ex. si le levier est défini pour le compte et non par marché)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange (ex. `{"marginMode": "cross"}`)

Retourne

- réponse de l'exchange

## Levier

*marge et contrat uniquement*

La méthode `fetchLeverage()` peut être utilisée pour obtenir le levier défini pour un marché. La méthode `fetchLeverages()` peut être utilisée pour obtenir le levier défini pour plusieurs marchés à la fois.

Vous pouvez accéder au levier défini en utilisant :

- `fetchLeverage()` (symbole unique)
- `fetchLeverages([symbol1, symbol2, ...])` (plusieurs symboles)
- `fetchLeverages()` (tous les symboles de marché)

```javascript
fetchLeverage(symbol, params = {})
```

Paramètres

- **symbol** (String) *requis* Un symbole CCXT unifié (ex. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange (ex. `{"marginMode": "cross"}`)

Retourne

- une [structure de levier](#leverage-structure)

```javascript
fetchLeverages(symbols = undefined, params = {})
```

Paramètres

- **symbols** (\[String\]) Une liste de symboles CCXT unifiés (ex. `[ "BTC/USDT:USDT" ]`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange (ex. `{"marginMode": "cross"}`)

Retourne

- un tableau de [structures de levier](#leverage-structure)

### Structure du Levier

```javascript
{
    "info": { ... }             // response from the exchange
    "symbol": "BTC/USDT:USDT",  // unified market symbol
    "marginMode": "cross",      // the margin mode either cross or isolated
    "longLeverage": 100,        // the set leverage for a long position
    "shortLeverage": 75,        // the set leverage for a short position
}
```

## Trading de Contrats

Cela peut inclure des contrats à terme avec une date d'expiration fixe, des swaps perpétuels avec des paiements de financement, ainsi que des contrats à terme inversés ou des swaps inversés.
Les informations sur les positions peuvent provenir de différents points de terminaison selon l'exchange.
Dans le cas où plusieurs points de terminaison servent différents types de dérivés, CCXT chargera par défaut uniquement les contrats « linéaires » (par opposition aux contrats « inversés ») ou les contrats « swap » (par opposition aux contrats « future »).

### Positions

*contrat uniquement*

Pour obtenir des informations sur les positions actuellement détenues sur les marchés à contrats, utilisez

- fetchPosition ()            // pour un marché unique
- fetchPositions ()           // pour toutes les positions
- fetchAccountPositions ()    // TODO
- fetchPositionHistory ()     // pour une position historique unique
- fetchPositionsHistory ()     // pour les positions historiques

```javascript
fetchPosition (symbol, params = {})                         // for a single market
```

Paramètres

- **symbol** (String) *requis* Symbole de marché CCXT unifié (ex. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange (ex. `{"endTime": 1645807945000}`)

Retourne

- Une [structure de position](#position-structure)

```javascript
fetchPositions (symbols = undefined, params = {})
fetchAccountPositions (symbols = undefined, params = {})
```

Paramètres

- **symbols** (\[String\]) Symboles de marché CCXT unifiés, ne pas définir pour récupérer toutes les positions (ex. `["BTC/USDT:USDT"]`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange (ex. `{"endTime": 1645807945000}`)

Retourne

- Un tableau de [structures de position](#position-structure)

```javascript
fetchPositionHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

Paramètres

- **symbol** (\[String\]) Symboles de marché CCXT unifiés, ne pas définir pour récupérer toutes les positions (ex. `["BTC/USDT:USDT"]`)
- **since** (Integer) Horodatage (ms) de la date la plus ancienne pour laquelle récupérer les positions (ex. `1646940314000`)
- **limit** (Integer) Le nombre de [structures de position](#position-structure) à récupérer (ex. `5`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange (ex. `{"endTime": 1645807945000}`)

Retourne

- Un tableau de [structures de position](#position-structure)

#### Structure de Position

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
Les positions vous permettent d'emprunter de l'argent à un exchange pour prendre une position longue ou courte sur un marché. Certains exchanges exigent que vous payiez des frais de financement pour maintenir la position ouverte.

Lorsque vous prenez une position longue, vous pariez que le prix sera plus élevé à l'avenir et que le prix ne sera jamais inférieur au `liquidationPrice`.

À mesure que le prix de l'indice sous-jacent change, le unrealisedPnl change également et, par conséquent, la quantité de garantie qu'il vous reste dans la position (puisque vous ne pouvez la clôturer qu'au prix du marché ou moins). À un certain prix, il ne vous restera plus aucune garantie, c'est ce qu'on appelle le prix « bust » ou « zéro ». Au-delà de ce point, si le prix évolue suffisamment dans la direction opposée, la garantie de la position tombera en dessous de la `maintenanceMargin`. La maintenanceMargin sert de tampon de sécurité entre votre position et une garantie négative, un scénario dans lequel l'exchange subit des pertes en votre nom. Pour se protéger, l'exchange liquidera rapidement votre position si cela se produit. Même si le prix remonte au-dessus du liquidationPrice, vous ne récupérerez pas votre argent car l'exchange a vendu tous les `contracts` que vous avez achetés au prix du marché. En d'autres termes, la maintenanceMargin est un frais caché pour emprunter de l'argent.

Il est recommandé d'utiliser la `maintenanceMargin` et la `initialMargin` plutôt que la `maintenanceMarginPercentage` et la `initialMarginPercentage`, car elles tendent à être plus précises. La maintenanceMargin peut être calculée à partir d'autres facteurs en dehors de la maintenanceMarginPercentage, notamment le taux de financement et les frais de preneur, par exemple sur [kucoin](https://futures.kucoin.com/contract/detail).

Un contrat inversé vous permet de prendre une position longue ou courte sur BTC/USD en utilisant du BTC comme garantie. Notre API pour les contrats inversés est la même que pour les contrats linéaires. Les montants dans un contrat inversé sont cotés comme s'ils étaient négociés en USD/BTC, mais le prix est toujours coté en termes de BTC/USD. La formule du profit et de la perte d'un contrat inversé est `(1/markPrice - 1/price) * contracts`. Le profit, la perte et la garantie seront désormais cotés en BTC, et le nombre de contrats est coté en USD.

#### Clôture des Positions

*contrat uniquement*

Pour clôturer rapidement des positions ouvertes avec un ordre au marché, utilisez

- closePosition (symbol)               // pour un marché unique
- closeAllPositions (symbol)           // pour toutes les positions

```typescript
closePosition (symbol: string, side: OrderSide = undefined, params = {}): Promise<Order>
```

Paramètres

- **symbol** (String) *requis* Symbole de marché CCXT unifié (ex. `"BTC/USDT:USDT"`)
- **side** *optionnel* un littéral de chaîne indiquant la direction de votre ordre. Certains exchanges l'exigent.
  **Côtés unifiés :**
  - `buy` donner la devise de cotation et recevoir la devise de base ; par exemple, acheter `BTC/USD` signifie que vous recevrez des bitcoins en échange de vos dollars.
  - `sell` donner la devise de base et recevoir la devise de cotation ; par exemple, vendre `BTC/USD` signifie que vous recevrez des dollars en échange de vos bitcoins.
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange (ex. `{"endTime": 1645807945000}`)

Retourne

- Une [structure d'ordre](#order-structure)

```typescript
closeAllPositions (params = {}): Promise<Position[]>
```

Paramètres
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange (ex. `{"endTime": 1645807945000}`)

Retourne

- Une liste de [structures d'ordre](#order-structure)


### Mode de Position

*marge et contrat uniquement*

Méthode utilisée pour définir le mode de position :

```javascript
setPositionMode (hedged, symbol = undefined, params = {})
```

Paramètres

- **hedged** (String) *requis* valeur du mode couvert :
    - `true` - définit le mode **couvert** (hedged)
    - `false` - définit le mode **unidirectionnel** (one-way)
- **symbol** (String) Symbole de marché CCXT unifié (ex. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange

Méthode utilisée pour récupérer le mode de position :

```javascript
fetchPositionMode (symbol = undefined, params = {}) {
```

Paramètres

- **symbol** (String) Symbole de marché CCXT unifié (ex. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange

Retourne

```javascript
{
    'info': { ... },
    'hedged': true,
}
```


#### Prix de Liquidation

C'est le prix auquel `initialMargin + unrealized = collateral = maintenanceMargin`. Le prix a évolué dans la direction opposée à votre position au point où il ne reste plus que la garantie de maintenanceMargin, et si le prix continue dans cette direction, la position aura une garantie négative.

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

### Historique de Financement

*contrat uniquement*

Les contrats de swap perpétuel (également appelés contrats à terme perpétuels) maintiennent un prix de marché qui reflète le prix de l'actif sur lequel ils sont basés, car des frais de financement sont échangés entre les traders qui détiennent des positions sur les marchés de swap perpétuel.

Si le contrat est négocié à un prix supérieur au prix de l'actif qu'il représente, alors les traders en positions longues paient des frais de financement aux traders en positions courtes à des moments précis de la journée, ce qui encourage davantage de traders à prendre des positions courtes avant ces moments.

Si le contrat est négocié à un prix inférieur au prix de l'actif qu'il représente, alors les traders en positions courtes paient des frais de financement aux traders en positions longues à des moments précis de la journée, ce qui encourage davantage de traders à prendre des positions longues avant ces moments.

Ces frais sont généralement échangés entre traders sans commission versée à l'exchange.

La méthode `fetchFundingHistory` peut être utilisée pour récupérer l'historique des frais de financement payés ou reçus par un compte.

```javascript
fetchFundingHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

Paramètres

- **symbol** (String) Symbole de marché CCXT unifié (ex. `"BTC/USDT:USDT"`)
- **since** (Integer) Horodatage (ms) de la date la plus ancienne pour laquelle récupérer l'historique de financement (ex. `1646940314000`)
- **limit** (Integer) Le nombre de [structures d'historique de financement](#funding-history-structure) à récupérer (ex. `5`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange (ex. `{"endTime": 1645807945000}`)

Retourne

- Un tableau de [structures d'historique de financement](#funding-history-structure)

#### Structure de l'Historique de Financement

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


### Conversion

La méthode `fetchConvertQuote` peut être utilisée pour récupérer un devis pouvant être utilisé pour un échange de conversion.
Le devis doit généralement être utilisé dans un délai précis spécifié par l'exchange pour que l'échange de conversion s'exécute avec succès.

```javascript
fetchConvertQuote (fromCode, toCode, amount = undefined, params = {})
```

Paramètres

- **fromCode** (String) *requis* Le code de devise CCXT unifié de la devise à convertir (ex. `"USDT"`)
- **toCode** (String) *requis* Le code de devise CCXT unifié de la devise dans laquelle convertir (ex. `"USDC"`)
- **amount** (Float) Montant à convertir en unités de la devise source (ex. `20.0`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange (ex. `{"toAmount": 2.9722}`)

Retourne

- Une [structure de conversion](#conversion-structure)

La méthode `createConvertTrade` peut être utilisée pour créer un ordre d'échange de conversion en utilisant l'identifiant récupéré via fetchConvertQuote.
Le devis doit généralement être utilisé dans un délai précis spécifié par l'exchange pour que l'échange de conversion s'exécute avec succès.

```javascript
createConvertTrade (id, fromCode, toCode, amount = undefined, params = {})
```

Paramètres

- **id** (String) *requis* Identifiant du devis de conversion (ex. `1645807945000`)
- **fromCode** (String) *requis* Le code de devise CCXT unifié de la devise à convertir (ex. `"USDT"`)
- **toCode** (String) *requis* Le code de devise CCXT unifié de la devise dans laquelle convertir (ex. `"USDC"`)
- **amount** (Float) Montant à convertir en unités de la devise source (ex. `20.0`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange (ex. `{"toAmount": 2.9722}`)

Retourne

- Une [structure de conversion](#conversion-structure)

La méthode `fetchConvertTrade` peut être utilisée pour récupérer un échange de conversion spécifique à l'aide de l'identifiant de l'échange.

```javascript
fetchConvertTrade (id, code = undefined, params = {})
```

Paramètres

- **id** (String) *obligatoire* Identifiant de l'échange de conversion (ex. `"80794187SDHJ25"`)
- **code** (String) Le code de devise unifié de l'échange de conversion (ex. `"USDT"`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange (ex. `{"toAmount": 2.9722}`)

Retourne

- Une [structure de conversion](#conversion-structure)

La méthode `fetchConvertTradeHistory` peut être utilisée pour récupérer l'historique des conversions pour un code de devise spécifié.

```javascript
fetchConvertTradeHistory (code = undefined, since = undefined, limit = undefined, params = {})
```

Paramètres

- **code** (String) Le code de devise unifié pour lequel récupérer l'historique des échanges de conversion (ex. `"USDT"`)
- **since** (Integer) Horodatage de la conversion la plus ancienne (ex. `1645807945000`)
- **limit** (Integer) Le nombre maximum de structures de conversion à récupérer (ex. `10`)
- **params** (Dictionary) Paramètres spécifiques au point de terminaison de l'API de l'exchange (ex. `{"toAmount": 2.9722}`)

Retourne

- Un tableau de [structures de conversion](#conversion-structure)

#### Structure de Conversion

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

*contrats uniquement*

Utilisez les méthodes `fetchPositionADLRank` ou `fetchPositionsADLRank` pour obtenir les détails privés du rang d'auto de levier d'une position depuis l'exchange.

```javascript
fetchPositionADLRank (symbol, params = {})
```

Paramètres

- **symbol** (String) Symbole de marché CCXT unifié (ex. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Paramètres supplémentaires spécifiques au point de terminaison de l'API de l'exchange (ex. `{"category": "futures"}`)

Retourne

- Une [structure d'auto de levier](#auto-de-leverage)

```javascript
fetchPositionsADLRank (symbols, params = {})
```

Paramètres

- **symbols** (\[String\]) Une liste de symboles CCXT unifiés (ex. `[ "BTC/USDT:USDT" ]`)
- **params** (Dictionary) Paramètres supplémentaires spécifiques au point de terminaison de l'API de l'exchange (ex. `{"category": "futures"}`)

Retourne

- Une liste de [structures d'auto de levier](#auto-de-leverage)

### Structure d'Auto De Leverage

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

Dans certains cas spécifiques, vous pourriez avoir besoin d'un proxy, lorsque :
- L'exchange n'est pas disponible dans votre région
- Votre adresse IP est bloquée par l'exchange
- Vous subissez des restrictions aléatoires de la part de l'exchange, comme la [protection DDoS par Cloudflare](#ddos-protection-by-cloudflare-incapsula)

Cependant, sachez que chaque intermédiaire supplémentaire peut ajouter de la latence aux requêtes.

**Note pour les utilisateurs de Go :** Après avoir défini une propriété de proxy, vous devez appeler `UpdateProxySettings()` pour appliquer les modifications :
```go
exchange := ccxt.NewBinance(nil)
exchange.ProxyUrl = "http://your-proxy-url:8080"
exchange.UpdateProxySettings()  // Required in Go to apply proxy settings
```
Sachez cependant que chaque intermédiaire supplémentaire peut ajouter de la latence aux requêtes.

### Types de proxy pris en charge
CCXT prend en charge les types de proxy suivants (notez que chacun d'eux dispose également d'une [prise en charge des callbacks](#using-proxy-callbacks)) :

#### proxyUrl

Cette propriété ajoute une URL en préfixe aux requêtes API. Elle peut être utile pour une simple redirection ou pour [contourner la restriction CORS du navigateur](#cors-access-control-allow-origin).
```
ex = ccxt.binance();
ex.proxyUrl = 'YOUR_PROXY_URL';
```
tandis que 'YOUR_PROXY_URL' pourrait être (utilisez le slash en conséquence) :
- `https://cors-anywhere.herokuapp.com/`
- `http://127.0.0.1:8080/`
- `http://your-website.com/sample-script.php?url=`
- etc

Ainsi, les requêtes seront envoyées vers, par exemple, `https://cors-anywhere.herokuapp.com/https://exchange.xyz/api/endpoint`. (Vous pouvez également avoir un petit script proxy s'exécutant sur votre appareil/serveur web pour l'utiliser dans `.proxyUrl` - "sample-local-proxy-server" dans le [dossier examples](https://github.com/ccxt/ccxt/tree/master/examples)). Pour personnaliser l'URL cible, vous pouvez également surcharger la méthode `urlEncoderForProxyUrl` de l'instance.

Cette approche fonctionne **uniquement pour les requêtes REST**, mais pas pour les connexions WebSocket. ((_Comment tester si votre proxy fonctionne_))[#test-if-your-proxy-works]

#### httpProxy et httpsProxy
Pour définir un vrai proxy http(s) pour vos scripts, vous devez avoir accès à un [proxy http ou https](https://stackoverflow.com/q/10440690/2377343) distant, afin que les appels soient effectués directement vers l'exchange cible, acheminés à travers votre serveur proxy :
```
ex.httpProxy = 'http://1.2.3.4:8080/';
// or
ex.httpsProxy = 'http://1.2.3.4:8080/';
```
Cette approche n'affecte que les requêtes **non-WebSocket** de ccxt. Pour router les connexions WebSocket de CCXT via un proxy, vous devez définir spécifiquement la propriété `wsProxy` (ou `wssProxy`), en plus de `httpProxy` (ou `httpsProxy`), donc votre script devrait ressembler à :
```
ex.httpProxy = 'http://1.2.3.4:8080/';
ex.wsProxy   = 'http://1.2.3.4:8080/';
```
Ainsi, les deux connexions (HTTP & WS) passeront par des proxies.
((_Comment tester si votre proxy fonctionne_))[#test-if-your-proxy-works]


#### socksProxy
Vous pouvez également utiliser un [proxy socks](https://www.google.com/search?q=what+is+socks+proxy) avec le format suivant :
```
// from protocols: socks, socks5, socks5h
ex.socksProxy = 'socks5://1.2.3.4:8080/';
ex.wsSocksProxy = 'socks://1.2.3.4:8080/';
```
((_Comment tester si votre proxy fonctionne_))[#test-if-your-proxy-works]

#### Tester si votre proxy fonctionne
Après avoir défini l'une des propriétés de proxy listées ci-dessus dans votre extrait ccxt, vous pouvez tester si cela fonctionne en effectuant un ping vers des sites web qui renvoient votre IP - consultez un fichier "proxy-usage" dans le dossier [examples](https://github.com/ccxt/ccxt/blob/master/examples/).

#### utilisation des callbacks de proxy
**Au lieu de définir une propriété, vous pouvez également utiliser les callbacks `proxyUrlCallback, http(s)ProxyCallback, socksProxyCallback` :
```
myEx.proxyUrlCallback = function (url, method, headers, body) { ... return 'http://1.2.3.4/'; }
```

### détails supplémentaires liés au proxy

#### userAgent

Si vous avez besoin de cas spéciaux, vous pouvez surcharger la propriété `userAgent` comme suit :
```
exchange.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'
```

#### agents proxy personnalisés

Selon votre langage de programmation, vous pouvez définir des agents proxy personnalisés.
 - Pour JS, voir [cet exemple](
https://github.com/ccxt/ccxt/blob/master/examples/js/custom-proxy-agent-for-js.js)
 - Pour Python, voir les exemples suivants : [proxies-for-synchronous-python](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxies-for-synchronous-python.py), [proxy-asyncio-aiohttp-python-3](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxy-asyncio-aiohttp-python-3.py), [proxy-asyncio-aiohttp-socks](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxy-asyncio-aiohttp-socks.py), [proxy-sync-python-requests-2-and-3](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxy-sync-python-requests-2-and-3.py)

#### CORS (Access-Control-Allow-Origin)

Le CORS (connu sous le nom de [partage de ressources entre origines croisées](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)) affecte principalement les navigateurs et est la cause du fameux avertissement `No 'Access-Control-Allow-Origin' header is present on the requested resource`. Cela se produit lorsqu'un script (s'exécutant dans un navigateur) envoie une requête vers un domaine tiers (par défaut, de telles requêtes sont bloquées, à moins que le domaine cible ne l'autorise explicitement).
Ainsi, dans de tels cas, vous devrez communiquer avec un proxy "CORS", qui redirigera les requêtes (par opposition aux requêtes directes côté navigateur) vers l'exchange cible. Pour définir un proxy CORS, vous pouvez exécuter l'exemple [sample-local-proxy-server-with-cors](https://github.com/ccxt/ccxt/blob/master/examples/) et dans ccxt définir la propriété [`.proxyUrl`](#proxyurl) pour router les requêtes à travers le serveur cors/proxy.

## Mathématiques par Chaînes de Caractères

Certains utilisateurs pourraient vouloir contrôler la façon dont CCXT gère les opérations arithmétiques. Même s'il utilise des types numériques par défaut, les utilisateurs peuvent passer aux mathématiques à virgule fixe en utilisant des types de chaînes de caractères. Cela peut être fait en :


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


# Gestion des Erreurs

- [Mécanisme de Réessai](#retry-mechanism)
- [Hiérarchie des Exceptions](#exception-hierarchy)
- [ExchangeError](#exchangeerror)
- [OperationFailed](#operationfailed)
- [DDoSProtection](#ddosprotection)
- [RateLimitExceeded](#ratelimitexceeded)
- [RequestTimeout](#requesttimeout)
- [RequestTimeout](#requesttimeout)
- [ExchangeNotAvailable](#exchangenotavailable)
- [InvalidNonce](#invalidnonce)

La gestion des erreurs avec CCXT est effectuée grâce au mécanisme d'exceptions disponible nativement dans tous les langages.

Pour gérer les erreurs, vous devez ajouter un bloc `try` autour de l'appel à une méthode unifiée et intercepter les exceptions comme vous le feriez normalement dans votre langage :

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

Pour les pipelines asynchrones (`fetchTickerAsync`, etc.), `CompletableFuture` enveloppe les erreurs levées dans `CompletionException`. Utilisez `Helpers.unwrap()` à l'intérieur de `.exceptionally(...)` pour retirer l'enveloppe et faire correspondre l'erreur ccxt sous-jacente :

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


## Mécanisme de Réessai
Lors du traitement des requêtes HTTP, il est important de comprendre que les requêtes peuvent échouer pour diverses raisons. Les causes courantes de ces échecs incluent l'indisponibilité du serveur, l'instabilité du réseau ou des problèmes temporaires du serveur. Pour gérer ces scénarios de manière élégante, CCXT propose une option pour réessayer automatiquement les requêtes échouées. Vous pouvez définir la valeur de `maxRetriesOnFailure` et `maxRetriesOnFailureDelay` pour configurer le nombre de réessais et le délai entre les réessais, exemple :

```python
exchange.options['maxRetriesOnFailure'] = 3 # if we get an error like the ones mentioned above we will retry up to three times per request
exchange.options['maxRetriesOnFailureDelay'] = 1000 # we will wait 1000ms (1s) between retries
```

Il est important de souligner que seuls les problèmes liés au serveur/réseau feront partie du mécanisme de réessai ; si l'utilisateur obtient une erreur due à `InsufficientFunds` ou `InvalidOrder`, la requête ne sera pas répétée.

## Hiérarchie des Exceptions

Toutes les exceptions dérivent de l'exception de base BaseError, qui, à son tour, est définie dans la bibliothèque ccxt comme suit :


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


La hiérarchie d'héritage des exceptions se trouve dans ce fichier : https://github.com/ccxt/ccxt/blob/master/ts/src/base/errorHierarchy.ts , et visuellement peut être représentée comme illustré ci-dessous :

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

La classe `BaseError` est une classe d'erreur racine générique pour toutes sortes d'erreurs, incluant l'accessibilité et les incompatibilités requête/réponse. Si vous n'avez pas besoin d'intercepter une sous-classe spécifique d'exceptions, vous pouvez simplement utiliser `BaseError`, où tous les types d'exceptions sont capturés.

De `BaseError` dérivent deux familles d'erreurs différentes : `OperationFailed` et `ExchangeError` (elles ont également leurs sous-types spécifiques, comme expliqué ci-dessous).

### OperationFailed


Une `OperationFailed` peut se produire lorsque l'utilisateur envoie une **requête correctement construite et valide** à l'exchange, mais qu'un problème non déterministe s'est produit :
- maintenance en cours
- problèmes de connectivité internet/réseau
- protections DDoS
- "Serveur occupé, réessayez"...

De telles exceptions sont temporaires et réessayer la requête pourrait suffire. Cependant, si l'erreur persiste, cela peut indiquer un problème persistant avec l'exchange ou votre connexion.

`OperationFailed` possède les sous-types suivants : `RequestTimeout`, `DDoSProtection` (inclut le sous-type `RateLimitExceeded`), `ExchangeNotAvailable`, `InvalidNonce`.


#### DDoSProtection

Cette exception est levée dans les cas où des services cloud/d'hébergement (Cloudflare, Incapsula, etc.) limitent les requêtes d'un utilisateur/région/emplacement ou lorsque l'API de l'exchange restreint l'utilisateur en raison de requêtes anormales. Cette exception contient également un sous-type d'exception spécifique `RateLimitExceeded`, qui signifie directement que l'utilisateur effectue des requêtes bien plus fréquentes que ce qui est toléré par le moteur de l'API de l'exchange.

#### RequestTimeout

Cette exception est levée lorsque la connexion avec l'exchange échoue ou que les données ne sont pas entièrement reçues dans un délai spécifié. Ceci est contrôlé par la propriété `.timeout` de l'exchange. Lorsqu'une `RequestTimeout` est levée, l'utilisateur ne connaît pas le résultat d'une requête (si elle a été acceptée par le serveur de l'exchange ou non).

Il est donc conseillé de gérer ce type d'exception de la manière suivante :

- pour les requêtes de récupération, il est sûr de réessayer l'appel
- pour une requête à `cancelOrder()`, l'utilisateur doit réessayer le même appel une deuxième fois. Un nouveau réessai à `cancelOrder()` retournera l'un des résultats possibles suivants :
  - une requête est complétée avec succès, ce qui signifie que l'ordre a maintenant été correctement annulé
  - une exception `OrderNotFound` est levée, ce qui signifie que l'ordre a soit déjà été annulé lors de la première tentative, soit a été exécuté (rempli et clôturé) entre les deux tentatives.
- si une requête à `createOrder()` échoue avec une `RequestTimeout`, l'utilisateur doit :
  - appeler `fetchOrders()`, `fetchOpenOrders()`, `fetchClosedOrders()` pour vérifier si la requête de passage de l'ordre a réussi et si l'ordre est maintenant ouvert
  - si l'ordre n'est pas `'open'`, l'utilisateur doit appeler `fetchBalance()` pour vérifier si le solde a changé depuis que l'ordre a été créé lors de la première exécution et qu'il a ensuite été rempli et clôturé au moment de la deuxième vérification.

#### ExchangeNotAvailable

Ce type d'exception est levé lorsque la plateforme d'échange sous-jacente est inaccessible. La bibliothèque ccxt lève également cette erreur si elle détecte l'un des mots-clés suivants dans la réponse :

  - `offline`
  - `unavailable`
  - `busy`
  - `retry`
  - `wait`
  - `maintain`
  - `maintenance`
  - `maintenancing`

#### InvalidNonce

Levée lorsque votre nonce est inférieur au nonce précédemment utilisé avec votre paire de clés, comme décrit dans la section [Authentification](#authentication). Ce type d'exception est levé dans les cas suivants (par ordre de priorité lors de la vérification) :

  - Vous ne limitez pas le débit de vos requêtes ou vous en envoyez trop souvent.
  - Vos clés API ne sont pas fraîches et nouvelles (elles ont déjà été utilisées avec un autre logiciel ou script — créez toujours une nouvelle paire de clés lorsque vous ajoutez telle ou telle plateforme d'échange).
  - La même paire de clés est partagée entre plusieurs instances de la classe d'échange (par exemple, dans un environnement multithread ou dans des processus séparés).
  - L'horloge de votre système n'est pas synchronisée. L'heure système doit être synchronisée avec UTC dans un fuseau horaire sans heure d'été, au moins toutes les dix minutes, voire plus fréquemment en raison de la dérive de l'horloge. **Activer la synchronisation de l'heure dans Windows est généralement insuffisant !** Vous devez le configurer via le Registre du système d'exploitation (cherchez *"time synch frequency"* pour votre OS).


### ExchangeError

Contrairement à `OperationFailed`, l'`ExchangeError` survient principalement lorsque la requête est impossible à réussir (pour les raisons listées ci-dessous), de sorte que même si vous répétez la même requête des centaines de fois, elle échouera toujours, car la requête est formulée de manière incorrecte.

Raisons possibles de cette exception :

  - le point de terminaison est désactivé par la plateforme d'échange
  - le symbole est introuvable sur la plateforme d'échange
  - un paramètre requis est manquant
  - le format des paramètres est incorrect
  - un problème côté utilisateur qui doit être corrigé

`ExchangeError` possède les sous-types d'exceptions suivants :

  - `NotSupported` : lorsque le point de terminaison/l'opération n'est pas proposé ou pris en charge par l'API de la plateforme d'échange.
  - `BadRequest` : l'utilisateur envoie une requête/un paramètre/une action **incorrectement** construite, invalide ou non autorisée (ex. : « nombre invalide », « symbole interdit », « taille hors limites min/max », « précision incorrecte », etc.). Réessayer n'aiderait pas dans ce cas ; la requête doit d'abord être corrigée/ajustée.
  - `OperationRejected` - l'utilisateur envoie une requête **correctement** construite (qui devrait normalement être acceptée par la plateforme d'échange), mais un facteur déterministe empêche votre requête d'aboutir. Par exemple, l'état actuel de votre compte pourrait ne pas le permettre (ex. : « veuillez clôturer les positions existantes avant de modifier le levier », « trop d'ordres en attente », « votre compte est dans un mauvais mode de position/marge ») ou, à ce moment précis, le symbole n'est pas négociable (ex. : « MarketClosed »), ou encore des facteurs expliqués nécessitant une action spécifique (ex. : modifier un paramètre au préalable ou attendre un moment précis). Ainsi, pour rappel : [**OperationFailed**](#operationfailed) peut être réessayé aveuglément et devrait réussir, tandis que `OperationRejected` est un échec qui dépend de facteurs précis à prendre en compte avant de pouvoir réessayer la requête.
  - `AuthenticationError` : lorsqu'une plateforme d'échange exige l'un des identifiants API que vous avez omis de spécifier, ou lorsqu'il y a une erreur dans la paire de clés ou un nonce périmé. La plupart du temps, vous avez besoin de `apiKey` et `secret` ; parfois aussi de `uid` et/ou `password` si l'API de la plateforme l'exige.
  - `PermissionDenied` : lorsqu'il n'y a pas d'accès pour l'action spécifiée ou que les permissions de l'`apiKey` spécifiée sont insuffisantes.
  - `InsufficientFunds` : lorsque vous ne disposez pas de suffisamment de devise sur le solde de votre compte pour passer un ordre.
  - `InvalidAddress` : lors de la rencontre d'une adresse de financement incorrecte ou d'une adresse de financement plus courte que `.minFundingAddressLength` (10 caractères par défaut) lors d'un appel à `fetchDepositAddress`, `createDepositAddress` ou `withdraw`.
  - `InvalidOrder` : la classe de base pour toutes les exceptions liées à l'API d'ordres unifiée.
  - `OrderNotFound` : lorsque vous essayez de récupérer ou d'annuler un ordre inexistant.

### Gestion des erreurs d'horodatage

Les utilisateurs peuvent parfois rencontrer des erreurs telles que :

> « L'horodatage de cette requête est en dehors de la recvWindow. »
> « Requête invalide, veuillez vérifier l'horodatage de votre serveur ou le paramètre recv_window. »
> « L'horodatage de cette requête était en avance de 1000ms sur l'heure du serveur. »

Ces problèmes peuvent survenir pour plusieurs raisons :

#### 1. Désynchronisation de l'horloge système
L'horloge système de votre appareil peut ne pas être correctement synchronisée avec les standards de temps mondiaux, entraînant des écarts d'horodatage.
Pour résoudre ce problème, assurez-vous que l'horloge de votre système est précise à la milliseconde près. Il ne doit pas s'agir d'un ajustement ponctuel — configurez votre système d'exploitation pour synchroniser l'heure périodiquement (par exemple, toutes les heures) afin de maintenir la précision.

#### 2. Latence réseau ou requêtes retardées
Si l'horloge de votre appareil est correctement synchronisée, mais que des délais réseau font que les requêtes prennent plus de temps que la fenêtre acceptée par la plateforme d'échange (généralement environ `5` secondes, bien que cela varie selon la plateforme), votre requête peut être rejetée.


Si le problème persiste, vous pouvez comparer votre horodatage local avec l'heure du serveur de la plateforme d'échange pour diagnostiquer les écarts :

```
for i in range(0, 20):
    local_time = exchange.milliseconds()
    exchange_time = await exchange.fetch_time()
    print(exchange_time - local_time)
```

####  Ajustement des options de la plateforme d'échange

Si vous continuez à rencontrer des erreurs d'horodatage après avoir vérifié la synchronisation, vous pouvez modifier certaines options de la plateforme d'échange pour atténuer le problème.

A) `exchange.options['adjustForTimeDifference'] = True`
ou augmenter la fenêtre à, par exemple, 10 secondes (uniquement si une plateforme d'échange le prend en charge ; recherchez ce mot-clé dans le [fichier d'échange](https://github.com/ccxt/ccxt/tree/master/ts/src) cible) :
B) `exchange.options['recvWindow'] = 10000`


Pour des étapes de dépannage supplémentaires, des discussions communautaires et des problèmes connexes d'horodatage/`recvWindow`, référez-vous aux fils GitHub suivants :

- [CCXT Issue #773](https://github.com/ccxt/ccxt/issues/773)
- [CCXT Issue #850](https://github.com/ccxt/ccxt/issues/850)
- [CCXT Issue #936](https://github.com/ccxt/ccxt/issues/936)

# Dépannage

Si vous rencontrez des difficultés à vous connecter à une plateforme d'échange particulière, procédez dans l'ordre de priorité suivant :

- Assurez-vous de disposer de la version la plus récente de ccxt.
  Ne faites jamais confiance à votre gestionnaire de paquets (que ce soit `npm`, `pip` ou `composer`) ; vérifiez toujours votre **numéro de version d'exécution réel** en exécutant ce code dans votre environnement :
  ```javascript
  console.log (ccxt.version) // JavaScript
  ```
  ```python
  print('CCXT version:', ccxt.__version__)  # Python
  ```
  ```php
  echo "CCXT v." . \ccxt\Exchange::VERSION . "\n"; // PHP
  ```
- Consultez les [Issues](https://github.com/ccxt/ccxt/issues) ou les [Annonces](#announcements) pour les mises à jour récentes.
- Assurez-vous de ne pas avoir désactivé le [limiteur de débit avec `enableRateLimit: false`](#rate-limit) (si quelqu'un a une solution de limitation de débit personnalisée, vérifiez qu'elle ne se comporte pas mal).
- Si vous utilisez la fonctionnalité proxy de ccxt, assurez-vous qu'elle ne se comporte pas mal.
- Activez `verbose = true` pour obtenir plus de détails !
  ```
  exchange = ccxt.binance()
  exchange.load_markets()
  exchange.verbose = True  # for less noise, you can set that after `load_markets`, but if the error happens during `load_markets` then place this line before it
  # ... your codes here ...
  ```
  Votre [code pour reproduire le problème + la sortie verbose est requis](/docs/faq#what-is-required-to-get-help) pour obtenir de l'aide.
- Les utilisateurs de Python peuvent activer le niveau de journalisation DEBUG avec le logger standard Python en ajoutant ces deux lignes au début de leur code :
  ```python
  import logging
  logging.basicConfig(level=logging.DEBUG)
  ```
- Utilisez le mode verbose pour vous assurer que les identifiants API utilisés correspondent aux clés que vous souhaitez utiliser. Assurez-vous qu'il n'y a pas de confusion entre les paires de clés.
- **Essayez une nouvelle paire de clés fraîche si possible.**
- Lisez les réponses aux questions fréquemment posées : /docs/faq
- Vérifiez les permissions de la paire de clés sur le site web de la plateforme d'échange !
- Vérifiez votre nonce. Si vous avez utilisé vos clés API avec d'autres logiciels, vous devriez probablement [remplacer votre fonction nonce](#overriding-the-nonce) pour correspondre à votre valeur de nonce précédente. Un nonce peut généralement être facilement réinitialisé en générant une nouvelle paire de clés inutilisée. Si vous obtenez des erreurs de nonce avec une clé existante, essayez avec une nouvelle clé API qui n'a pas encore été utilisée.
- Vérifiez votre débit de requêtes si vous obtenez des erreurs de nonce. Vos requêtes privées ne doivent pas se succéder rapidement. Vous ne devez pas les envoyer l'une après l'autre en une fraction de seconde ou en très peu de temps. La plateforme d'échange vous bannira très probablement si vous n'introduisez pas un délai avant chaque nouvelle requête. En d'autres termes, vous ne devez pas atteindre leur limite de débit en envoyant des requêtes privées illimitées trop fréquemment. Ajoutez un délai entre vos requêtes successives ou activez le limiteur de débit intégré, comme illustré dans les [exemples](https://github.com/ccxt/ccxt/tree/master/examples) de sondage long, ainsi que [ici](#order-book--market-depth).
- Lisez la [documentation de votre plateforme d'échange](/docs/exchange-markets) et comparez votre sortie verbose à la documentation.
- Vérifiez votre connectivité avec la plateforme d'échange en y accédant via votre navigateur.
- Vérifiez votre connexion avec la plateforme d'échange via un [proxy](#proxy).
- Essayez d'accéder à la plateforme d'échange depuis un autre ordinateur ou un serveur distant, pour voir s'il s'agit d'un problème local ou global avec la plateforme d'échange.
- Vérifiez s'il y a eu des nouvelles récentes de la plateforme d'échange concernant une indisponibilité pour maintenance. Certaines plateformes d'échange passent hors ligne pour des mises à jour régulièrement (par exemple, une fois par semaine).
- Assurez-vous que l'heure de votre système est synchronisée avec les horloges du reste du monde, sans quoi vous pourriez obtenir des erreurs de nonce invalides.

**Remarques supplémentaires :**

- Utilisez l'option `verbose = true` ou instanciez votre plateforme d'échange problématique avec `new ccxt.exchange ({ 'verbose': true })` pour voir les requêtes et réponses HTTP en détail. La sortie verbose sera également utile pour nous aider à déboguer si vous soumettez un problème sur GitHub.
- Utilisez la journalisation DEBUG en Python !
- Certaines plateformes d'échange ne sont pas disponibles dans certains pays ; utiliser un [proxy](#proxy) peut être la solution dans ces cas.
- Si vous obtenez des erreurs d'authentification ou des erreurs *'invalid keys'*, elles sont très probablement dues à un problème de nonce.
- Certaines plateformes d'échange n'indiquent pas clairement si elles échouent à authentifier votre requête. Dans ces circonstances, elles peuvent répondre avec un code d'erreur exotique, comme HTTP 502 Bad Gateway Error ou quelque chose d'encore moins lié à la cause réelle de l'erreur.
