---
title: "Manual"
description: "La biblioteca ccxt es una colección de exchanges de criptomonedas disponibles o clases de exchange. Cada clase implementa la API pública y privada para un exchange de criptomonedas en particular…"
---

# Descripción general

La biblioteca ccxt es una colección de *exchanges* de criptomonedas disponibles o clases de exchange. Cada clase implementa la API pública y privada para un exchange de criptomonedas en particular. Todos los exchanges se derivan de la clase base Exchange y comparten un conjunto de métodos comunes. Para acceder a un exchange en particular desde la biblioteca ccxt, es necesario crear una instancia de la clase de exchange correspondiente. Los exchanges admitidos se actualizan con frecuencia y se agregan nuevos exchanges regularmente.

La estructura de la biblioteca puede describirse de la siguiente manera:

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

Las API REST HTTP públicas y privadas completas para todos los exchanges están implementadas en JavaScript, Python, PHP, C#, Go y Java. Las implementaciones WebSocket están disponibles en [CCXT Pro](https://ccxt.pro), con soporte para flujos WebSocket.

- [**Exchanges**](#exchanges)
- [**Markets**](#markets)
- [**Implicit API**](#implicit-api)
- [**Unified API**](#unified-api)
- [**Public API**](#public-api)
- [**Private API**](#private-api)
- [**Error Handling**](#error-handling)
- [**Troubleshooting**](#troubleshooting)
- [**CCXT Pro**](#ccxt-pro)

## Redes sociales

- <sub>[![Twitter](https://img.shields.io/twitter/follow/ccxt_official?style=social)](https://twitter.com/ccxt_official)</sub> Síguenos en Twitter
- <sub>[![Medium](https://img.shields.io/badge/read-our%20blog-black?logo=medium)](https://medium.com/@ccxt)</sub> Lee nuestro blog en Medium
- <sub>[![Discord](https://img.shields.io/discord/690203284119617602?logo=discord&logoColor=white)](https://discord.gg/dhzSKYU)</sub> Únete a nuestro Discord
- <sub>[![Telegram Chat](https://img.shields.io/badge/CCXT-Chat-blue?logo=telegram)](https://t.me/ccxt_chat)</sub> Chat de CCXT en Telegram (soporte técnico)

- Canales de anuncios:
- - <sub>[![Telegram](https://img.shields.io/badge/CCXT-Channel-blue?logo=telegram)](https://t.me/ccxt_announcements)</sub>
- - <sub>[![Discord](https://img.shields.io/badge/CCXT-Channel-blue?logo=discord)](https://discord.com/channels/690203284119617602/1057748769690619984)</sub>


# Exchanges

- [Instantiation](#instantiation)
- [Exchange Structure](#exchange-structure)
- [Rate Limit](#rate-limit)
<!--- init list -->La biblioteca CCXT admite actualmente los siguientes 108 mercados de exchange de criptomonedas y APIs de trading:

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

Además de realizar órdenes básicas de mercado y límite, algunos exchanges ofrecen trading con margen (apalancamiento), varios derivados (como contratos de futuros y opciones) y también tienen [dark pools](https://en.wikipedia.org/wiki/Dark_pool), [OTC](https://en.wikipedia.org/wiki/Over-the-counter_(finance)) (negociación extrabursátil), APIs para comerciantes y mucho más.

## Instanciación

Para conectarse a un exchange y comenzar a operar, es necesario instanciar una clase de exchange de la biblioteca ccxt.

Para obtener la lista completa de ids de los exchanges compatibles de forma programática:


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


Un exchange puede instanciarse como se muestra en los ejemplos a continuación:


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

La biblioteca ccxt en PHP usa funciones de hora UTC/GMT integradas, por lo que es necesario establecer date.timezone en su php.ini o llamar a la función [date_default_timezone_set()](http://php.net/manual/en/function.date-default-timezone-set.php) antes de usar la versión PHP de la biblioteca. La configuración de zona horaria recomendada es `"UTC"`.

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


### Características

Los exchanges principales tienen disponible la propiedad `.features`, donde se puede ver qué métodos y funcionalidades están soportados para cada tipo de mercado (si algún método está establecido como `null/undefined`, significa que el método "no está soportado" por el exchange)

*esta característica está actualmente en desarrollo y puede estar incompleta; no dude en reportar cualquier problema que encuentre en ella*

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


### Sobreescribir Propiedades del Exchange al Instanciar

La mayoría de las propiedades del exchange, así como opciones específicas, pueden sobreescribirse al instanciar la clase del exchange o posteriormente, como se muestra a continuación:


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


### Sobreescribir Métodos del Exchange

En todos los lenguajes compatibles con CCXT, puede sobreescribir métodos de instancia en tiempo de ejecución:


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


### Testnets y Entornos Sandbox

Algunos exchanges también ofrecen APIs separadas para propósitos de prueba que permiten a los desarrolladores operar con dinero virtual de forma gratuita y probar sus ideas. Esas APIs se denominan _"testnets", "sandboxes" o "entornos de staging"_ (con activos virtuales de prueba) en contraposición a los _"mainnets" y "entornos de producción"_ (con activos reales). Por lo general, una API en sandbox es una copia de una API de producción, por lo que es literalmente la misma API, excepto por la URL del servidor del exchange.

CCXT unifica ese aspecto y permite al usuario cambiar al sandbox del exchange (si es compatible con el exchange subyacente).
Para cambiar al sandbox hay que llamar a `exchange.setSandboxMode (true)` o `exchange.set_sandbox_mode(true)` **inmediatamente después de crear el exchange, antes de cualquier otra llamada**!


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


- El método `exchange.setSandboxMode (true) / exchange.set_sandbox_mode (True)` debe ser su primera llamada inmediatamente después de crear el exchange (antes de cualquier otra llamada)
- Para obtener las [claves API](#authentication) del sandbox, el usuario debe registrarse en el sitio web sandbox del exchange en cuestión y crear un par de claves sandbox
- **¡Las claves sandbox no son intercambiables con las claves de producción!**

## Estructura del Exchange

Cada exchange tiene un conjunto de propiedades y métodos, la mayoría de los cuales puede sobreescribir pasando un array asociativo de parámetros al constructor del exchange. También puede crear una subclase y sobreescribir todo.

A continuación se presenta una descripción general de las propiedades genéricas del exchange con valores añadidos a modo de ejemplo:

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

### Propiedades del Exchange

A continuación se presenta una descripción detallada de cada una de las propiedades base del exchange:

- `id`: Cada exchange tiene un id predeterminado. El id no se usa para nada; es una cadena literal con fines de identificación de instancias de exchange en el espacio del usuario. Puede tener múltiples enlaces al mismo exchange y diferenciarlos por ids. Los ids predeterminados están todos en minúsculas y corresponden a los nombres de los exchanges.

- `name`: Esta es una cadena literal que contiene el nombre legible del exchange.

- `countries`: Un array de cadenas literales de códigos de país ISO de 2 símbolos, desde donde opera el exchange.

- `urls['api']`: La cadena literal única de URL base para llamadas a la API o un array asociativo de URLs separadas para APIs privadas y públicas.

- `urls['www']`: La URL principal del sitio web HTTP.

- `urls['doc']`: Una URL única con enlace a la documentación original de la API del exchange en su sitio web, o un array de enlaces a la documentación.

- `version`: Una cadena literal que contiene el identificador de versión de la API del exchange actual. La biblioteca ccxt añadirá esta cadena de versión a la URL base de la API en cada solicitud. No es necesario modificarla, a menos que esté implementando una nueva API de exchange. El identificador de versión es generalmente una cadena numérica que comienza con la letra 'v' en algunos casos, como v1.1. No lo sobreescriba a menos que esté implementando su propia clase de crypto exchange nueva.

- `api`: Un array asociativo que contiene la definición de todos los endpoints de la API expuestos por un crypto exchange. La definición de la API es usada por ccxt para construir automáticamente métodos de instancia invocables para cada endpoint disponible.

- `has`: Este es un array asociativo de capacidades del exchange (p. ej. `fetchTickers`, `fetchOHLCV` o `CORS`).

- `timeframes`: Un array asociativo de marcos temporales, soportados por el método fetchOHLCV del exchange. Esto solo se rellena cuando la propiedad `has['fetchOHLCV']` es verdadera.

- `timeout`: Un tiempo de espera en milisegundos para un ciclo solicitud-respuesta (el tiempo de espera predeterminado es 10000 ms = 10 segundos). Si no se recibe la respuesta en ese tiempo, la biblioteca lanzará una excepción `RequestTimeout`. Puede dejar el valor de tiempo de espera predeterminado o establecerlo en un valor razonable. Esperar indefinidamente sin tiempo de espera no es una opción, por supuesto. No es necesario sobreescribir esta opción en el caso general.

- `rateLimit`: El límite de tasa en milisegundos. Este valor representa el número de milisegundos a esperar entre solicitudes consecutivas para mantenerse dentro de los límites de tasa del exchange. Por ejemplo, si `rateLimit` es 1000, significa que se permite 1 solicitud por segundo. El limitador de tasa integrado está habilitado de forma predeterminada y puede desactivarse estableciendo la propiedad `enableRateLimit` en false.

- `enableRateLimit`: Un valor booleano (true/false) que habilita el limitador de tasa integrado y regula las solicitudes consecutivas. Esta configuración está `true` (habilitada) de forma predeterminada. **El usuario debe implementar su propio [límite de tasa](#rate-limit) o dejar habilitado el limitador de tasa integrado para evitar ser bloqueado por el exchange**.

- `userAgent`: Un objeto para establecer el encabezado HTTP User-Agent. La biblioteca ccxt establecerá su User-Agent de forma predeterminada. A algunos exchanges puede no gustarles. Si tiene dificultades para obtener una respuesta de un exchange y desea desactivar User-Agent o usar el predeterminado, establezca este valor en false, undefined o una cadena vacía. El valor de `userAgent` puede ser sobreescrito por la propiedad HTTP `headers` a continuación.

- `headers`: Un array asociativo de encabezados HTTP y sus valores. El valor predeterminado es `{}` vacío. Todos los encabezados se añadirán al inicio de todas las solicitudes. Si el encabezado `User-Agent` está establecido dentro de `headers`, sobreescribirá cualquier valor establecido en la propiedad `userAgent` anterior.

- `verbose`: Un indicador booleano que indica si se deben registrar las solicitudes HTTP en stdout (el indicador verbose es false de forma predeterminada). Los usuarios de Python tienen una forma alternativa de registro DEBUG con un registrador pythónico estándar, que se habilita añadiendo estas dos líneas al comienzo de su código:
  ```python
  import logging
  logging.basicConfig(level=logging.DEBUG)
  ```
- `returnResponseHeaders`: Si se establece en `true`, los encabezados de respuesta HTTP del exchange se incluirán en la propiedad `responseHeaders` dentro del campo `info` del resultado devuelto para las llamadas a la API REST. Esto puede ser útil para acceder a metadatos como información de límite de tasa o encabezados específicos del exchange. De forma predeterminada, esto es `false` y los encabezados no se incluyen en la respuesta. Nota: solo se admite cuando la respuesta es un objeto y no una lista o cadena

- `markets`: Un array asociativo de mercados indexado por pares de trading o símbolos comunes. Los mercados deben cargarse antes de acceder a esta propiedad. Los mercados no están disponibles hasta que llame al método `loadMarkets() / load_markets()` en la instancia del exchange.

- `symbols`: Un array no asociativo (una lista) de símbolos disponibles en un exchange, ordenados en orden alfabético. Estas son las claves de la propiedad `markets`. Los símbolos se cargan y recargan desde los mercados. Esta propiedad es un atajo conveniente para todas las claves de mercado.

- `currencies`: Un array asociativo (un dict) de monedas por códigos (generalmente 3 o 4 letras) disponibles en un exchange. Las monedas se cargan y recargan desde los mercados.

- `markets_by_id`: Un array asociativo de arrays de mercados indexados por ids específicos del exchange. Típicamente un array de longitud uno, a menos que haya varios mercados con el mismo marketId. Los mercados deben cargarse antes de acceder a esta propiedad.

- `apiKey`: Esta es su cadena literal de clave API pública. La mayoría de los exchanges requieren [configuración de claves API](#api-keys-setup).

- `secret`: Su cadena literal de clave API secreta privada. La mayoría de los exchanges también requieren esto junto con el apiKey.

- `password`: Una cadena literal con su contraseña/frase. Algunos exchanges requieren este parámetro para operar, pero la mayoría no lo hacen.

- `uid`: Un id único de su cuenta. Puede ser una cadena literal o un número. Algunos exchanges también requieren esto para operar, pero la mayoría no lo hacen.

- `requiredCredentials`: Un diccionario asociativo unificado que muestra cuáles de las credenciales API anteriores se requieren para enviar llamadas a la API privada al exchange subyacente (un exchange puede requerir un conjunto específico de claves).

- `options`: Un diccionario asociativo específico del exchange que contiene claves y opciones especiales aceptadas por el exchange subyacente y compatibles con CCXT.

- `precisionMode`: El modo de conteo de precisión decimal del exchange; lea más sobre [Precisión y Límites](#precision-and-limits)

- Para proxies - `proxyUrl`, `httpUrl`, `httpsUrl`, `socksProxy`, `wsProxy`, `wssProxy`, `wsSocksProxy`: Una URL de proxy específico. Consulte la sección [Proxy](#proxy) para más detalles.

Consulte esta sección sobre [Sobreescribir propiedades del exchange](#overriding-exchange-properties-upon-instantiation).

#### Metadatos del Exchange

- `has`: Un array asociativo que contiene indicadores para las capacidades del exchange, incluidos los siguientes:

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

    El significado de cada indicador que muestra la disponibilidad de este u otro método es:

    - un valor de `undefined` / `None` / `null` significa que el método no está implementado actualmente en ccxt (ya sea que ccxt aún no lo haya unificado o que el método no esté disponible de forma nativa en la API del exchange)
    - el booleano `false` específicamente significa que el endpoint no está disponible de forma nativa en la API del exchange
    - el booleano `true` significa que el endpoint está disponible de forma nativa en la API del exchange y unificado en la biblioteca ccxt
    - la cadena `'emulated'` significa que el endpoint no está disponible de forma nativa en la API del exchange, pero es reconstruido (en la medida de lo posible) por la biblioteca ccxt a partir de otros métodos verdaderos disponibles

    Para obtener una lista completa de todos los exchanges y sus métodos compatibles, consulte este ejemplo: https://github.com/ccxt/ccxt/blob/master/examples/js/exchange-capabilities.js

## Límite de Tasa

Los exchanges generalmente imponen lo que se denomina un *límite de tasa*. Los exchanges recordarán y rastrearán sus credenciales de usuario y su dirección IP, y no le permitirán consultar la API con demasiada frecuencia. Equilibran su carga y controlan la congestión del tráfico para proteger los servidores API de (D)DoS y uso indebido.

**ADVERTENCIA: ¡Mantente por debajo del límite de velocidad para evitar el bloqueo!**

La mayoría de los exchanges permiten **hasta 1 o 2 solicitudes por segundo**. Los exchanges pueden restringir temporalmente tu acceso a su API o bloquearte durante cierto período de tiempo si realizas demasiadas solicitudes de forma agresiva.

**La propiedad `exchange.rateLimit` está configurada con un valor predeterminado seguro que no es óptimo. Algunos exchanges pueden tener límites de velocidad variables para diferentes endpoints. Es responsabilidad del usuario ajustar `rateLimit` según los propósitos específicos de la aplicación.**

La biblioteca CCXT tiene algoritmos de limitación de velocidad experimentales integrados que realizarán el throttling necesario en segundo plano de forma transparente para el usuario. **ADVERTENCIA: los usuarios son responsables de al menos algún tipo de limitación de velocidad: ya sea implementando un algoritmo personalizado o utilizando el limitador de velocidad integrado.**

CCXT tiene los siguientes algoritmos de limitación de velocidad integrados:

- **Leaky Bucket (predeterminado)**: Funciona poniendo en cola las solicitudes y liberándolas a una velocidad constante y fija. Las ráfagas de solicitudes se distribuyen en el tiempo en lugar de ejecutarse de inmediato, lo que ayuda a evitar alcanzar los límites de velocidad del exchange y al mismo tiempo permite gestionar con gracia los picos breves de actividad.
- **Basado en ventana (opcional)**: Si el usuario proporciona la opción `{ 'rateLimiterAlgorithm': 'rollingWindow' }`, ccxt cambia del modelo de leaky bucket a un limitador de velocidad basado en ventana (el tamaño de la ventana se puede personalizar proporcionando `rollingWindowSize: X0000`; CCXT usa 60s como windowSize predeterminado). Un limitador basado en ventana impone un número máximo de solicitudes dentro de una ventana de tiempo fija (por ejemplo, N solicitudes por X milisegundos). Una vez alcanzado el límite, las solicitudes adicionales se retrasan hasta que expire la ventana actual.

Puedes activar o desactivar el limitador de velocidad integrado con la propiedad `.enableRateLimit`, de la siguiente manera:


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


En caso de que tus llamadas alcancen un límite de velocidad o produzcan errores de nonce, la biblioteca ccxt lanzará una excepción `InvalidNonce` o, en algunos casos, uno de los siguientes tipos:

- `DDoSProtection`
- `ExchangeNotAvailable`
- `ExchangeError`
- `InvalidNonce`

Un reintento posterior suele ser suficiente para resolverlo.

### Notas sobre el limitador de velocidad
#### Un limitador de velocidad por cada instancia de exchange

El limitador de velocidad es una propiedad de la instancia del exchange; en otras palabras, cada instancia del exchange tiene su propio limitador de velocidad que no conoce las demás instancias. En muchos casos, el usuario debería reutilizar la misma instancia del exchange a lo largo del programa. No uses múltiples instancias del mismo exchange con el mismo par de claves API desde la misma dirección IP.

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

Reutiliza la instancia del exchange tanto como sea posible como se muestra a continuación:

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

Dado que el limitador de velocidad pertenece a la instancia del exchange, destruir la instancia del exchange también destruirá el limitador de velocidad. Uno de los errores más comunes con la limitación de velocidad es crear y destruir la instancia del exchange una y otra vez. Si en tu programa estás creando y destruyendo la instancia del exchange (por ejemplo, dentro de una función que se llama múltiples veces), entonces estás restableciendo efectivamente el limitador de velocidad una y otra vez, y eso eventualmente violará los límites de velocidad. Si estás recreando la instancia del exchange cada vez en lugar de reutilizarla, CCXT intentará cargar los mercados cada vez. Por lo tanto, forzarás la carga de los mercados una y otra vez como se explica en la sección [Cargando Mercados](#loading-markets). Abusar del endpoint de mercados eventualmente también romperá el limitador de velocidad.

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

No rompas esta regla a menos que realmente entiendas el funcionamiento interno del limitador de velocidad y estés 100% seguro de lo que estás haciendo. Para mantenerte seguro, reutiliza siempre la instancia del exchange a lo largo de la cadena de llamadas de tus funciones y métodos como se muestra a continuación:

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

### Protección DDoS por Cloudflare / Incapsula

Algunos exchanges están protegidos contra [DDoS](https://en.wikipedia.org/wiki/Denial-of-service_attack) por [Cloudflare](https://www.cloudflare.com) o [Incapsula](https://www.incapsula.com). Tu IP puede quedar temporalmente bloqueada durante períodos de alta carga. A veces incluso restringen países y regiones enteras. En ese caso, sus servidores generalmente devuelven una página que indica un error HTTP 40x o ejecutan una prueba AJAX de tu navegador / prueba captcha y retrasan la recarga de la página durante varios segundos. Luego, tu navegador/huella digital obtiene acceso temporal y se agrega a una lista blanca o recibe una cookie HTTP para uso posterior.

Los síntomas más comunes de un problema de protección DDoS, un problema de limitación de velocidad o un problema de filtrado por ubicación:
- Obtener excepciones `RequestTimeout` con todos los tipos de métodos del exchange
- Capturar `ExchangeError` o `ExchangeNotAvailable` con códigos de error HTTP 400, 403, 404, 429, 500, 501, 503, etc.
- Tener problemas de resolución DNS, problemas de certificados SSL y problemas de conectividad de bajo nivel
- Obtener una página HTML de plantilla en lugar de JSON del exchange

Si encuentras errores de protección DDoS y no puedes acceder a un exchange en particular:

- usa un [proxy](#proxy) (aunque esto es menos reactivo)
- solicita al soporte del exchange que te agregue a una lista blanca
- prueba con una IP alternativa en una región geográfica diferente
- ejecuta tu software en una red distribuida de servidores
- ejecuta tu software cerca del exchange (mismo país, misma ciudad, mismo centro de datos, mismo rack de servidores, mismo servidor)
- ...

## Capacidad máxima de solicitudes

En la programación asíncrona, CCXT te permite programar un número ilimitado de solicitudes. Sin embargo, hay un límite en la longitud de la cola que, de forma predeterminada, está establecido en un máximo de 1000 solicitudes concurrentes. Si intentas encolar más que eso, encontrarás el error: "throttle queue is over maxCapacity".

En la mayoría de los casos, tener tantas tareas pendientes indica un diseño subóptimo, ya que las nuevas solicitudes se retrasarán hasta que las tareas existentes se completen.

Dicho esto, los usuarios que deseen omitir esta restricción pueden aumentar el maxCapacity predeterminado durante la instanciación como se muestra a continuación:

```
ex = ccxt.binance({'options': {'maxRequestsQueue': 9999}})
```

# Mercados

- [Estructura de moneda](#currency-structure)
- [Estructura de mercado](#market-structure)
- [Precisión y límites](#precision-and-limits)
- [Cargando mercados](#loading-markets)
- [Símbolos e IDs de mercado](#symbols-and-market-ids)
- [Recarga forzada de caché de mercado](#market-cache-force-reload)

Cada exchange es un lugar para operar con ciertos tipos de activos de valor. Los exchanges pueden usar diferentes términos para denominarlos: _"una moneda"_, _"un activo"_, _"una coin"_, _"un token"_, _"acciones"_, _"materias primas"_, _"cripto"_, "fiat", etc. Un lugar para operar con un activo por otro generalmente se llama _"un mercado"_, _"un símbolo"_, _"un par de trading"_, _"un contrato"_, etc.

En términos de la biblioteca ccxt, cada exchange ofrece múltiples **mercados** dentro de sí mismo. Cada mercado está definido por dos o más **monedas**. El conjunto de mercados difiere de exchange a exchange, abriendo posibilidades para el arbitraje entre exchanges y entre mercados.

## Estructura de moneda

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

Cada moneda es un array asociativo (también conocido como diccionario) con las siguientes claves:

- `id`. El ID de cadena o numérico de la moneda dentro del exchange. Los IDs de moneda se usan internamente en los exchanges para identificar coins durante el proceso de solicitud/respuesta.
- `code`. Una representación en código de cadena en mayúsculas de una moneda en particular. Los códigos de moneda se usan para referenciar monedas dentro de la biblioteca ccxt (explicado a continuación).
- `name`. Un nombre legible para humanos de la moneda (puede ser una combinación de caracteres en mayúsculas y minúsculas).
- `fee`. El valor de la comisión de retiro tal como lo especifica el exchange. En la mayoría de los casos significa una cantidad fija plana pagada en la misma moneda. Si el exchange no lo especifica a través de endpoints públicos, la `fee` puede ser `undefined/None/null` o estar ausente.
- `active`. Un booleano que indica si el trading o la financiación (depósito o retiro) de esta moneda es actualmente posible; más información aquí: [`active` status](#active-status).
- `info`. Un array asociativo de propiedades de mercado no comunes, incluyendo comisiones, tasas, límites y otra información general del mercado. El array info interno es diferente para cada mercado en particular; su contenido depende del exchange.
- `precision`. Precisión aceptada en los valores por los exchanges al referenciar esta moneda. El valor de esta propiedad depende de [`exchange.precisionMode`](#precision-mode).
- `limits`. Los mínimos y máximos para cantidades (volúmenes), retiros y depósitos.

## Estructura de red

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

Cada red es un array asociativo (también conocido como diccionario) con las siguientes claves:

- `id`. El ID de cadena o numérico de la red dentro del exchange. Los IDs de red se usan internamente en los exchanges para identificar redes durante el proceso de solicitud/respuesta.
- `network`. Una representación en cadena en mayúsculas de una red en particular. Las redes se usan para referenciar redes dentro de la biblioteca ccxt.
- `name`. Un nombre legible para humanos de la red (puede ser una combinación de caracteres en mayúsculas y minúsculas).
- `fee`. El valor de la comisión de retiro tal como lo especifica el exchange. En la mayoría de los casos significa una cantidad fija plana pagada en la misma moneda. Si el exchange no lo especifica a través de endpoints públicos, la `fee` puede ser `undefined/None/null` o estar ausente.
- `active`. Un booleano que indica si el trading o la financiación (depósito o retiro) de esta moneda es actualmente posible; más información aquí: [`active` status](#active-status).
- `info`. Un array asociativo de propiedades de mercado no comunes, incluyendo comisiones, tasas, límites y otra información general del mercado. El array info interno es diferente para cada mercado en particular; su contenido depende del exchange.
- `precision`. Precisión aceptada en los valores por los exchanges al referenciar esta moneda. El valor de esta propiedad depende de [`exchange.precisionMode`](#precision-mode).
- `limits`. Los mínimos y máximos para cantidades (volúmenes), retiros y depósitos.

## Estructura de mercado

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

Cada mercado es un array asociativo (también conocido como diccionario) con las siguientes claves:

- `id`. El ID de cadena o numérico del mercado o instrumento de trading dentro del exchange. Los IDs de mercado se usan internamente en los exchanges para identificar pares de trading durante el proceso de solicitud/respuesta.
- `symbol`. Una representación en código de cadena en mayúsculas de un par de trading o instrumento en particular. Generalmente se escribe como `BaseCurrency/QuoteCurrency` con una barra diagonal, como en `BTC/USD`, `LTC/CNY` o `ETH/EUR`, etc. Los símbolos se usan para referenciar mercados dentro de la biblioteca ccxt (explicado a continuación).
- `base`. Un código de cadena en mayúsculas unificado de la moneda base fiat o cripto. Este es el código de moneda estandarizado que se usa para referirse a esa moneda o token en todo CCXT y en toda la API Unificada de CCXT; es el idioma que CCXT entiende.
- `quote`. Un código de cadena en mayúsculas unificado de la moneda cotizada fiat o cripto.
- `baseId`. Un ID específico del exchange de la moneda base para este mercado, no unificado. Puede ser cualquier cadena, literalmente. Esto se comunica al exchange usando el lenguaje que el exchange entiende.
- `quoteId`. Un ID específico del exchange de la moneda cotizada, no unificado.
- `active`. Un booleano que indica si el trading en este mercado es actualmente posible o no; más información aquí: [`active` status](#active-status).
- `maker`. Float, 0.0015 = 0.15%. Las comisiones de maker se pagan cuando proporcionas liquidez al exchange, es decir, cuando realizas una orden de *market-make* y alguien más la ejecuta. Las comisiones de maker suelen ser más bajas que las de taker. Las comisiones pueden ser negativas, lo cual es muy común entre los exchanges de derivados. Una comisión negativa significa que el exchange pagará un reembolso (recompensa) al usuario por operar en este mercado (nota: las comisiones de 'taker' y 'maker' son públicas y no tienen en cuenta tu nivel VIP/volumen/etc. Usa [`fetchTradingFees`](#fee-schedule) para obtener las comisiones específicas de tu cuenta).
- `taker`. Float, 0.002 = 0.2%. Las comisiones de taker se pagan cuando *tomas* liquidez del exchange y ejecutas la orden de otro.
- `percentage`. Un valor booleano verdadero/falso que indica si `taker` y `maker` son multiplicadores o cantidades fijas planas.
- `tierBased`. Un valor booleano verdadero/falso que indica si la comisión depende de tu nivel de trading (generalmente, tu volumen operado durante un período de tiempo).
- `info`. Un array asociativo de propiedades de mercado no comunes, incluyendo comisiones, tasas, límites y otra información general del mercado. El array info interno es diferente para cada mercado en particular; su contenido depende del exchange.
- `precision`. Precisión aceptada en los valores de órdenes por los exchanges al colocar órdenes para precio, cantidad y costo. (El valor dentro de esta propiedad depende del [`exchange.precisionMode`](#precision-mode)).
- `limits`. Los mínimos y máximos para precios, cantidades (volúmenes) y costos (donde costo = precio * cantidad).
- `optionType`. El tipo de opción: `call` representa una opción con el derecho a comprar y `put` una opción con el derecho a vender.
- `strike`. Precio al que se puede comprar o vender una opción cuando se ejerce.

## Estado Activo

El indicador `active` se usa típicamente en [`currencies`](#currency-structure) y [`markets`](#market-structure). Los exchanges pueden darle un significado ligeramente diferente. Si una moneda está inactiva, la mayoría de las veces todos los tickers, libros de órdenes y otros endpoints relacionados devuelven respuestas vacías, todo ceros, sin datos o información desactualizada. El usuario debe comprobar si la moneda está `active` y [recargar los mercados periódicamente](#market-cache-force-reload).

Nota: el valor `false` de la propiedad `active` no siempre garantiza que todas las características posibles como el trading, el retiro o el depósito estén deshabilitadas en el exchange. Del mismo modo, tampoco el valor `true` garantiza que todas esas características estén habilitadas en el exchange. Consulte la documentación de los exchanges subyacentes y el código en CCXT para conocer el significado exacto del indicador `active` para cada exchange. Este indicador aún no está soportado o implementado por todos los mercados y puede estar ausente.

**¡ADVERTENCIA! La información sobre las comisiones es experimental, inestable y puede ser parcial o no estar disponible en absoluto.**

## Precisión y Límites

**¡No confunda `limits` con `precision`!** La precisión no tiene nada que ver con los límites mínimos. Una precisión de `0.01` no significa necesariamente que el límite mínimo para el mercado sea `0.01`. Lo contrario también es cierto: un límite mínimo de `0.01` no significa necesariamente que la precisión sea `0.01`.

Ejemplos:

1.
```
market['limits']['amount']['min'] == 0.05 &&
market['precision']['amount'] == 0.0001 &&
market['precision']['price'] == 0.01
```

  - El *valor de amount* debe ser >= 0.05:
    ```diff
    + good: 0.05, 0.051, 0.0501, 0.0502, ..., 0.0599, 0.06, 0.0601, ...
    - bad: 0.04, 0.049, 0.0499
    ```
  - La *precisión del amount* debe ser de hasta 4 dígitos después del punto (0.0001):
    ```diff
    + good: 0.05, 0.0501, ..., 0.06, ..., 0.0719, ...
    - bad: 0.05001, 0.05000, 0.06001
    ```
  - La *precisión del price* debe ser de hasta 2 dígitos después del punto (0.01):
    ```diff
    + good: 1.6, 1.61, 123.01, ..., 1234.56, ...
    - bad: 1.601, ..., 123.012, ..., 1234.567
    ```
  - 

2. `(market['precision']['amount'] == -1)`

    Una *precisión* negativa solo podría ocurrir teóricamente si el `precisionMode` del exchange es `SIGNIFICANT_DIGIT` o `DECIMAL_PRECISION`. Significa que el amount debe ser un múltiplo entero de 10 (elevado a la potencia absoluta especificada):
    ```diff
    + good: 10, 50, ..., 110, ... 1230, ..., 1000000, ..., 1234560, ...
    - bad: 9.5, ... 10.1, ..., 11, ... 200.71, ...
    ```
    En el caso de `-2`, los valores aceptables serían múltiplos de `100` (por ejemplo, 100, 200, ...), y así sucesivamente.


#### Modo de Precisión

Los modos de precisión soportados en `exchange['precisionMode']` son:

- `TICK_SIZE` – casi todos los exchanges usan este modo de precisión. En este modo, los números en `market_or_currency['precision']` designan las fracciones de precisión mínima (flotantes) para redondear o truncar.
- `SIGNIFICANT_DIGITS` – cuenta solo los dígitos distintos de cero; algunos exchanges (`bitfinex` y quizás algunos otros) implementan este modo de conteo de decimales. Con este modo de precisión, los números en `market_or_currency['precision']` designan la posición N del último dígito decimal significativo (distinto de cero) después del punto.
- `DECIMAL_PLACES` (**OBSOLETO, CCXT ya no usa este modo en ningún lugar**) – cuenta todos los dígitos. Con este modo de precisión, los números en `market_or_currency['precision']` designan el número de dígitos decimales después del punto para redondear o truncar.

### Notas Sobre Precisión y Límites

¡El usuario debe mantenerse dentro de todos los límites y la precisión! Los valores de la orden deben satisfacer las siguientes condiciones:

- `amount` de la orden >= `limits['amount']['min']`
- `amount` de la orden <= `limits['amount']['max']`
- `price` de la orden >= `limits['price']['min']`
- `price` de la orden <= `limits['price']['max']`
- `cost` de la orden (`amount * price`) >= `limits['cost']['min']`
- `cost` de la orden (`amount * price`) <= `limits['cost']['max']`
- La precisión de `amount` debe ser <= `precision['amount']`
- La precisión de `price` debe ser <= `precision['price']`

Los valores anteriores pueden estar ausentes en algunos exchanges que no proporcionan información sobre límites desde su API o que aún no lo tienen implementado.

### Métodos para Formatear Decimales

Cada exchange tiene sus propios modos de redondeo, conteo y relleno.

Los modos de redondeo soportados son:

- `ROUND` – redondeará los últimos dígitos decimales a la precisión
- `TRUNCATE` – cortará los dígitos después de cierta precisión

El modo de conteo de precisión decimal está disponible en la propiedad `exchange.precisionMode`.

#### Modo de Relleno

Los modos de relleno soportados son:

- `NO_PADDING` – predeterminado para la mayoría de los casos
- `PAD_WITH_ZERO` – añade caracteres cero hasta la precisión

#### Formato a la Precisión

La mayoría de las veces el usuario no tiene que preocuparse por el formato de precisión, ya que CCXT lo manejará por el usuario cuando este coloque órdenes o envíe solicitudes de retiro, siempre que el usuario siga las reglas descritas en [Precisión y Límites](#precision-and-limits). Sin embargo, en algunos casos los detalles del formato de precisión pueden ser importantes, por lo que los siguientes métodos pueden ser útiles en el código del usuario.

La clase base del exchange contiene el método `decimalToPrecision` para ayudar a formatear valores a la precisión decimal requerida con soporte para diferentes modos de redondeo, conteo y relleno.


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


Para ejemplos de cómo usar `decimalToPrecision` para formatear cadenas y flotantes, por favor consulte los siguientes archivos:

- Typescript: https://github.com/ccxt/ccxt/blob/master/ts/src/test/base/functions/test.number.ts
- JavaScript: https://github.com/ccxt/ccxt/blob/master/js/src/test/base/functions/test.number.js
- Python: https://github.com/ccxt/ccxt/blob/master/python/ccxt/test/base/test_number.py
- PHP: https://github.com/ccxt/ccxt/blob/master/php/test/base/test_number.php

**¡ADVERTENCIA de Python! El método `decimal_to_precision` es susceptible a `getcontext().prec!`**

Para la comodidad de los usuarios, la clase base del exchange de CCXT también implementa los siguientes métodos:


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


Cada exchange tiene sus propias configuraciones de precisión; los métodos anteriores ayudarán a formatear esos valores de acuerdo con las reglas de precisión específicas de cada exchange, de una manera portable e independiente del exchange subyacente. Para hacer esto posible, los mercados y las monedas deben cargarse antes de formatear cualquier valor.

**¡Asegúrese de [cargar los mercados con `exchange.loadMarkets()`](#loading-markets) antes de llamar a estos métodos!**

Por ejemplo:


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


Más ejemplos prácticos que describen el comportamiento de `exchange.precisionMode`:

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

## Carga de Mercados

En la mayoría de los casos es necesario cargar la lista de mercados y símbolos de trading de un exchange en particular antes de acceder a otros métodos de la API. Si olvida cargar los mercados, la biblioteca ccxt lo hará automáticamente en su primera llamada a la API unificada. Enviará dos solicitudes HTTP, primero para los mercados y luego una segunda para otros datos, de forma secuencial. Por esta razón, su primera llamada a un método de la API unificada de CCXT como fetchTicker, fetchBalance, etc., tomará más tiempo que las llamadas subsiguientes, ya que tiene que realizar más trabajo cargando la información del mercado desde la API del exchange. Consulte [Notas sobre el Limitador de Tasa](#notes-on-rate-limiter) para más detalles.

Para cargar los mercados manualmente de antemano, llame al método `loadMarkets ()` / `load_markets ()` en una instancia del exchange. Devuelve un array asociativo de mercados indexados por símbolo de trading. Si desea más control sobre la ejecución de su lógica, se recomienda precargar los mercados manualmente.


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


Además de la información del mercado, la llamada `loadMarkets()` también cargará las monedas del exchange y almacenará la información en caché en las propiedades `.markets` y `.currencies` respectivamente.

El usuario también puede omitir la caché y llamar a métodos unificados para obtener esa información directamente desde los endpoints del exchange, `fetchMarkets()` y `fetchCurrencies()`, aunque no se recomienda el uso de estos métodos para los usuarios finales. La forma recomendada de precargar mercados es llamando al método unificado `loadMarkets()`. Sin embargo, las nuevas integraciones de exchanges deben implementar estos métodos si el exchange subyacente tiene los endpoints de API correspondientes.

### Compartir Mercados Entre Instancias del Exchange

Para optimizar el uso de memoria y reducir las llamadas redundantes a la API, puede compartir datos de mercado entre múltiples instancias del mismo exchange. Esto es especialmente útil cuando se crean múltiples instancias del exchange o cuando se desea reutilizar datos de mercado que ya han sido cargados.


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


**Beneficios del Uso Compartido de Mercados:**
- **Eficiencia de Memoria**: Múltiples instancias del exchange comparten los mismos objetos de mercado en memoria
- **Rendimiento**: Elimina las llamadas redundantes a la API para obtener datos de mercado
- **Conservación de Recursos**: Reduce las solicitudes de red y el uso del límite de tasa de la API
- **Persistencia**: Los datos del mercado permanecen disponibles incluso si se destruyen instancias individuales del exchange

**Asignación Directa Alternativa:**

Si prefiere la asignación directa de propiedades, también puede compartir mercados asignando directamente la propiedad `markets`:

```javascript
// Simple direct assignment (ensure both exchanges are of same type)
exchange2.markets = exchange1.markets;
exchange2.symbols = exchange1.symbols;  // Also copy symbols for full functionality
```

Sin embargo, se recomienda usar el método `setMarketsFromExchange()` ya que:
- Valida que ambos exchanges sean del mismo tipo
- Garantiza que todos los datos de mercado relacionados se copien correctamente
- Proporciona un mejor manejo de errores

**Notas Importantes:**
- Solo comparta mercados entre instancias del mismo tipo de exchange
- El uso compartido de mercados es más efectivo cuando ambas instancias usan las mismas credenciales y configuración de API
- Los objetos de mercado compartidos persistirán en memoria mientras exista al menos una referencia
- Tanto el método `setMarketsFromExchange()` como la asignación directa crean referencias compartidas, no copias

## Símbolos e Identificadores de Mercado

Un código de moneda es un código de tres a cinco letras, como `BTC`, `ETH`, `USD`, `GBP`, `CNY`, `JPY`, `DOGE`, `RUB`, `ZEC`, `XRP`, `XMR`, etc. Algunos exchanges tienen monedas exóticas con códigos más largos.

Un símbolo es generalmente un nombre de cadena en mayúsculas de un par de monedas negociadas con una barra diagonal entre ellas. La primera moneda antes de la barra diagonal se suele llamar *moneda base*, y la que aparece después de la barra diagonal se llama *moneda de cotización*. Ejemplos de símbolos son: `BTC/USD`, `DOGE/LTC`, `ETH/EUR`, `DASH/XRP`, `BTC/CNY`, `ZEC/XMR`, `ETH/JPY`.

Los identificadores de mercado se usan durante el proceso de solicitud-respuesta REST para hacer referencia a los pares de trading dentro de los exchanges. El conjunto de identificadores de mercado es único por exchange y no puede usarse entre exchanges. Por ejemplo, el par/mercado BTC/USD puede tener diferentes identificadores en varios exchanges populares, como `btcusd`, `BTCUSD`, `XBTUSD`, `btc/usd`, `42` (id numérico), `BTC/USD`, `Btc/Usd`, `tBTCUSD`, `XXBTZUSD`. No es necesario recordar ni usar los identificadores de mercado, ya que existen para propósitos internos de solicitud-respuesta HTTP dentro de las implementaciones del exchange.

La biblioteca ccxt abstrae los identificadores de mercado poco comunes en símbolos, estandarizados a un formato común. Los símbolos no son lo mismo que los identificadores de mercado. Cada mercado se referencia mediante un símbolo correspondiente. Los símbolos son comunes entre exchanges, lo que los hace adecuados para el arbitraje y muchas otras cosas.

A veces el usuario podría notar un símbolo como `'XBTM18'` o `'.XRPUSDM20180101'` u otros *"símbolos exóticos/raros"*. El símbolo **no está obligado** a tener una barra diagonal ni a ser un par de monedas. La cadena en el símbolo realmente depende del tipo de mercado (si es un mercado spot o un mercado de futuros, un mercado oscuro o un mercado expirado, etc.). Se desaconseja encarecidamente intentar analizar la cadena del símbolo; no se debe confiar en el formato del símbolo, se recomienda usar las propiedades del mercado en su lugar.

Las estructuras de mercado se indexan por símbolos e ids. La clase base de exchange también tiene métodos integrados para acceder a los mercados por símbolos. La mayoría de los métodos de API requieren que se pase un símbolo en su primer argumento. A menudo se requiere especificar un símbolo al consultar precios actuales, realizar órdenes, etc.

La mayoría de las veces los usuarios trabajarán con símbolos de mercado. Obtendrá una excepción estándar de usuario si accede a claves inexistentes en estos diccionarios.

### Métodos Para Mercados Y Divisas


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


### Consistencia En Los Nombres

Existe cierta ambigüedad de términos entre varios exchanges que puede causar confusión entre los traders principiantes. Algunos exchanges llaman a los mercados *pares*, mientras que otros exchanges llaman a los símbolos *productos*. En términos de la biblioteca ccxt, cada exchange contiene uno o más mercados de trading. Cada mercado tiene un id y un símbolo. La mayoría de los símbolos son pares de divisa base y divisa de cotización.

``` → Markets → Symbols → Currencies```

Históricamente se han utilizado varios nombres simbólicos para designar los mismos pares de trading. Algunas criptomonedas (como Dash) incluso cambiaron sus nombres más de una vez durante su vida útil. Para mantener la consistencia entre exchanges, la biblioteca ccxt realizará las siguientes sustituciones conocidas para símbolos y divisas:

- `XBT → BTC`: `XBT` es más reciente pero `BTC` es más común entre los exchanges y suena más a bitcoin ([leer más](https://www.google.ru/search?q=xbt+vs+btc)).
- `BCC → BCH`: El fork de Bitcoin Cash a menudo se denomina con dos nombres simbólicos diferentes: `BCC` y `BCH`. El nombre `BCC` es ambiguo para Bitcoin Cash, ya que se confunde con BitConnect. La biblioteca ccxt convertirá `BCC` a `BCH` cuando sea apropiado (algunos exchanges y agregadores los confunden).
- `DRK → DASH`: `DASH` era Darkcoin y luego se convirtió en Dash ([leer más](https://minergate.com/blog/dashcoin-and-dash/)).
- `BCHABC → BCH`: El 15 de noviembre de 2018, Bitcoin Cash se bifurcó por segunda vez, por lo que ahora existe `BCH` (para BCH ABC) y `BSV` (para BCH SV).
- `BCHSV → BSV`: Esta es una sustitución de mapeo común para el fork Bitcoin Cash SV (algunos exchanges lo llaman `BSV`, otros lo llaman `BCHSV`, nosotros usamos el primero).
- `DSH → DASH`: Procure no confundir símbolos y divisas. El `DSH` (Dashcoin) no es lo mismo que `DASH` (Dash). Algunos exchanges tienen `DASH` etiquetado de forma inconsistente como `DSH`, la biblioteca ccxt también realiza una corrección para eso (`DSH → DASH`), pero solo en ciertos exchanges que tienen estas dos divisas confundidas, mientras que la mayoría de los exchanges las tienen correctas. Solo recuerde que `DASH/BTC` no es lo mismo que `DSH/BTC`.
- `XRB` → `NANO`: `NANO` es el código más reciente para RaiBlocks, por lo tanto, la API unificada de CCXT reemplazará el antiguo `XRB` con `NANO` cuando sea necesario. https://hackernoon.com/nano-rebrand-announcement-9101528a7b76
- `USD` → `USDT`: Algunos exchanges, como Bitfinex, HitBTC y algunos otros, denominan la divisa como `USD` en sus listados, pero esos mercados en realidad operan con `USDT`. La confusión puede surgir de una limitación de 3 letras en los nombres de símbolos o puede deberse a otras razones. En los casos en que la divisa negociada es realmente `USDT` y no `USD`, la biblioteca CCXT realizará la conversión `USD` → `USDT`. Sin embargo, tenga en cuenta que algunos exchanges tienen tanto símbolos `USD` como `USDT`; por ejemplo, Kraken tiene un par de trading `USDT/USD`.

#### Notas Sobre La Consistencia En Los Nombres

Cada exchange tiene un array asociativo de sustituciones para los códigos simbólicos de criptomonedas en la propiedad `exchange.commonCurrencies`, como:
```
'commonCurrencies' : {
    'XBT': 'BTC',
    'OPTIMISM': 'OP',
    // ... etc
}
```
donde la clave representa el nombre real con el que el motor del exchange hace referencia a esa moneda, y el valor representa cómo desea referirse a ella a través de ccxt.

A veces el usuario puede notar nombres de símbolos exóticos con palabras en mayúsculas y minúsculas mezcladas y espacios en el código. La lógica detrás de tener estos nombres se explica por las reglas para resolver conflictos en la nomenclatura y la codificación de divisas cuando una o más divisas tienen el mismo código simbólico en diferentes exchanges:

- Primero, recopilamos toda la información disponible de los propios exchanges sobre los códigos de divisa en cuestión. Generalmente tienen una descripción de sus listados de monedas en algún lugar de su API, documentación, bases de conocimiento u otros lugares de sus sitios web.
- Cuando identificamos cada criptomoneda particular que está detrás del código de divisa, las buscamos en [CoinMarketCap](https://coinmarketcap.com).
- La divisa que tenga la mayor capitalización de mercado de todas gana el código de divisa y lo conserva. Por ejemplo, HOT a menudo representa `Holo` o `Hydro Protocol`. En este caso, `Holo` retiene el código `HOT`, y `Hydro Protocol` tendrá su nombre como código, literalmente, `Hydro Protocol`. Por lo tanto, puede haber pares de trading con símbolos como `HOT/USD` (para `Holo`) y `Hydro Protocol/USD` — esos son dos mercados diferentes.
- Si la capitalización de mercado de una moneda en particular es desconocida o no es suficiente para determinar al ganador, también tomamos en consideración los volúmenes de trading y otros factores.
- Cuando se determina el ganador, todas las demás divisas competidoras obtienen sus nombres de código correctamente remapeados y sustituidos dentro de los exchanges en conflicto mediante `.commonCurrencies`. **¡Tenga en cuenta que debe definirse antes de que ocurra '.loadMarkets()'!**
- Desafortunadamente, esto es un trabajo en progreso, porque nuevas divisas se listan diariamente y nuevos exchanges se agregan de vez en cuando, por lo que, en general, este es un proceso interminable de autocorrección en un entorno que cambia rápidamente, prácticamente, en *"modo en vivo"*. Agradecemos todos los conflictos y discrepancias reportados que pueda encontrar.

#### Preguntas Sobre La Consistencia En Los Nombres

_¿Es posible que los símbolos cambien?_

En resumen, sí, a veces, pero raramente. Los mapeos simbólicos pueden cambiarse si es absolutamente necesario y no puede evitarse. Sin embargo, todos los cambios simbólicos anteriores estaban relacionados con la resolución de conflictos o forks. Hasta ahora, no ha habido precedente de que la capitalización de mercado de una moneda supere a otra con el mismo código simbólico en CCXT.

_¿Podemos confiar en que siempre se liste la misma cripto con el mismo símbolo?_

Más o menos ) Primero, esta biblioteca es un trabajo en progreso, y está tratando de adaptarse a la realidad en constante cambio, por lo que puede haber conflictos que solucionaremos cambiando algunos mapeos en el futuro. En última instancia, la licencia dice "sin garantías, úselo bajo su propio riesgo". Sin embargo, no cambiamos los mapeos simbólicos aleatoriamente, porque entendemos las consecuencias y también queremos poder confiar en la biblioteca y no nos gusta romper la compatibilidad hacia atrás en absoluto.

Si ocurre que el símbolo de un token importante se bifurca o debe cambiarse, entonces el control sigue estando en manos de los usuarios. La propiedad `exchange.commonCurrencies` puede [sobreescribirse durante la inicialización o después](#overriding-exchange-properties-upon-instantiation), al igual que cualquier otra propiedad del exchange. Si un token significativo está involucrado, generalmente publicamos instrucciones sobre cómo retener el comportamiento anterior añadiendo un par de líneas a los parámetros del constructor.

#### Consistencia De Las Divisas Base Y De Cotización

Depende del exchange que esté utilizando, pero algunos tienen un emparejamiento invertido (inconsistente) de `base` y `quote`. En realidad tienen la base y la cotización mal colocadas (intercambiadas/invertidas). En ese caso verá una diferencia entre los valores de divisa `base` y `quote` analizados y el `info` sin analizar en la subestructura del mercado.

Para esos exchanges, ccxt realizará una corrección, intercambiando y normalizando los lados de las divisas base y de cotización al analizar las respuestas del exchange. Esta lógica es financiera y terminológicamente correcta. Si quiere menos confusión, recuerde la siguiente regla: **la base siempre está antes de la barra diagonal, la cotización siempre está después de la barra diagonal en cualquier símbolo y en cualquier mercado**.

```text
base currency ↓
             BTC / USDT
             ETH / BTC
            DASH / ETH
                    ↑ quote currency
```

#### Convenciones De Nomenclatura Para Contratos

Actualmente cargamos los mercados spot con el esquema de símbolos unificado `BASE/QUOTE` en el mapeo `.markets`, indexado por símbolo. Esto causaría un conflicto de nomenclatura para los futuros y otros derivados que tienen el mismo símbolo que sus contrapartes del mercado spot. Para acomodar ambos tipos de mercados en el `.markets`, requerimos que los símbolos entre los mercados 'future' y 'spot' sean distintos, así como los símbolos entre contratos 'linear' e 'inverse' sean distintos.

**Por favor, consulte este anuncio: [Unified contract naming conventions](https://github.com/ccxt/ccxt/issues/10931)**

CCXT soporta los siguientes tipos de contratos de derivados:

- `future` – para contratos de futuros con vencimiento que tienen una fecha de entrega/liquidación [](https://en.wikipedia.org/wiki/Futures_contract)
- `swap` – para futuros swap perpetuos que no tienen fecha de entrega [](https://en.wikipedia.org/wiki/Perpetual_futures)
- `option` – para contratos de opciones (https://en.wikipedia.org/wiki/Option_contract)

##### Future

El símbolo de un mercado de futuros consta de la divisa subyacente, la divisa de cotización, la divisa de liquidación y un identificador arbitrario. Con mayor frecuencia, el identificador es la fecha de liquidación del contrato de futuros en formato `YYMMDD`:

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

##### Swap Perpetuo (Futuro Perpetuo)

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

##### Opción

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

### Redes Unificadas

| Red | Código CCXT  |
|---------------------------------------|--------------|
| Bitcoin                               | BTC          |
| Ethereum                              | ETH (Para Ethereum) / ERC20 (Para Tokens)          |
| Ripple                                | XRP          |
| Litecoin                              | LTC          |
| Dogecoin                              | DOGE         |
| Stellar                               | XLM          |
| Tron                                  | TRX (Para TRX) / TRC20 (Para Tokens)         |
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

## Recarga Forzada de la Caché de Mercados

`loadMarkets () / load_markets ()` también es un método impuro con el efecto secundario de guardar el array de mercados en la instancia del exchange. Solo necesitas llamarlo una vez por exchange. Todas las llamadas posteriores al mismo método devolverán el array de mercados guardado localmente (en caché).

Cuando los mercados del exchange están cargados, puedes acceder a la información de mercado en cualquier momento a través de la propiedad `markets`. Esta propiedad contiene un array asociativo de mercados indexados por símbolo. Si necesitas forzar la recarga de la lista de mercados después de haberlos cargado, pasa el indicador reload = true al mismo método de nuevo.


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


# API Implícita

- [Métodos de API / Endpoints](#api-methods--endpoints)
- [Métodos de API Implícitos](#implicit-api-methods)
- [API Pública/Privada](#publicprivate-api)
- [Llamadas Síncronas vs Asíncronas](#synchronous-vs-asynchronous-calls)
- [Pasar Parámetros a los Métodos de API](#passing-parameters-to-api-methods)

## Métodos de API / Endpoints

Cada exchange ofrece un conjunto de métodos de API. Cada método de la API se denomina *endpoint*. Los endpoints son URLs HTTP para consultar distintos tipos de información. Todos los endpoints devuelven JSON en respuesta a las solicitudes del cliente.

Por lo general, hay un endpoint para obtener una lista de mercados de un exchange, un endpoint para recuperar un libro de órdenes de un mercado particular, un endpoint para recuperar el historial de operaciones, endpoints para colocar y cancelar órdenes, para depósitos y retiros de dinero, etc. Básicamente, cada tipo de acción que podrías realizar dentro de un exchange particular tiene una URL de endpoint separada ofrecida por la API.

Dado que el conjunto de métodos difiere de un exchange a otro, la biblioteca ccxt implementa lo siguiente:
- una API pública y privada para todas las URLs y métodos posibles
- una API unificada que admite un subconjunto de métodos comunes

Las URLs de los endpoints están predefinidas en la propiedad `api` de cada exchange. No tienes que sobreescribirla, a menos que estés implementando una nueva API de exchange (al menos deberías saber lo que estás haciendo).

La mayoría de los métodos de API específicos de cada exchange son implícitos, lo que significa que no están definidos explícitamente en ningún lugar del código. La biblioteca implementa un enfoque declarativo para definir los métodos de API implícitos (no unificados) de los exchanges.

## Métodos de API Implícitos

Cada método de la API generalmente tiene su propio endpoint. La biblioteca define todos los endpoints de cada exchange particular en la propiedad `.api`. Durante la construcción del exchange, se creará un método *mágico* implícito (también conocido como *función parcial* o *clausura*) dentro de `defineRestApi()/define_rest_api()` en la instancia del exchange por cada endpoint de la lista de endpoints `.api`. Esto se realiza de manera universal para todos los exchanges. Cada método generado será accesible en notación `camelCase` y `under_score`.

La definición de endpoints es una **lista completa de TODAS las URLs de API** expuestas por un exchange. Esta lista se convierte en métodos invocables al instanciar el exchange. Cada URL en la lista de endpoints de la API obtiene un método invocable correspondiente. Esto se hace automáticamente para todos los exchanges, por lo que la biblioteca ccxt admite **todas las URLs posibles** ofrecidas por los exchanges de criptomonedas.

Cada método implícito obtiene un nombre único que se construye a partir de la definición `.api`. Por ejemplo, un endpoint privado HTTPS PUT `https://api.exchange.com/order/{id}/cancel` tendrá un método de exchange correspondiente llamado `.privatePutOrderIdCancel()`/`.private_put_order_id_cancel()`. Un endpoint público HTTPS GET `https://api.exchange.com/market/ticker/{pair}` daría como resultado el método correspondiente llamado `.publicGetTickerPair()`/`.public_get_ticker_pair()`, y así sucesivamente.

Un método implícito recibe un diccionario de parámetros, envía la solicitud al exchange y devuelve un resultado JSON específico del exchange de la API **tal cual, sin procesar**. Para pasar un parámetro, agrégalo al diccionario explícitamente bajo una clave igual al nombre del parámetro. Para los ejemplos anteriores, esto se vería como `.privatePutOrderIdCancel ({ id: '41987a2b-...' })` y `.publicGetTickerPair ({ pair: 'BTC/USD' })`.

La forma recomendada de trabajar con exchanges no es usar los métodos implícitos específicos del exchange, sino usar los métodos unificados de ccxt en su lugar. Los métodos específicos del exchange deben usarse como alternativa en los casos en que el método unificado correspondiente no esté disponible (todavía).

Para obtener una lista de todos los métodos disponibles con una instancia de exchange, incluidos los métodos implícitos y los métodos unificados, puedes simplemente hacer lo siguiente:

```text
console.log (new ccxt.kraken ())   // JavaScript
print(dir(ccxt.kraken()))           # Python
var_dump (new \ccxt\kraken ()); // PHP
```

## API Pública/Privada

Las URLs de la API a menudo se agrupan en dos conjuntos de métodos denominados *API pública* para datos de mercado y *API privada* para operaciones y acceso a la cuenta. Estos grupos de métodos de API generalmente tienen como prefijo la palabra 'public' o 'private'.

Una API pública se utiliza para acceder a datos de mercado y no requiere ningún tipo de autenticación. La mayoría de los exchanges proporcionan datos de mercado abiertamente a todos (bajo su límite de velocidad). Con la biblioteca ccxt, cualquiera puede acceder a los datos de mercado de forma inmediata sin necesidad de registrarse en los exchanges ni configurar claves y contraseñas de cuenta.

Las APIs públicas incluyen lo siguiente:

- instrumentos/pares de trading
- feeds de precios (tipos de cambio)
- libros de órdenes (L1, L2, L3...)
- historial de operaciones (órdenes cerradas, transacciones, ejecuciones)
- tickers (precio spot / 24h)
- series OHLCV para gráficos
- otros endpoints públicos

La API privada se utiliza principalmente para operar y para acceder a datos privados específicos de la cuenta, por lo que requiere autenticación. Debes obtener las claves de API privada de los exchanges. A menudo esto implica registrarse en el sitio web de un exchange y crear las claves de API para tu cuenta. La mayoría de los exchanges requieren información personal o identificación. Algunos exchanges solo permitirán operar después de completar la verificación KYC.
Las APIs privadas permiten lo siguiente:

- gestionar información personal de la cuenta
- consultar saldos de la cuenta
- operar realizando órdenes de mercado y límite
- crear direcciones de depósito y financiar cuentas
- solicitar el retiro de fondos en fiat y criptomonedas
- consultar órdenes abiertas/cerradas personales
- consultar posiciones en trading con margen/apalancamiento
- obtener el historial del libro mayor
- transferir fondos entre cuentas
- usar servicios de comercio

Algunos exchanges ofrecen la misma lógica con diferentes nombres. Por ejemplo, una API pública también se llama frecuentemente *market data*, *basic*, *market*, *mapi*, *api*, *price*, etc. Todas ellas significan un conjunto de métodos para acceder a datos disponibles al público. Una API privada también se llama frecuentemente *trading*, *trade*, *tapi*, *exchange*, *account*, etc.

Algunos exchanges también exponen una API de comercio que te permite crear facturas y aceptar pagos en criptomonedas y fiat de tus clientes. Este tipo de API a menudo se llama *merchant*, *wallet*, *payment*, *ecapi* (para comercio electrónico).

Para obtener una lista de todos los métodos disponibles con una instancia de exchange, puedes simplemente hacer lo siguiente:

```text
console.log (new ccxt.kraken ())   // JavaScript
print(dir(ccxt.kraken()))           # Python
var_dump (new \ccxt\kraken ()); // PHP
```

**solo contratos y solo margen**

- los métodos en esta documentación que están documentados como **solo contratos** o **solo margen** están destinados únicamente a ser utilizados para el trading de contratos y el trading con margen, respectivamente. Pueden funcionar al operar en otros tipos de mercados, pero lo más probable es que devuelvan información irrelevante.

## Llamadas Síncronas vs Asíncronas


#### **Javascript**

En la versión JavaScript de CCXT, todos los métodos son asíncronos y devuelven [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) que se resuelven con un objeto JSON decodificado. En CCXT usamos la sintaxis moderna *async/await* para trabajar con Promises. Si no estás familiarizado con esa sintaxis, puedes leer más sobre ella [aquí](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function).

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

La biblioteca ccxt admite el modo de concurrencia asíncrona en Python 3.5+ con sintaxis async/await. La versión asíncrona de Python usa [asyncio](https://docs.python.org/3/library/asyncio.html) puro con [aiohttp](http://aiohttp.readthedocs.io). En modo asíncrono tienes todas las mismas propiedades y métodos, pero la mayoría de los métodos están decorados con la palabra clave async. Si quieres usar el modo async, debes enlazar con el subpaquete `ccxt.async_support`, como en el siguiente ejemplo:

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

CCXT admite versiones PHP 8+. La biblioteca tiene versiones tanto síncronas como asíncronas. Para usar la versión síncrona, usa el namespace `\ccxt` (es decir, `new ccxt\binance()`) y para usar la versión asíncrona, usa el namespace `\ccxt\async` (es decir, `new ccxt\async\binance()`). La versión asíncrona usa la biblioteca [ReactPHP](https://reactphp.org/) en segundo plano. En modo async tienes todas las mismas propiedades y métodos, pero cualquier método de API de red debe estar decorado con la palabra clave `\React\Async\await` y tu script debe estar en un contenedor ReactPHP:
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

Consulta más ejemplos en el directorio `examples/php`; busca nombres de archivo que incluyan la palabra `async`. Además, asegúrate de haber instalado las dependencias requeridas usando `composer require recoil/recoil clue/buzz-react react/event-loop recoil/react react/http`. Por último, [este artículo](https://sergeyzhuk.me/2018/10/26/from-promise-to-coroutines/) proporciona una buena introducción a los métodos utilizados aquí. Aunque sintácticamente el cambio es simple (es decir, solo usar la palabra clave `yield` antes de los métodos relevantes), la concurrencia tiene implicaciones significativas para el diseño general de tu código.

#### **Go**

En Go, cada método de red es síncrono y devuelve un par `(value, error)` — no hay variante asíncrona. Siempre verifica el `error` devuelto antes de usar el valor:

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

En C#, cada método de red es asíncrono y devuelve un `Task<T>` al que le aplicas `await`. Los métodos unificados usan `async`/`await` nativo:

```csharp
// C#

var exchange = new Kraken();
var ticker = await exchange.FetchTicker("ETH/BTC");
Console.WriteLine(exchange.id + " " + ticker.last);
```

#### **Java**

En Java, cada exchange tiene su propia subclase tipada. Cada método tipado incluye
**tanto** una sobrecarga síncrona bloqueante como una sobrecarga asíncrona que devuelve `CompletableFuture`
— simétricas para REST `fetch*` / `fetch*Async` y WS `watch*` /
`watch*Async`:

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

El mismo par síncrono/asíncrono se aplica a las clases pro (WebSocket) — `watchTicker`
bloquea esperando una actualización; `watchTickerAsync` devuelve un `CompletableFuture<Ticker>`
que se completa en la siguiente actualización:

```java
import io.github.ccxt.exchanges.pro.Binance;

var ws = new Binance();
ws.loadMarkets(false);

// WS — synchronous (blocks for one update)
Ticker tick = ws.watchTicker("BTC/USDT");

// WS — asynchronous (composable with allOf, anyOf, thenApply, ...)
CompletableFuture<Ticker> stream = ws.watchTickerAsync("BTC/USDT", null);
```


### Objetos JSON Devueltos

Todos los métodos de API públicos y privados devuelven objetos JSON decodificados en bruto en respuesta de los exchanges, tal cual, sin modificar. La API unificada devuelve objetos decodificados JSON en un formato común y estructurados de manera uniforme en todos los exchanges.

## Pasar Parámetros a los Métodos de API

El conjunto de todos los endpoints de API posibles difiere de un exchange a otro. La mayoría de los métodos aceptan un único array asociativo (o un dict de Python) de parámetros clave-valor. Los parámetros se pasan de la siguiente manera:

```text
bitso.publicGetTicker ({ book: 'eth_mxn' })                 // JavaScript
ccxt.zaif().public_get_ticker_pair ({ 'pair': 'btc_jpy' })  # Python
$luno->public_get_ticker (array ('pair' => 'XBTIDR'));      // PHP
```

Los métodos unificados de los exchanges pueden esperar y aceptarán varios `params` que afectan su funcionalidad, como:

```python
params = {'type':'margin', 'isIsolated': 'TRUE'}  # --------------┑
# params will go as the last argument to the unified method       |
#                                                                 v
binance.create_order('BTC/USDT', 'limit', 'buy', amount, price, params)
```

Un exchange no aceptará los parámetros de un exchange diferente, no son intercambiables. La lista de parámetros aceptados está definida por cada exchange específico.

Para saber qué parámetros se pueden pasar a un método unificado:

- abre el archivo de [implementación específica del exchange](https://github.com/ccxt/ccxt/tree/master/js) y busca la función deseada (es decir, `createOrder`) para inspeccionar y conocer los detalles del uso de `params`
- o ve a la documentación de la API del exchange y lee la lista de parámetros para tu función o endpoint específico (es decir, `order`)

Para una lista completa de los parámetros de método aceptados por cada exchange, consulte la [documentación de la API](#exchanges).

### Convenciones de nomenclatura de métodos de la API

El nombre de un método de exchange es una cadena concatenada que consiste en el tipo (public o private), el método HTTP (GET, POST, PUT, DELETE) y la ruta de la URL del endpoint, como en los siguientes ejemplos:

| Nombre del método            | URL base de la API             | URL del endpoint               |
|------------------------------|--------------------------------|--------------------------------|
| publicGetIdOrderbook         | https://bitbay.net/API/Public  | {id}/orderbook                 |
| publicGetPairs               | https://bitlish.com/api        | pairs                          |
| publicGetJsonMarketTicker    | https://www.bitmarket.net      | json/{market}/ticker           |
| privateGetUserMargin         | https://bitmex.com             | user/margin                    |
| privatePostTrade             | https://btc-x.is/api           | trade                          |
| tapiCancelOrder              | https://yobit.net              | tapi/CancelOrder               |
| ...                          | ...                            | ...                            |

La biblioteca ccxt admite tanto la notación camelCase (preferida en JavaScript) como la notación con guión bajo (preferida en Python y PHP), por lo tanto todos los métodos pueden llamarse en cualquiera de las dos notaciones o estilos de codificación en cualquier lenguaje. Ambas notaciones funcionan en JavaScript, Python y PHP:

```text
exchange.methodName ()  // camelcase pseudocode
exchange.method_name()  // underscore pseudocode
```

Para obtener una lista de todos los métodos disponibles de una instancia de exchange, simplemente puede hacer lo siguiente:

```text
console.log (new ccxt.kraken ())   // JavaScript
print(dir(ccxt.hitbtc()))           # Python
var_dump (new \ccxt\okcoin ()); // PHP
```

# API Unificada

- [Sobreescribir parámetros de la API Unificada](#overriding-unified-api-params)
- [Paginación](#pagination)
- [Paginación automática](#automatic-pagination)

La API unificada de ccxt es un subconjunto de métodos comunes entre los exchanges. Actualmente contiene los siguientes métodos:

- `fetchMarkets ()`: Obtiene una lista de todos los mercados disponibles de un exchange y devuelve un array de objetos Market tal como se define en la [estructura Market](#market-structure) (con propiedades como `symbol`, `base`, `quote`, etc.). Algunos exchanges no disponen de medios para obtener una lista de mercados a través de su API en línea. Para esos, la lista de mercados está codificada de forma fija.
- `fetchCurrencies ()`: Obtiene todas las divisas disponibles de un exchange y devuelve un diccionario asociativo de divisas (objetos con propiedades como `code`, `name`, etc.). Algunos exchanges no disponen de medios para obtener divisas a través de su API en línea. Para esos, las divisas se extraerán de los pares de mercado o estarán codificadas de forma fija.
- `loadMarkets ([reload])`: Devuelve la lista de mercados como un objeto indexado por símbolo y la almacena en caché con la instancia del exchange. Devuelve los mercados en caché si ya se han cargado, a menos que se fuerce el indicador `reload = true`.
- `fetchOrderBook (symbol, limit = undefined, params = {})`: Obtiene el libro de órdenes L2/L3 para un símbolo de trading de mercado particular.
- `fetchStatus (params = {})`: Devuelve información sobre el estado del exchange, ya sea desde la información codificada de forma fija en la instancia del exchange o desde la API, si está disponible.
- `fetchL2OrderBook (symbol, limit = undefined, params)`: Libro de órdenes de nivel 2 (agregado por precio) para un símbolo particular.
- `fetchTrades (symbol, since, limit, params)`: Obtiene operaciones recientes para un símbolo de trading particular.
- `fetchTicker (symbol)`: Obtiene los últimos datos del ticker por símbolo de trading.
- `fetchBalance ()`: Obtiene el saldo.
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

## Sobreescribir parámetros de la API Unificada

Tenga en cuenta que la mayoría de los métodos de la API unificada aceptan un argumento opcional `params`. Es un array asociativo (un diccionario, vacío por defecto) que contiene los parámetros que desea sobreescribir. El contenido de `params` es específico de cada exchange; consulte la documentación de la API de los exchanges para conocer los campos y valores admitidos. Utilice el diccionario `params` si necesita pasar una configuración personalizada o un parámetro opcional a su consulta unificada.


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


## Paginación

La mayoría de los métodos unificados devolverán un único objeto o un array plano (una lista) de objetos (operaciones, órdenes, transacciones, etc.). Sin embargo, muy pocos exchanges (si es que hay alguno) devolverán todas las órdenes, todas las operaciones, todas las velas OHLCV o todas las transacciones a la vez. La mayoría de sus APIs `limit` la salida a un cierto número de objetos más recientes. **NO PUEDE OBTENER TODOS LOS OBJETOS DESDE EL INICIO DE LOS TIEMPOS HASTA EL MOMENTO PRESENTE EN UNA SOLA LLAMADA**. En la práctica, muy pocos exchanges lo tolerarán o permitirán.

Para obtener órdenes u operaciones históricas, el usuario necesitará recorrer los datos en porciones o "páginas" de objetos. La paginación a menudo implica *"obtener porciones de datos una por una"* en un bucle.

En la mayoría de los casos, los usuarios están **obligados a usar al menos algún tipo de paginación** para obtener los resultados esperados de forma consistente. Si el usuario no aplica ninguna paginación, la mayoría de los métodos devolverán el valor predeterminado del exchange, que puede comenzar desde el inicio del historial o puede ser un subconjunto de los objetos más recientes. ¡El comportamiento predeterminado (sin paginación) es específico de cada exchange! Los medios de paginación se utilizan a menudo con los siguientes métodos en particular:

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

Con los métodos que devuelven listas de objetos, los exchanges pueden ofrecer uno o más tipos de paginación. CCXT unifica la **paginación basada en fechas** de forma predeterminada, con marcas de tiempo **en milisegundos** en toda la biblioteca.


### Paginación automática

*Advertencia: esta es una función experimental y podría producir resultados inesperados/incorrectos en algunos casos.*

Recientemente, CCXT introdujo una forma de paginar automáticamente a través de varios resultados simplemente proporcionando el indicador `paginate` dentro de `params,` liberando este trabajo del código del usuario. La mayoría de los exchanges principales lo admiten, y se añadirán más en el futuro, pero la forma más sencilla de verificarlo es buscar en la documentación del método el parámetro *pagination*. Como siempre hay excepciones, y algunos endpoints pueden no proporcionar una forma de paginar ni a través de una marca de tiempo ni de un cursor; en esos casos, CCXT no puede hacer nada al respecto.


Ahora mismo, tenemos tres formas diferentes de paginar:
- **dinámica/basada en tiempo**: utiliza los parámetros `until` y `since` para paginar a través de resultados dinámicos como (operaciones, órdenes, transacciones, etc). Como no sabemos a priori cuántas entradas están disponibles para obtener, realizará una solicitud a la vez hasta llegar al final de los datos o al número máximo de llamadas de paginación (configurable a través de una opción)
- **determinista**: cuando podemos pre-calcular los límites de cada página, realizará las solicitudes de forma concurrente para obtener el máximo rendimiento. Esto aplica a OHLCV, tasas de financiación e interés abierto, y también respeta la opción `paginationCalls`.
- **basada en cursor**: cuando el exchange proporciona un cursor dentro de la respuesta, extraemos el cursor y realizamos la solicitud siguiente hasta el final de los datos o hasta alcanzar el número máximo de llamadas de paginación.

El usuario no puede seleccionar el método de paginación utilizado; dependerá de la implementación en cuestión, teniendo en cuenta las características de la API del exchange.

#### Parámetros de paginación

No podemos realizar una cantidad infinita de solicitudes, y algunas de ellas pueden arrojar un error por diferentes razones; por ello, tenemos algunas opciones que permiten al usuario controlar estas variables y otras especificidades de la paginación.

*Todas las opciones a continuación deben proporcionarse dentro de `params`; puede consultar los ejemplos a continuación*

- **paginate**: (**booleano**) indica que el usuario desea paginar a través de diferentes páginas para obtener más datos. El valor predeterminado es *false*.
- **paginationCalls**: (**entero**) permite al usuario controlar la cantidad máxima de solicitudes para paginar los datos. Debido a los límites de velocidad, este valor no debería ser demasiado alto. El valor predeterminado es 10.
- **maxRetries**: (**entero**) cuántas veces debe reintentar el mecanismo de paginación al recibir un error. El valor predeterminado es 3.
- **paginationDirection**: (**cadena**) solo aplica a la paginación dinámica y puede ser *forward* (iniciar la paginación desde algún momento en el pasado y paginar hacia adelante) o *backward* (iniciar desde el momento más reciente y paginar hacia atrás). Si se selecciona *forward*, también debe proporcionarse un parámetro *since*. El valor predeterminado es *backward*.
- **maxEntriesPerRequest**: (**entero**): La cantidad máxima de entradas por solicitud para maximizar los datos recuperados por llamada. Varía de endpoint a endpoint y CCXT lo completará por usted, pero puede sobreescribirlo si es necesario.

#### Ejemplos

```python

trades = await binance.fetch_trades("BTC/USDT", params = {"paginate": True}) # dynamic/time-based

ohlcv = await binance.fetch_ohlcv("BTC/USDT", params = {"paginate": True, "paginationCalls": 5}) # deterministic-pagination will perform 5 requests

trades = await binance.fetch_trades("BTC/USDT", since = 1664812416000, params = {"paginate": True, "paginationDirection": "forward"}) # dynamic/time-based pagination starting from 1664812416000

ledger = await bybit.fetch_ledger(params = {"paginate": True}) # bybit returns a cursor so the pagination will be cursor-based

funding_rates = await binance.fetch_funding_rate_history("BTC/USDT:USDT", params = {"paginate": True, "maxEntriesPerRequest": 50}) # customizes the number of entries per request

```


### Trabajo con fechas y marcas de tiempo

Todas las marcas de tiempo unificadas en toda la biblioteca CCXT son números enteros **en milisegundos** salvo que se indique explícitamente lo contrario.

A continuación se muestra el conjunto de métodos para trabajar con fechas UTC y marcas de tiempo y para convertir entre ellas:

```javascript
exchange.parse8601 ('2018-01-01T00:00:00Z') == 1514764800000 // integer in milliseconds, Z = UTC
exchange.iso8601 (1514764800000) == '2018-01-01T00:00:00Z'   // from milliseconds to iso8601 string
exchange.seconds ()      // integer UTC timestamp in seconds
exchange.milliseconds () // integer UTC timestamp in milliseconds
```

### Paginación basada en fechas

Este es el tipo de paginación que se utiliza actualmente en toda la API Unificada de CCXT. El usuario suministra una marca de tiempo `since` **en milisegundos** (!) y un número para `limit` de resultados. Para recorrer los objetos de interés página por página, el usuario ejecuta lo siguiente (a continuación se muestra pseudocódigo; puede requerir sobreescribir algunos parámetros específicos del exchange, según el exchange en cuestión):

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


### Paginación basada en ID

El usuario proporciona un `from_id` del objeto desde donde la consulta debe continuar devolviendo resultados, y un número para `limit` los resultados. Este es el valor predeterminado en algunos exchanges; sin embargo, este tipo aún no está unificado. Para paginar objetos basándose en sus ids, el usuario ejecutaría lo siguiente:


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


### Paginación basada en número de página (Cursor)

El usuario proporciona un número de página o un valor de *"cursor" inicial*. El exchange devuelve una página de resultados y el valor del *"cursor" siguiente* para continuar. La mayoría de los exchanges que implementan este tipo de paginación devolverán el cursor siguiente dentro de la propia respuesta o dentro de las cabeceras de la respuesta HTTP.

Consulte un ejemplo de implementación aquí: https://github.com/ccxt/ccxt/blob/master/examples/py/coinbasepro-fetch-my-trades-pagination.py

En cada iteración del bucle, el usuario debe tomar el cursor siguiente e introducirlo en los parámetros sobreescritos para la siguiente consulta (en la iteración siguiente):


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


# API Pública

- [Libro de Órdenes](#order-book)
- [Tickers de Precio](#price-tickers)
- [Gráficos de Velas OHLCV](#ohlcv-candlestick-charts)
- [Operaciones Públicas](#public-trades)
- [Hora del Exchange](#exchange-time)
- [Estado del Exchange](#exchange-status)
- [Tasas de Préstamo](#borrow-rates)
- [Historial de Tasas de Préstamo](#borrow-rate-history)
- [Niveles de Apalancamiento](#leverage-tiers)
- [Tasa de Financiación](#funding-rate)
- [Historial de Tasas de Financiación](#funding-rate-history)
- [Historial de Interés Abierto](#open-interest-history)
- [Historial de Volatilidad](#volatility-history)
- [Activos Subyacentes](#underlying-assets)
- [Liquidaciones](#liquidations)
- [Griegas](#greeks)
- [Cadena de Opciones](#option-chain)
- [Desapalancamiento Automático](#auto-de-leverage)

## Libro de Órdenes

Los exchanges exponen información sobre órdenes abiertas con precios de compra (bid) y venta (ask), volúmenes y otros datos. Generalmente existe un endpoint separado para consultar el estado actual (marco de pila) del *libro de órdenes* para un mercado particular. El libro de órdenes también se denomina frecuentemente *profundidad de mercado*. La información del libro de órdenes se utiliza en el proceso de toma de decisiones de trading.

Para obtener datos sobre libros de órdenes, puede usar

- `fetchOrderBook ()` // para el libro de órdenes de un único mercado
- `fetchOrderBooks ( symbols )` // para los libros de órdenes de múltiples mercados
- `fetchOrderBooks ()` // para los libros de órdenes de todos los mercados

```javascript
async fetchOrderBook (symbol, limit = undefined, params = {})
```

Parámetros

- **symbol** (String) *requerido* Símbolo unificado de CCXT (p. ej. `"BTC/USDT"`)
- **limit** (Integer) El número de órdenes a devolver en el libro de órdenes (p. ej. `10`)
- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Devuelve

- Una [estructura de libro de órdenes](#order-book-structure)

```javascript
async fetchOrderBooks (symbols = undefined, limit = undefined, params = {})
```

Parámetros

- **symbols** (\[String\]) Símbolos unificados de CCXT (p. ej. `["BTC/USDT", "ETH/USDT"]`)
- **limit** (Integer) El número de órdenes a devolver en el libro de órdenes (p. ej. `10`)
- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Devuelve

- Un diccionario de [estructuras de libro de órdenes](#order-book-structure) indexado por símbolos de mercado

### Ejemplos de fetchOrderBook


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


### Estructura del Libro de Órdenes

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

**La marca de tiempo y la fecha/hora pueden estar ausentes (`undefined/None/null`) si el exchange en cuestión no proporciona un valor correspondiente en la respuesta de la API.**

Los precios y las cantidades son números de punto flotante. El array de bids está ordenado por precio de forma descendente. El mejor precio bid (el más alto) es el primer elemento y el peor precio bid (el más bajo) es el último elemento. El array de asks está ordenado por precio de forma ascendente. El mejor precio ask (el más bajo) es el primer elemento y el peor precio ask (el más alto) es el último elemento. Los arrays de bids/asks pueden estar vacíos si no hay órdenes correspondientes en el libro de órdenes de un exchange.

Los exchanges pueden devolver la pila de órdenes con distintos niveles de detalle para su análisis. Puede ser con detalle completo, conteniendo cada orden individual, o bien agregado con algo menos de detalle donde las órdenes se agrupan y fusionan por precio y volumen. Un mayor detalle requiere más tráfico y ancho de banda y es más lento en general, pero ofrece el beneficio de una mayor precisión. Un menor detalle es generalmente más rápido, pero puede no ser suficiente en algunos casos muy específicos.

### Notas sobre la Estructura del Libro de Órdenes

- El `orderbook['timestamp']` es el momento en que el exchange generó esta respuesta del libro de órdenes (antes de devolvérsela). Puede estar ausente (`undefined/None/null`), tal como se documenta en el Manual; no todos los exchanges proporcionan una marca de tiempo en ese campo. Si está definido, es la marca de tiempo UTC **en milisegundos** desde el 1 de enero de 1970 00:00:00.
- Algunos exchanges pueden indexar las órdenes del libro de órdenes por ids de orden; en ese caso, el id de la orden puede devolverse como el tercer elemento de bids y asks: `[ price, amount, id ]`. Esto es frecuente en libros de órdenes L3 sin agregación. El `id` de la orden, si aparece en el libro de órdenes, hace referencia al libro de órdenes y no corresponde necesariamente al id real de la orden de la base de datos del exchange tal como lo ve el propietario o los demás. El id de la orden es un `id` de la fila dentro del libro de órdenes, pero no necesariamente el verdadero `id` de la orden (aunque pueden ser iguales también, dependiendo del exchange en cuestión).
- En algunos casos, los exchanges pueden proporcionar libros de órdenes L2 agregados con conteo de órdenes para cada nivel agregado; en ese caso, el conteo de órdenes puede devolverse como el tercer elemento de bids y asks: `[ price, amount, count ]`. El `count` indica cuántas órdenes están agregadas en cada nivel de precio en bids y asks.
- Además, algunos exchanges pueden devolver la marca de tiempo de la orden como el tercer elemento de bids y asks: `[ price, amount, timestamp ]`. El `timestamp` indica cuándo se colocó la orden en el libro de órdenes.

### Profundidad de Mercado

Algunos exchanges aceptan un diccionario de parámetros adicionales para la función `fetchOrderBook () / fetch_order_book ()`. **Todos los `params` adicionales son específicos del exchange (no unificados)**. Deberá consultar la documentación del exchange si desea sobreescribir un parámetro particular, como la profundidad del libro de órdenes. Puede obtener un número limitado de órdenes devueltas o un nivel deseado de agregación (también conocido como *profundidad de mercado*) especificando un argumento limit y parámetros `params` adicionales específicos del exchange de la siguiente manera:


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


Los niveles de detalle o niveles de agregación del libro de órdenes se etiquetan frecuentemente con números como L1, L2, L3...

- **L1**: menos detalle para obtener rápidamente información muy básica, concretamente solo el precio de mercado. Aparece como si hubiera una sola orden en el libro de órdenes.
- **L2**: el nivel de agregación más común donde los volúmenes de órdenes se agrupan por precio. Si dos órdenes tienen el mismo precio, aparecen como una única orden por un volumen igual a su suma total. Es muy probable que este sea el nivel de agregación que necesite para la mayoría de los propósitos.
- **L3**: el nivel de mayor detalle sin agregación donde cada orden está separada de las demás. Este LOD contiene naturalmente duplicados en la salida. Por tanto, si dos órdenes tienen precios iguales **no** se fusionan y es el motor de matching del exchange quien decide su prioridad en la pila. Realmente no necesita el detalle L3 para operar con éxito. De hecho, lo más probable es que no lo necesite en absoluto. Por ello, algunos exchanges no lo soportan y siempre devuelven libros de órdenes agregados.

Si desea obtener un libro de órdenes L2, independientemente de lo que devuelva el exchange, utilice el método unificado `fetchL2OrderBook(symbol, limit, params)` o `fetch_l2_order_book(symbol, limit, params)` para ello.

El argumento `limit` no garantiza que el número de bids o asks sea siempre igual a `limit`. Designa el límite superior o el máximo, por lo que en algún momento puede haber menos de `limit` bids o asks. Esto ocurre cuando el exchange no tiene suficientes órdenes en el libro de órdenes. Sin embargo, si la API del exchange subyacente no soporta en absoluto un parámetro `limit` para el endpoint del libro de órdenes, entonces el argumento `limit` será ignorado. CCXT no recorta `bids` ni `asks` si el exchange devuelve más de lo que solicita.

### Precio de Mercado

Para obtener el mejor precio actual (consultar el precio de mercado) y calcular el spread bid/ask, tome los primeros elementos de bid y ask, de la siguiente manera:


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


## Tickers de Precio

Un ticker de precio contiene estadísticas de un mercado/símbolo particular durante un período de tiempo reciente, generalmente las últimas 24 horas. A continuación se describen los métodos para obtener tickers.

### Un Único Ticker Para Un Símbolo

```javascript
// one ticker
fetchTicker (symbol, params = {})

// example
fetchTicker ('ETH/BTC')
fetchTicker ('BTC/USDT')
```

### Múltiples Tickers Para Todos o Muchos Símbolos

```javascript
// multiple tickers
fetchTickers (symbols = undefined, params = {})  // for all tickers at once

// for example
fetchTickers () // all symbols
fetchTickers ([ 'ETH/BTC', 'BTC/USDT' ]) // an array of specific symbols
```

Compruebe las propiedades `exchange.has['fetchTicker']` y `exchange.has['fetchTickers']` de la instancia del exchange para determinar si el exchange en cuestión soporta estos métodos.

**Tenga en cuenta que llamar a `fetchTickers ()` sin un símbolo generalmente tiene límites de tasa estrictos; un exchange puede banearle si consulta ese endpoint con demasiada frecuencia.**

### Estructura del Ticker

Un ticker es un cálculo estadístico con la información calculada durante las últimas 24 horas para un mercado específico.

La estructura de un ticker es la siguiente:

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

#### Notas sobre la Estructura del Ticker

- Todos los campos del ticker representan las 24 horas anteriores al `timestamp`.
- El `bidVolume` es el volumen (cantidad) del mejor bid actual en el libro de órdenes.
- El `askVolume` es el volumen (cantidad) del mejor ask actual en el libro de órdenes.
- El `baseVolume` es la cantidad de moneda base negociada (comprada o vendida) en las últimas 24 horas.
- El `quoteVolume` es la cantidad de moneda de cotización negociada (comprada o vendida) en las últimas 24 horas.

**Todos los precios en la estructura del ticker están en moneda de cotización. Algunos campos en una estructura de ticker devuelta pueden ser undefined/None/null.**

```text
base currency ↓
             BTC / USDT
             ETH / BTC
            DASH / ETH
                    ↑ quote currency
```

La marca de tiempo y la fecha/hora son ambas Tiempo Universal Coordinado (UTC) en milisegundos.

- `ticker['timestamp']` es el momento en que el exchange generó esta respuesta (antes de devolvérsela). Puede estar ausente (`undefined/None/null`), tal como se documenta en el Manual; no todos los exchanges proporcionan una marca de tiempo en ese campo. Si está definido, es una marca de tiempo UTC **en milisegundos** desde el 1 de enero de 1970 00:00:00.
- `exchange.last_response_headers['Date']` es la cadena de fecha y hora de la última respuesta HTTP recibida (de las cabeceras HTTP). El analizador de 'Date' debe respetar la zona horaria indicada en ella. La precisión de la fecha y hora es de 1 segundo, 1000 milisegundos. Esta fecha debe ser establecida por el servidor del exchange cuando se originó el mensaje de acuerdo con los siguientes estándares:
    - https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.18
    - https://tools.ietf.org/html/rfc1123#section-5.2.14
    - https://tools.ietf.org/html/rfc822#section-5

Aunque algunos exchanges mezclan los precios del bid/ask más alto del libro de órdenes en sus tickers (e incluso algunos exchanges sirven los volúmenes del bid/ask más alto), no debe tratar un ticker como un sustituto de `fetchOrderBook`. El propósito principal de un ticker es proporcionar datos estadísticos; como tal, trátelo como un "OHLCV en vivo de 24h". Es conocido que los exchanges desalientan las solicitudes frecuentes de `fetchTicker` imponiendo límites de tasa más estrictos en estas consultas. Si necesita una forma unificada de acceder a bids y asks, debería usar la familia `fetchL[123]OrderBook` en su lugar.

Para obtener precios y volúmenes históricos, utiliza el método unificado [`fetchOHLCV`](#ohlcv-candlestick-charts) donde esté disponible. Para obtener precios históricos de mark, index y premium index, añade uno de `'price': 'mark'`, `'price': 'index'`, `'price': 'premiumIndex'` respectivamente a los [params-overrides](#overriding-unified-api-params) de `fetchOHLCV`. También existen métodos de conveniencia `fetchMarkPriceOHLCV`, `fetchIndexPriceOHLCV` y `fetchPremiumIndexOHLCV` que obtienen los precios y volúmenes históricos de mark, index y premiumIndex.

Métodos para obtener tickers:

- `fetchTicker (symbol[, params = {}])`, el símbolo es obligatorio, los params son opcionales
- `fetchTickers ([symbols = undefined[, params = {}]])`, ambos argumentos son opcionales

### Individualmente Por Símbolo

Para obtener los datos de un ticker individual de un exchange para un par de trading concreto o un símbolo específico, llama a `fetchTicker (symbol)`:


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


### Todos A La Vez

Algunos exchanges (no todos) también admiten obtener todos los tickers a la vez. Consulta [su documentación](#exchanges) para más detalles. Puedes obtener todos los tickers con una sola llamada de la siguiente manera:


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


Obtener todos los tickers requiere más tráfico que obtener un único ticker. Además, ten en cuenta que algunos exchanges imponen límites de velocidad más estrictos en las solicitudes sucesivas de todos los tickers (consulta su documentación en los endpoints correspondientes para más detalles). **El coste de la llamada `fetchTickers()` en términos de límite de velocidad suele ser superior a la media**. Si solo necesitas un ticker, obtenerlo por un símbolo concreto también es más rápido. Probablemente quieras obtener todos los tickers solo si realmente los necesitas todos y, lo más probable es que no quieras llamar a fetchTickers con más frecuencia que una vez por minuto aproximadamente.

Además, algunos exchanges pueden imponer requisitos adicionales en la llamada `fetchTickers()`. A veces no es posible obtener los tickers de todos los símbolos debido a las limitaciones de la API del exchange en cuestión. Algunos exchanges aceptan una lista de símbolos en los parámetros de consulta de la URL HTTP; sin embargo, dado que la longitud de la URL es limitada y, en casos extremos, los exchanges pueden tener miles de mercados, una lista de todos sus símbolos simplemente no cabría en la URL, por lo que debe ser un subconjunto limitado de sus símbolos. A veces existen otras razones para requerir una lista de símbolos, y puede haber un límite en el número de símbolos que puedes obtener a la vez; pero sea cual sea la limitación, por favor, culpa al exchange. Para pasar los símbolos de interés al exchange, puedes suministrar una lista de cadenas como primer argumento a fetchTickers:


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


Ten en cuenta que la lista de símbolos no es obligatoria en la mayoría de los casos, pero debes añadir lógica adicional si quieres manejar todas las posibles limitaciones que puedan imponerse por parte de los exchanges.

Al igual que la mayoría de los métodos de la API CCXT Unificada, el último argumento de fetchTickers es el argumento `params` para sobreescribir los parámetros de la solicitud que se envían al exchange.

La estructura del valor devuelto es la siguiente:

```javascript
{
    'info':    { ... }, // the original JSON response from the exchange as is
    'BTC/USD': { ... }, // a single ticker for BTC/USD
    'ETH/BTC': { ... }, // a ticker for ETH/BTC
    ...
}
```

Está en camino una solución general para obtener todos los tickers de todos los exchanges (incluso de los que no tienen un endpoint de API correspondiente); esta sección se actualizará pronto.

```text
UNDER CONSTRUCTION
```

## Gráficos de Velas OHLCV

La mayoría de los exchanges tienen endpoints para obtener datos OHLCV, pero algunos no. La propiedad booleana (true/false) del exchange llamada `has['fetchOHLCV']` indica si el exchange admite series de datos de velas o no.

Para obtener velas/barras OHLCV de un exchange, ccxt dispone del método `fetchOHLCV`, que se declara de la siguiente manera:

```javascript
fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {})
```

Puedes llamar al método unificado `fetchOHLCV` / `fetch_ohlcv` para obtener la lista de velas OHLCV de un símbolo concreto de la siguiente manera:


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


Para ver la lista de marcos temporales disponibles en tu exchange, consulta la propiedad `timeframes`. Ten en cuenta que solo se rellena cuando `has['fetchOHLCV']` también es true.

La lista de velas devuelta puede tener uno o más periodos faltantes, si el exchange no tuvo ninguna operación para el rango de tiempo y símbolo especificados. Para un usuario, esto aparecería como huecos en una lista continua de velas. Eso se considera normal. Si el exchange no tenía velas en ese momento, la biblioteca CCXT mostrará los resultados tal como los devuelve el propio exchange.

**Existe un límite sobre hasta qué punto en el tiempo pueden remontarse tus solicitudes.** La mayoría de los exchanges no permitirán consultar el historial detallado de velas (como los marcos temporales de 1 minuto y 5 minutos) demasiado atrás en el pasado. Normalmente conservan una cantidad razonable de velas recientes, como las últimas 1000 velas para cualquier marco temporal, lo cual es más que suficiente para la mayoría de los casos. Puedes sortear esa limitación obteniendo continuamente (también conocido como *REST polling*) los últimos OHLCVs y almacenándolos en un archivo CSV o en una base de datos.

**Ten en cuenta que la información de la última vela (actual) puede estar incompleta hasta que la vela se cierre (hasta que comience la siguiente vela).**

Al igual que con la mayoría de los demás métodos unificados e implícitos, el método `fetchOHLCV` acepta como último argumento un array asociativo (un diccionario) de `params` adicionales, que se utiliza para [sobreescribir valores predeterminados](#overriding-unified-api-params) que se envían en las solicitudes a los exchanges. El contenido de `params` es específico de cada exchange; consulta la documentación de la API del exchange para conocer los campos y valores admitidos.

El argumento `since` es una marca de tiempo UTC entera **en milisegundos** (en toda la biblioteca con todos los métodos unificados).

Si no se especifica `since`, el método `fetchOHLCV` devolverá el rango de tiempo predeterminado del propio exchange. Esto no es un error. Algunos exchanges devolverán velas desde el principio de los tiempos, otros solo devolverán las velas más recientes; el comportamiento predeterminado de los exchanges es el esperado. Por lo tanto, sin especificar `since`, el rango de velas devueltas será específico del exchange. Se debe pasar el argumento `since` para asegurarse de obtener exactamente el rango de historial necesario.

### Obtener la respuesta OHLCV sin procesar

Actualmente, la estructura que usa CCXT no incluye la respuesta sin procesar del exchange. Sin embargo, los usuarios pueden sobreescribir el valor de retorno haciendo lo siguiente:


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


### Notas Sobre La Latencia

Las estrategias de trading requieren información fresca y actualizada para el análisis técnico, los indicadores y las señales. Construir una estrategia de trading especulativa basada en las velas OHLCV recibidas del exchange puede tener inconvenientes críticos. Los desarrolladores deben tener en cuenta los detalles explicados en esta sección para construir bots exitosos.

En primer lugar, al usar CCXT estás hablando directamente con los exchanges. CCXT no es un servidor ni un servicio; es una biblioteca de software. Todos los datos que obtienes con CCXT se reciben directamente de los exchanges de primera mano.

Los exchanges generalmente proporcionan dos categorías de datos públicos de mercado:

1. Datos primarios de primer orden rápidos que incluyen libros de órdenes en tiempo real y operaciones o ejecuciones
2. Datos de segundo orden lentos que incluyen tickers secundarios y velas OHLCV kline, que se calculan a partir de los datos de primer orden

Los datos primarios de primer orden son actualizados por las APIs de los exchanges en pseudo tiempo real, o tan cerca del tiempo real como sea posible, lo más rápido posible. Los datos de segundo orden requieren tiempo para que el exchange los calcule. Por ejemplo, un ticker no es más que un corte estadístico móvil de 24 horas de los libros de órdenes y las operaciones. Las velas y volúmenes OHLCV también se calculan a partir de las operaciones de primer orden y representan cortes estadísticos fijos de períodos específicos. El volumen negociado dentro de una hora es simplemente la suma de los volúmenes negociados de las operaciones correspondientes que ocurrieron durante esa hora.

Obviamente, al exchange le lleva algún tiempo recopilar los datos de primer orden y calcular los datos estadísticos secundarios a partir de ellos. Eso significa literalmente que **los tickers y los OHLCVs son siempre más lentos que los libros de órdenes y las operaciones**. En otras palabras, siempre existe cierta latencia en la API del exchange entre el momento en que ocurre una operación y el momento en que una vela OHLCV correspondiente es actualizada o publicada por la API del exchange.

La latencia (o cuánto tiempo necesita la API del exchange para calcular los datos secundarios) depende de la velocidad del motor del exchange, por lo que es específica de cada exchange. Los mejores motores de exchange normalmente devuelven y actualizan las velas OHLCV y los tickers del último minuto a una velocidad muy alta. Algunos exchanges pueden hacerlo en intervalos regulares, como una vez por segundo o una vez cada pocos segundos. Los motores de exchange más lentos pueden tardar minutos en actualizar la información estadística secundaria; sus APIs pueden devolver la vela OHLCV más reciente actual con varios minutos de retraso.

Si tu estrategia depende de los datos más frescos del último minuto, no querrás construirla basándote en tickers u OHLCVs recibidos del exchange. Los tickers y los OHLCVs de los exchanges solo son adecuados para fines de visualización, o para estrategias de trading simples en marcos temporales de horas o días que son menos susceptibles a la latencia.

Afortunadamente, los desarrolladores de estrategias de trading críticas en el tiempo no tienen que depender de los datos secundarios de los exchanges y pueden calcular los OHLCVs y los tickers en el lado del usuario. Eso puede ser más rápido y eficiente que esperar a que los exchanges actualicen la información en su extremo. Se puede agregar el historial de operaciones públicas sondeándolo con frecuencia y calcular las velas recorriendo la lista de operaciones; consulta el archivo "build-ohlcv-bars" dentro de la [carpeta de ejemplos](https://github.com/ccxt/ccxt/tree/master/examples)

Debido a las diferencias en sus implementaciones internas, los exchanges pueden ser más rápidos actualizando sus datos de mercado primarios y secundarios a través de WebSockets. La latencia sigue siendo específica de cada exchange, ya que el motor del exchange todavía necesita tiempo para calcular los datos secundarios, independientemente de si los estás sondeando a través de la API RESTful con CCXT u obteniendo actualizaciones vía WebSockets con CCXT Pro. WebSockets puede mejorar la latencia de red, por lo que un exchange rápido funcionará aún mejor, pero añadir soporte para suscripciones WS no hará que un motor de exchange lento funcione mucho más rápido.

Si quieres mantenerte al día con la latencia de los datos de segundo orden, tendrás que calcularla en tu lado y superar al motor del exchange en velocidad. Dependiendo de las necesidades de tu aplicación, esto puede ser complicado, ya que necesitarás manejar la redundancia, los "huecos de datos" en el historial, las interrupciones del exchange y otros aspectos de la agregación de datos, que es todo un universo en sí mismo imposible de cubrir completamente en este Manual.


### Construir barras OHLCV a partir de operaciones

Como se señaló en el párrafo anterior, los usuarios pueden construir velas manualmente usando el método `buildOHLCV / build_ohlcv`. Puedes ver un archivo de ejemplo llamado "build-ohlcv-bars" dentro de la [carpeta de ejemplos](https://github.com/ccxt/ccxt/tree/master/examples). 
Notas:
- Este método espera que las operaciones proporcionadas estén ordenadas cronológicamente (la operación más reciente debe ser la última del array)
- Debido a algunos posibles errores dentro de las entradas de operaciones (provenientes de `watch_ohlcv` u otras fuentes) dentro del método `build_ohlcv`, omitimos las operaciones que tienen precio `0`, para evitar valores distorsionados en una vela. Sin embargo, si no quieres omitir dichos elementos de operación, establece una opción:

```
exchange.options['buildOHLCV'] = {
    'skipZeroPrices': false
};
```

### Estructura OHLCV

El método fetchOHLCV mostrado anteriormente devuelve una lista (un array plano) de velas OHLCV representadas por la siguiente estructura:

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

La lista de velas se devuelve ordenada de forma ascendente (histórica/cronológica), la vela más antigua primero y la más reciente al final.

### Gráficos de Velas Mark, Index y PremiumIndex

Para obtener velas históricas de Mark, Index Price y Premium Index, pasa el parámetro `'price'` como [sobreescritura de parámetros](#overriding-unified-api-params) a `fetchOHLCV`. El parámetro `'price'` acepta uno de los siguientes valores:

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

También existen métodos de conveniencia `fetchMarkOHLCV`, `fetchIndexOHLCV` y `fetchPremiumIndexOHLCV`


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


## Operaciones Públicas

```diff
- this is under heavy development right now, contributions appreciated
```

Puedes llamar al método unificado `fetchTrades` / `fetch_trades` para obtener la lista de las operaciones más recientes de un símbolo determinado. El método `fetchTrades` se declara de la siguiente forma:

```javascript
async fetchTrades (symbol, since = undefined, limit = undefined, params = {})
```

Por ejemplo, si deseas imprimir las operaciones recientes de todos los símbolos uno a uno de forma secuencial (¡ten en cuenta el rateLimit!), lo harías así:


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


El método fetchTrades mostrado anteriormente devuelve una lista ordenada de operaciones (un array plano, ordenado por marca de tiempo de forma ascendente, la operación más antigua primero y la más reciente al final). Una lista de operaciones está representada por la [estructura de operación](#trade-structure).

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

La mayoría de los exchanges devuelven la mayor parte de los campos anteriores para cada operación, aunque hay exchanges que no devuelven el tipo, el lado, el id de la operación o el id de la orden. La mayoría de las veces se garantiza tener la marca de tiempo, la fecha y hora, el símbolo, el precio y la cantidad de cada operación.

El segundo argumento opcional `since` reduce el array por marca de tiempo, y el tercer argumento `limit` reduce por número (cantidad) de elementos devueltos.

Si el usuario no especifica `since`, el método `fetchTrades` devolverá el rango predeterminado de operaciones públicas del exchange. El conjunto predeterminado es específico del exchange; algunos exchanges devolverán operaciones desde la fecha de listado del par en el exchange, mientras que otros devolverán un conjunto reducido de operaciones (como las últimas 24 horas, las últimas 100 operaciones, etc.). Si el usuario desea un control preciso sobre el periodo de tiempo, es responsable de especificar el argumento `since`.

La mayoría de los métodos unificados devolverán un único objeto o un array plano (lista) de objetos (operaciones). Sin embargo, muy pocos exchanges (si es que alguno) devolverán todas las operaciones de una vez. Lo más frecuente es que sus APIs `limit` la salida a un cierto número de los objetos más recientes. **NO PUEDES OBTENER TODOS LOS OBJETOS DESDE EL PRINCIPIO DE LOS TIEMPOS HASTA EL MOMENTO PRESENTE EN UNA SOLA LLAMADA**. En la práctica, muy pocos exchanges lo tolerarán o permitirán.

Para obtener operaciones históricas, el usuario deberá recorrer los datos en porciones o "páginas" de objetos. La paginación generalmente implica *"obtener porciones de datos uno a uno"* en un bucle.

En la mayoría de los casos, los usuarios **deben usar al menos algún tipo de paginación** para obtener los resultados esperados de forma consistente.

Por otro lado, **algunos exchanges no admiten paginación para las operaciones públicas en absoluto**. En general, los exchanges proporcionarán solo las operaciones más recientes.

El método `fetchTrades ()` / `fetch_trades()` también acepta un argumento opcional `params` (array asociativo/diccionario, vacío por defecto) como su cuarto argumento. Puedes usarlo para pasar parámetros adicionales a las llamadas de método o para sobreescribir un valor predeterminado particular (donde lo admita el exchange). Consulta la documentación de la API de tu exchange para obtener más detalles.

## Hora del Exchange

El método `fetchTime()` (si está disponible) devuelve la marca de tiempo entera actual en milisegundos desde el servidor del exchange.

```javascript
fetchTime(params = {})
```

## Estado del Exchange

El estado del exchange describe la información más reciente conocida sobre la disponibilidad de la API del exchange. Esta información está codificada directamente en la clase del exchange o se obtiene en tiempo real directamente desde la API del exchange. El método `fetchStatus(params = {})` puede usarse para obtener esta información. El estado devuelto por `fetchStatus` es uno de:

- Codificado directamente en la clase del exchange, por ejemplo, si la API ha sido interrumpida o apagada.
- Actualizado usando el ping del exchange o el endpoint `fetchTime` para comprobar si está activo
- Actualizado usando el endpoint de estado dedicado de la API del exchange.

```javascript
fetchStatus(params = {})
```

### Estructura del Estado del Exchange

El método `fetchStatus()` devolverá una estructura de estado como la que se muestra a continuación:

```javascript
{
    'status': 'ok', // 'ok', 'shutdown', 'error', 'maintenance'
    'updated': undefined, // integer, last updated timestamp in milliseconds if updated via the API
    'eta': undefined, // when the maintenance or outage is expected to end
    'url': undefined, // a link to a GitHub issue or to an exchange post on the subject
}
```

Los posibles valores del campo `status` son:

- `'ok'` significa que la API del exchange está completamente operativa
- `'shutdown`' significa que el exchange fue cerrado, y el campo `updated` debería contener la fecha y hora del cierre
- `'error'` significa que la API del exchange está interrumpida, o que la implementación del exchange en CCXT está interrumpida
- `'maintenance'` significa mantenimiento regular, y el campo `eta` debería contener la fecha y hora en que se espera que el exchange vuelva a estar operativo

## Tasas de Préstamo

*solo margen*

Al hacer trading en corto o con apalancamiento en un mercado spot, se debe tomar prestada la moneda. Se acumulan intereses sobre la moneda prestada.

Los datos sobre la tasa de préstamo de una moneda se pueden obtener usando

- `fetchCrossBorrowRate ()` para la tasa de préstamo de una sola moneda
- `fetchCrossBorrowRates ()` para las tasas de préstamo de todas las monedas
- `fetchIsolatedBorrowRate ()` para la tasa de préstamo de un par de trading
- `fetchIsolatedBorrowRates ()` para las tasas de préstamo de todos los pares de trading
- `fetchBorrowRatesPerSymbol ()` para las tasas de préstamo de monedas en mercados individuales

```javascript
fetchCrossBorrowRate (code, params = {})
```

Parámetros

- **code** (String) Código de moneda unificado de CCXT, requerido (p. ej. `"USDT"`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"settle": "USDT"}`)

Devuelve

- Una [estructura de tasa de préstamo](#borrow-rate-structure)

```javascript
fetchCrossBorrowRates (params = {})
```

Parámetros

- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"startTime": 1610248118000}`)

Devuelve

- Un diccionario de [estructuras de tasa de préstamo](#borrow-rate-structure) con códigos de moneda unificados como claves

```javascript
fetchIsolatedBorrowRate (symbol, params = {})
```

Parámetros

- **symbol** (String) Símbolo de mercado unificado de CCXT, requerido (p. ej. `"BTC/USDT"`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"settle": "USDT"}`)

Devuelve

- Una [estructura de tasa de préstamo aislado](#isolated-borrow-rate-structure)

```javascript
fetchIsolatedBorrowRates (params = {})
```

Parámetros

- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"startTime": 1610248118000}`)

Devuelve

- Un diccionario de [estructuras de tasa de préstamo aislado](#isolated-borrow-rate-structure) con símbolos de mercado unificados como claves

### Estructura de Tasa de Préstamo Aislado

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

### Estructura de Tasa de Préstamo

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

## Historial de Tasas de Préstamo

*solo margen*

El método `fetchBorrowRateHistory` recupera un historial de la tasa de interés de préstamo de una moneda en intervalos de tiempo específicos

```javascript
fetchBorrowRateHistory (code, since = undefined, limit = undefined, params = {})
```

Parámetros

- **code** (String) *requerido* Código de moneda unificado de CCXT (p. ej. `"USDT"`)
- **since** (Integer) Marca de tiempo para la tasa de préstamo más antigua (p. ej. `1645807945000`)
- **limit** (Integer) El número máximo de [estructuras de tasa de préstamo](#borrow-rate-structure) a recuperar (p. ej. `10`)
- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Devuelve

- Un array de [estructuras de tasa de préstamo](#borrow-rate-structure)

## Niveles de Apalancamiento

*solo contratos*

- Los métodos de Niveles de Apalancamiento son privados en **binance**

El método `fetchLeverageTiers()` se puede usar para obtener el apalancamiento máximo de un mercado en distintos tamaños de posición. También se puede usar para obtener la tasa de margen de mantenimiento y la cantidad máxima negociable de un mercado cuando esa información no está disponible en el objeto de mercado.

Si bien puedes obtener el apalancamiento máximo absoluto de un mercado accediendo a `market['limits']['leverage']['max']`, para muchos mercados de contratos, el apalancamiento máximo dependerá del tamaño de tu posición.

Puedes acceder a esos límites usando

- `fetchMarketLeverageTiers()` (símbolo único)
- `fetchLeverageTiers([symbol1, symbol2, ...])` (múltiples símbolos)
- `fetchLeverageTiers()` (todos los símbolos de mercado)

```javascript
fetchMarketLeverageTiers(symbol, params = {})
```

Parámetros

- **symbol** (String) *requerido* Símbolo unificado de CCXT (p. ej. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"settle": "usdt"}`)

Devuelve

- una [estructura de niveles de apalancamiento](#leverage-tiers-structure)

```javascript
fetchLeverageTiers(symbols = undefined, params = {})
```

Parámetros

- **symbols** (\[String\]) Símbolo unificado de CCXT (p. ej. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"settle": "usdt"}`)

Devuelve

- un array de [estructuras de niveles de apalancamiento](#leverage-tiers-structure)

### Estructura de Niveles de Apalancamiento

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

En el ejemplo anterior:

- posiciones por debajo de 133,33       = apalancamiento máximo de 75
- posiciones desde 200 + 1000    = apalancamiento máximo de 50
- una posición de 150     = apalancamiento máximo de (10000 / 150)   = 66,66
- posiciones entre 133,33-200 = apalancamiento máximo de (10000 / posición) = 50,01 -> 74,99

**Nota para usuarios de Huobi:** Huobi usa tanto el apalancamiento como la cantidad para determinar las tasas de margen de mantenimiento: https://www.huobi.com/support/en-us/detail/900000089903

## Tasa de Financiación

*solo contratos*

Los datos sobre las tasas de financiación actuales, más recientes y próximas se pueden obtener usando los métodos

- `fetchFundingRates ()` para todos los símbolos de mercado
- `fetchFundingRates ([ symbol1, symbol2, ... ])` para múltiples símbolos de mercado
- `fetchFundingRate (symbol)` para un único símbolo de mercado

```javascript
fetchFundingRate (symbol, params = {})
```

Parámetros

- **symbol** (String) *requerido* Símbolo unificado de CCXT (p. ej. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Devuelve

- una [estructura de tasa de financiación](#funding-rate-structure)

```javascript
fetchFundingRates (symbols = undefined, params = {})
```

Parámetros

- **symbols** (\[String\]) Un array/lista opcional de símbolos unificados de CCXT (p. ej. `["BTC/USDT:USDT", "ETH/USDT:USDT"]`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Devuelve

- Un array de [estructuras de tasa de financiación](#funding-rate-structure) indexado por símbolos de mercado

## Intervalo de Financiación

*solo contratos*

Recupera el intervalo de financiación actual usando los siguientes métodos:

- `fetchFundingInterval (symbol)` para un único símbolo de mercado
- `fetchFundingIntervals ()` para todos los símbolos de mercado
- `fetchFundingIntervals ([ symbol1, symbol2, ... ])` para múltiples símbolos de mercado

```javascript
fetchFundingInterval (symbol, params = {})
```

Parámetros

- **symbol** (String) *requerido* Símbolo unificado de CCXT (p. ej. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Devuelve

- Una [estructura de tasa de financiación](#funding-rate-structure)

```javascript
fetchFundingIntervals (symbols = undefined, params = {})
```

Parámetros

- **symbols** (\[String\]) Un array/lista opcional de símbolos unificados de CCXT (p. ej. `["BTC/USDT:USDT", "ETH/USDT:USDT"]`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Devuelve

- Un array de [estructuras de tasa de financiación](#funding-rate-structure)

### Estructura de Tasa de Financiación

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

## Historial de Tasas de Financiación

*solo contratos*

```javascript
fetchFundingRateHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

Parámetros

- **symbol** (String) Símbolo unificado de CCXT (p. ej. `"BTC/USDT:USDT"`)
- **since** (Integer) Marca de tiempo para la tasa de financiación más antigua (p. ej. `1645807945000`)
- **limit** (Integer) El número máximo de tasas de financiación a recuperar (p. ej. `10`)
- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Retorna

- Un array de [estructuras del historial de tasas de financiamiento](#funding-rate-history-structure)

### Estructura del Historial de Tasas de Financiamiento

```javascript
{
    info: { ... },
    symbol: "BTC/USDT:USDT",
    fundingRate: -0.000068,
    timestamp: 1642953600000,
    datetime: "2022-01-23T16:00:00.000Z"
}
```

## Interés Abierto

*solo contratos*

Usa el método `fetchOpenInterest` para obtener el interés abierto actual de un símbolo en el exchange. Usa `fetchOpenInterests` para obtener el interés abierto actual de múltiples símbolos

```javascript
fetchOpenInterest (symbol, params = {})
```

Parámetros

- **symbol** (String) Símbolo de mercado unificado de CCXT (p. ej. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Retorna

- Una [estructura de interés abierto](#open-interest-structure)

```js
fetchOpenInterests (symbols = undefined, params = {})
```

- **symbols** ([String]) Un array/lista opcional de símbolos unificados de CCXT (p. ej. `["BTC/USDT:USDT", "ETH/USDT:USDT"]`). Dejar como `undefined` para todos los símbolos.
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Retorna

- Un diccionario de [estructuras de interés abierto](#open-interest-structure)

### Historial de Interés Abierto

*solo contratos*

Usa el método `fetchOpenInterestHistory` para obtener un historial del interés abierto de un símbolo en el exchange.

```javascript
fetchOpenInterestHistory (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {})
```

Parámetros

- **symbol** (String) Símbolo de mercado unificado de CCXT (p. ej. `"BTC/USDT:USDT"`)
- **timeframe** (String) Consulta exchange.timeframes para los valores disponibles
- **since** (Integer) Marca de tiempo para el registro de interés abierto más antiguo (p. ej. `1645807945000`)
- **limit** (Integer) El número máximo de [estructuras de interés abierto](#open-interest-structures) a recuperar (p. ej. `10`)
- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

**Nota para usuarios de OKX:** en lugar de un símbolo unificado, okx.fetchOpenInterestHistory espera un código de moneda unificado de CCXT en el argumento **symbol** (p. ej. `'BTC'`).

Retorna

- Un array de [estructuras de interés abierto](#open-interest-structure)

### Estructura de Interés Abierto

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

## Volatilidad Histórica

*solo opciones*

Usa el método `fetchVolatilityHistory` para obtener el historial de volatilidad del código de un activo subyacente de opciones en el exchange.

```javascript
fetchVolatilityHistory (code, params = {})
```

Parámetros

- **code** (String) *requerido* Código de moneda unificado de CCXT (p. ej. `"BTC"`)
- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Retorna

- Un array de [estructuras del historial de volatilidad](#volatility-structure)

### Estructura de Volatilidad

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

## Activos Subyacentes

*solo contratos*

Usa el método `fetchUnderlyingAssets` para obtener los IDs de mercado de los activos subyacentes para un tipo de mercado de contratos en el exchange.

```javascript
fetchUnderlyingAssets (params = {})
```

Parámetros

- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (p. ej. `{"instType": "OPTION"}`)
- **params.type** (String) Tipo de mercado unificado, el valor predeterminado es 'option' (p. ej. `"option"`)

Retorna

- Una [estructura de activos subyacentes](#underlying-assets-structure)

### Estructura de Activos Subyacentes

```javascript
[ 'BTC_USDT', 'ETH_USDT', 'DOGE_USDT' ]
```

## Historial de Liquidaciones

*solo contratos*

Usa el método `fetchSettlementHistory` para obtener el historial de liquidaciones público de un mercado de contratos en el exchange. Usa `fetchMySettlementHistory` para obtener solo tu historial de liquidaciones

```javascript
fetchMySettlementHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
fetchSettlementHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

Parámetros

- **symbol** (String) Símbolo unificado de CCXT (p. ej. `"BTC/USDT:USDT-230728-25500-P"`)
- **since** (Integer) Marca de tiempo para la liquidación más antigua (p. ej. `1694073600000`)
- **limit** (Integer) El número máximo de liquidaciones a recuperar (p. ej. `10`)
- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Retorna

- Un array de [estructuras del historial de liquidaciones](#settlement-history-structure)

### Estructura del Historial de Liquidaciones

```javascript
{
    info: { ... },
    symbol: 'BTC/USDT:USDT-230728-25500-P',
    price: 25761.35807869,
    timestamp: 1694073600000,
    datetime: '2023-09-07T08:00:00.000Z',
}
```

## Liquidaciones Forzosas

*solo margen y contratos*

Usa el método `fetchLiquidations` para obtener las liquidaciones forzosas públicas de un par de trading en el exchange. Usa `fetchMyLiquidations` para obtener solo tu historial de liquidaciones forzosas

```javascript
fetchMyLiquidations (symbol = undefined, since = undefined, limit = undefined, params = {})
fetchLiquidations (symbol, since = undefined, limit = undefined, params = {})
```

Parámetros

- **symbol** (String) Símbolo unificado de CCXT (p. ej. `"BTC/USDT:USDT-231006-25000-P"`)
- **since** (Integer) Marca de tiempo para la liquidación forzosa más antigua (p. ej. `1694073600000`)
- **limit** (Integer) El número máximo de liquidaciones forzosas a recuperar (p. ej. `10`)
- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (p. ej. `{"until": 1645807945000}`)

Retorna

- Un array de [estructuras de liquidación forzosa](#liquidation-structure)

### Estructura de Liquidación Forzosa

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

## Griegas

*solo opciones*

Usa el método `fetchGreeks` para obtener las griegas públicas y la volatilidad implícita de un par de trading de opciones en el exchange. Usa `fetchAllGreeks` para obtener las griegas de todos los símbolos o de múltiples símbolos.
Las griegas miden cómo factores como el precio del activo subyacente, el tiempo hasta la expiración, la volatilidad y las tasas de interés afectan el precio de un contrato de opciones.

```javascript
fetchGreeks (symbol, params = {})
```

Parámetros

- **symbol** (String) Símbolo unificado de CCXT (p. ej. `"BTC/USD:BTC-240927-40000-C"`)
- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (p. ej. `{"category": "options"}`)

Retorna

- Una [estructura de griegas](#greeks-structure)

```javascript
fetchAllGreeks (symbols = undefined, params = {})
```

Parámetros

- **symbols** (String) Símbolo unificado de CCXT (p. ej. `"BTC/USD:BTC-240927-40000-C"`)
- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (p. ej. `{"category": "options"}`)

// por ejemplo
fetchAllGreeks () // todos los símbolos
fetchAllGreeks ([ 'BTC/USD:BTC-240927-40000-C', 'ETH/USD:ETH-240927-4000-C' ]) // un array de símbolos específicos

Retorna

- Una lista de [estructuras de griegas](#greeks-structure)

### Estructura de Griegas

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

## Cadena de Opciones

*solo opciones*

Usa el método `fetchOption` para obtener los detalles públicos de un contrato de opciones individual en el exchange.

```javascript
fetchOption (symbol, params = {})
```

Parámetros

- **symbol** (String) Símbolo de mercado unificado de CCXT (p. ej. `"BTC/USD:BTC-240927-40000-C"`)
- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (p. ej. `{"category": "options"}`)

Retorna

- Una [estructura de cadena de opciones](#option-chain-structure)

Usa el método `fetchOptionChain` para obtener los datos públicos de la cadena de opciones de una moneda subyacente en el exchange.

```javascript
fetchOptionChain (code, params = {})
```

Parámetros

- **code** (String) Código de moneda unificado de CCXT (p. ej. `"BTC"`)
- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (p. ej. `{"category": "options"}`)

Retorna

- Una lista de [estructuras de cadena de opciones](#option-chain-structure)

### Estructura de Cadena de Opciones

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

## Ratio Largo/Corto

*solo contratos*

Usa el método `fetchLongShortRatio` para obtener el ratio largo/corto actual de un símbolo y usa `fetchLongShortRatioHistory` para obtener el historial de ratios largo/corto de un símbolo.

- `fetchLongShortRatio (symbol, period)` para el ratio actual de un símbolo de mercado individual
- `fetchLongShortRatioHistory (symbol, period, since, limit)` para el historial de ratios de un símbolo de mercado individual

```javascript
fetchLongShortRatio (symbol, period = undefined, params = {})
```

Parámetros

- **symbol** (String) *requerido* Símbolo unificado de CCXT (p. ej. `"BTC/USDT:USDT"`)
- **period** (String) El período para calcular el ratio (p. ej. `"24h"`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Retorna

- una [estructura de ratio largo/corto](#long-short-ratio-structure)

```javascript
fetchLongShortRatioHistory (symbol = undefined, period = undefined, since = undefined, limit = undefined, params = {})
```

Parámetros

- **symbol** (String) Símbolo unificado de CCXT (p. ej. `"BTC/USDT:USDT"`)
- **period** (String) El período para calcular el ratio (p. ej. `"24h"`)
- **since** (Integer) Marca de tiempo para el ratio más antiguo (p. ej. `1645807945000`)
- **limit** (Integer) El número máximo de ratios a recuperar (p. ej. `10`)
- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Retorna

- un array de [estructuras de ratio largo/corto](#long-short-ratio-structure)

### Estructura de Ratio Largo/Corto

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

## Desapalancamiento Automático

*solo contratos*

Usa el método `fetchADLRank` para obtener los detalles públicos del rango de desapalancamiento automático de un símbolo en el exchange.

```javascript
fetchADLRank (symbol, params = {})
```

Parámetros

- **symbol** (String) Símbolo de mercado unificado de CCXT (p. ej. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (p. ej. `{"category": "futures"}`)

Retorna

- Una [estructura de desapalancamiento automático](#auto-de-leverage)

### Estructura de Desapalancamiento Automático

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

# API Privada

- [Autenticación](#authentication)
- [Inicio de Sesión](#sign-in)
- [Configuración de Claves API](#api-keys-setup)
- [Cuentas](#accounts)
- [Saldo de Cuenta](#account-balance)
- [Órdenes](#orders)
- [Mis Operaciones](#my-trades)
- [Libro Mayor](#ledger)
- [Depósito](#deposit)
- [Retiro](#withdrawal)
- [Direcciones de Depósito](#deposit-addresses)
- [Transferencias](#transfers)
- [Comisiones](#fees)
- [Interés de Préstamo](#borrow-interest)
- [Solicitar y Devolver Margen](#borrow-and-repay-margin)
- [Margen](#margin)
- [Modo de Margen](#margin-mode)
- [Apalancamiento](#leverage)
- [Posiciones](#positions)
- [Historial de Financiamiento](#funding-history)
- [Conversión](#conversion)
- [Desapalancamiento Automático](#auto-de-leverage)

Para poder acceder a tu cuenta de usuario, realizar trading algorítmico colocando órdenes de mercado y limitadas, consultar saldos, depositar y retirar fondos, etc., necesitas obtener tus claves API para la autenticación de cada exchange con el que desees operar. Por lo general, están disponibles en una pestaña o página separada dentro de la configuración de tu cuenta de usuario. Las claves API son específicas de cada exchange y no pueden intercambiarse bajo ninguna circunstancia.

Las APIs privadas de los exchanges generalmente permiten los siguientes tipos de interacción:

- el estado actual del saldo de la cuenta del usuario se puede obtener con el método `fetchBalance()` como se describe en la sección [Saldo de Cuenta](#account-balance)
- el usuario puede colocar y cancelar órdenes con `createOrder()`, `cancelOrder()`, así como obtener las órdenes abiertas actuales y el historial de órdenes pasadas con métodos como `fetchOrder`, `fetchOrders()`, `fetchOpenOrder()`, `fetchOpenOrders()`, `fetchCanceledOrders`, `fetchClosedOrder`, `fetchClosedOrders`, como se describe en la sección de [Órdenes](#orders)
- el usuario puede consultar el historial de operaciones pasadas ejecutadas con su cuenta usando `fetchMyTrades`, como se describe en la sección [Mis Operaciones](#my-trades); consulta también [Cómo se Relacionan las Órdenes con las Operaciones](#how-orders-are-related-to-trades)
- el usuario puede consultar sus posiciones con `fetchPositions()` y `fetchPosition()` como se describe en la sección [Posiciones](#positions)
- el usuario puede obtener el historial de sus transacciones (transacciones en cadena que son _depósitos_ a la cuenta del exchange o _retiros_ de la cuenta del exchange) con `fetchTransactions()`, o con `fetchDeposit()`, `fetchDeposits()`, `fetchWithdrawal()` y `fetchWithdrawals()` por separado, dependiendo de lo que esté disponible en la API del exchange
- si la API del exchange proporciona un endpoint de libro mayor, el usuario puede obtener un historial de todos los movimientos de dinero que afectaron de alguna manera el saldo, con `fetchLedger`, que devolverá todas las entradas contables del libro mayor, como operaciones, depósitos, retiros, transferencias internas entre cuentas, reembolsos, bonificaciones, comisiones, ganancias por staking, etc., como se describe en la sección [Libro Mayor](#ledger).

## Autenticación

La autenticación con todos los exchanges se gestiona automáticamente si se proporcionan las claves API adecuadas. El proceso de autenticación generalmente sigue el siguiente patrón:

1. Generar un nuevo nonce. Un nonce es un entero, frecuentemente un Unix Timestamp en segundos o milisegundos (desde el epoch 1 de enero de 1970). El nonce debe ser único para cada solicitud y estar en constante aumento, de modo que no haya dos solicitudes que compartan el mismo nonce. Cada solicitud siguiente debe tener un nonce mayor que la solicitud anterior. **El nonce predeterminado es un Unix Timestamp de 32 bits en segundos.**
2. Añadir la `apiKey` pública y el nonce a otros parámetros del endpoint, si los hay, y luego serializar todo para firmarlo.
3. Firmar los parámetros serializados usando HMAC-SHA256/384/512 o MD5 con tu clave secreta.
4. Añadir la firma en Hex o Base64 y el nonce a las cabeceras HTTP o al cuerpo.

Este proceso puede diferir de un exchange a otro. Algunos exchanges pueden querer la firma en una codificación diferente, algunos varían en los nombres y formatos de los parámetros de cabecera y cuerpo, pero el patrón general es el mismo para todos ellos.

**No debes compartir el mismo par de claves API entre múltiples instancias de un exchange que se ejecuten simultáneamente, en scripts separados o en múltiples hilos. Usar el mismo par de claves desde diferentes instancias de forma simultánea puede causar todo tipo de comportamientos inesperados.**

**¡NO REUTILICES CLAVES API CON OTRO SOFTWARE! El otro software arruinará tu nonce haciéndolo demasiado alto. Si obtienes errores de [InvalidNonce](#invalid-nonce), asegúrate de generar un par de claves nuevo y completamente fresco antes que nada.**

La autenticación ya se gestiona por ti, por lo que no necesitas realizar ninguno de esos pasos manualmente a menos que estés implementando una nueva clase de exchange. Lo único que necesitas para operar es el par de claves API real.

### Configuración de claves API

#### Credenciales requeridas

Las credenciales de la API generalmente incluyen lo siguiente:

- `apiKey`. Esta es tu clave API pública y/o Token. Esta parte es *no secreta*, se incluye en la cabecera o en el cuerpo de tu solicitud y se envía a través de HTTPS en texto abierto para identificar tu solicitud. Frecuentemente es una cadena en codificación Hex o Base64 o un identificador UUID.
- `secret`. Esta es tu clave privada. Mantenla en secreto, no se la digas a nadie. Se usa para firmar tus solicitudes localmente antes de enviarlas a los exchanges. La clave secreta no se envía por internet en el proceso de solicitud-respuesta y no debe publicarse ni enviarse por correo electrónico. Se usa junto con el nonce para generar una firma criptográficamente sólida. Esa firma se envía con tu clave pública para autenticar tu identidad. Cada solicitud tiene un nonce único y, por lo tanto, una firma criptográfica única.
- `uid`. Algunos exchanges (no todos) también generan un identificador de usuario o *uid* abreviado. Puede ser una cadena o un literal numérico. Debes configurarlo si tu exchange lo requiere explícitamente. Consulta [su documentación](#exchanges) para más detalles.
- `password`. Algunos exchanges (no todos) también requieren tu contraseña/frase para operar. Debes configurar esta cadena si tu exchange lo requiere explícitamente. Consulta [su documentación](#exchanges) para más detalles.

Para crear claves API, busca la pestaña o botón de API en la configuración de tu usuario en el sitio web del exchange. Luego crea tus claves y cópialas en tu archivo de configuración. Los permisos de tu archivo de configuración deben estar correctamente establecidos, siendo ilegibles para cualquiera excepto el propietario.

**Recuerda mantener tu `apiKey` y clave secreta a salvo de usos no autorizados; no las envíes ni se las digas a nadie. Una filtración de la clave secreta o una brecha de seguridad puede costarte la pérdida de fondos.**

#### Validación de credenciales

Para verificar si el usuario ha proporcionado todas las credenciales requeridas, la clase base `Exchange` tiene un método llamado `exchange.checkRequiredCredentials()` o `exchange.check_required_credentials()`. Llamar a ese método lanzará un `AuthenticationError` si alguna de las credenciales falta o está vacía. La clase base `Exchange` también tiene la propiedad `exchange.requiredCredentials` que permite al usuario ver qué credenciales son necesarias para cada exchange, como se muestra a continuación:

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


#### Configuración de claves API

Para configurar un exchange para operar, simplemente asigna las credenciales de la API a una instancia existente del exchange o pásalas al constructor del exchange en el momento de la instanciación, así:


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


Ten en cuenta que tus solicitudes privadas fallarán con una excepción o error si no configuras tus credenciales de API antes de empezar a operar. Para evitar el escape de caracteres **escribe siempre tus credenciales entre comillas simples**, no dobles (`'MUY_BIEN'`, `"MUY_MAL"`).

#### Permisos de claves API
Cuando obtienes errores como `"Invalid API-key, IP, or permissions for action."` o `"API-key format invalid"`, lo más probable es que el problema no esté dentro de ccxt; por favor, evita abrir un nuevo issue a menos que te asegures de que:
1) No tienes errores tipográficos, espacios en blanco o comillas en tus claves
2) Tu dirección IP actual (consulta [IPv4](https://api.ipify.org/) o [IPv6](https://api64.ipify.org/)) está añadida a la lista blanca de la API-KEY (si usas proxy, tenlo en cuenta también)
3) Has seleccionado las opciones correctas en la lista de permisos para esa api-key
4) No estás mezclando accidentalmente api-keys de "testnet" o el modo "testnet" en tu script
5) Ya has revisado los [issues reportados](https://github.com/ccxt/ccxt/issues?q=is%3Aissue+%22Invalid+Api-Key+ID%22) sobre este error


#### Inicio de sesión

Algunos exchanges requieren que inicies sesión antes de llamar a métodos privados, lo cual se puede hacer usando el método `signIn`


```javascript tab="JavaScript"
signIn (params = {})
```

Parámetros

- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"2fa": "329293"}`)

Retorna

- respuesta del exchange

## Sobreescribir el Nonce

**El nonce predeterminado está definido por el exchange subyacente. ¡Puedes sobreescribirlo con un nonce en milisegundos si deseas realizar solicitudes privadas con más frecuencia que una vez por segundo! La mayoría de los exchanges limitarán tus solicitudes si superas sus límites de velocidad, ¡lee la [documentación de la API de tu exchange](/docs/exchange-markets) con cuidado!**

En caso de que necesites restablecer el nonce, es mucho más fácil crear otro par de claves para usar con las APIs privadas. Crear nuevas claves y configurar un par de claves nuevo y sin usar en tu configuración suele ser suficiente para eso.

En algunos casos no puedes crear nuevas claves debido a falta de permisos o por cualquier otra razón. Si eso ocurre, aún puedes sobreescribir el nonce. La clase base del mercado tiene los siguientes métodos para mayor comodidad:

- `seconds ()`: devuelve un Unix Timestamp en segundos.
- `milliseconds ()`: lo mismo en milisegundos (ms = 1000 * s, milésimas de segundo).
- `microseconds ()`: lo mismo en microsegundos (μs = 1000 * ms, millonésimas de segundo).

Hay exchanges que confunden milisegundos con microsegundos en su documentación de la API; perdonémosles eso, amigos. Puedes usar los métodos listados anteriormente para sobreescribir el valor del nonce. Si necesitas usar el mismo par de claves desde múltiples instancias de forma simultánea, usa clausuras o una función común para evitar conflictos de nonce. En JavaScript puedes sobreescribir el nonce proporcionando un parámetro `nonce` al constructor del exchange o estableciéndolo explícitamente en el objeto del exchange:

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

En Python y PHP puedes hacer lo mismo creando una subclase y sobreescribiendo la función nonce de una clase de exchange en particular:

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

## Cuentas

Puedes obtener todas las cuentas asociadas a un perfil usando el método `fetchAccounts()`

```javascript
fetchAccounts (params = {})
```

### Estructura de cuentas

El método `fetchAccounts()` devolverá una estructura como la que se muestra a continuación:

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

Los tipos de cuenta son uno de los [tipos de cuenta unificados](####account-balance) o `subaccount`

## Saldo de cuenta

Para consultar el saldo y obtener la cantidad de fondos disponibles para operar o fondos bloqueados en órdenes, usa el método `fetchBalance`:

```javascript
fetchBalance (params = {})
```

Parámetros

- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (p. ej. `{"currency": "usdt"}`)

Retorna

- Una [estructura de saldo](#balance-structure)

### Estructura de saldo

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

Los valores de `timestamp` y `datetime` pueden ser indefinidos o estar ausentes si el exchange subyacente no los proporciona.

Es posible que algunos exchanges no devuelvan información de saldo completa. Muchos exchanges no devuelven saldos para tus cuentas vacías o sin usar. En ese caso, algunas divisas pueden estar ausentes en la estructura de saldo devuelta.
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


## Órdenes

```diff
- this part of the unified API is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

### Consulta de órdenes

La mayoría de las veces puedes consultar órdenes por un id o por un símbolo, aunque no todos los exchanges ofrecen un conjunto completo y flexible de endpoints para consultar órdenes. Algunos exchanges pueden no tener un método para obtener órdenes cerradas recientemente, otros pueden carecer de un método para obtener una orden por id, etc. La biblioteca ccxt abordará esos casos creando soluciones alternativas donde sea posible.

La lista de métodos para consultar órdenes consiste en los siguientes:

- `fetchCanceledOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`
- `fetchClosedOrder (id, symbol = undefined, params = {})`
- `fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`
- `fetchOpenOrder (id, symbol = undefined, params = {})`
- `fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`
- `fetchOrder (id, symbol = undefined, params = {})`
- `fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`

Ten en cuenta que el nombre de esos métodos indica si el método devuelve una sola orden o múltiples órdenes (un array/lista de órdenes). El método `fetchOrder()` requiere un argumento de id de orden obligatorio (una cadena). Algunos exchanges también requieren un símbolo para obtener una orden por id, donde los ids de orden pueden intersectarse con varios pares de trading. Además, ten en cuenta que todos los demás métodos anteriores devuelven un array (una lista) de órdenes. La mayoría de ellos también requerirán un argumento de símbolo; sin embargo, algunos exchanges permiten consultar sin especificar un símbolo (es decir, *todos los símbolos*).

La biblioteca lanzará una excepción NotSupported si un usuario llama a un método que no está disponible en el exchange o no está implementado en ccxt.

Para comprobar si alguno de los métodos anteriores está disponible, mira la propiedad `.has` del exchange:


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


Una estructura típica de la propiedad `.has` generalmente contiene los siguientes indicadores correspondientes a los métodos de la API de órdenes para consultar órdenes:

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

Los significados de `true` y `false` booleanos son obvios. Un valor de cadena `emulated` significa que ese método en particular está ausente en la API del exchange y ccxt lo compensará donde sea posible en el lado del cliente.

#### Entendiendo el diseño de la API de órdenes

Las APIs de gestión de órdenes de los exchanges difieren en su diseño. El usuario debe entender el propósito de cada método específico y cómo se combinan para formar una API de órdenes completa:

- `fetchCanceledOrders()` - obtiene una lista de órdenes canceladas
- `fetchClosedOrder()` - obtiene una sola orden cerrada por id de orden
- `fetchClosedOrders()` – obtiene una lista de órdenes cerradas (o canceladas).
- `fetchMyTrades()` – aunque no es parte de la API de órdenes, está estrechamente relacionado, ya que proporciona el historial de operaciones liquidadas.
- `fetchOpenOrder()` - obtiene una sola orden abierta por id de orden
- `fetchOpenOrders()` – obtiene una lista de órdenes abiertas.
- `fetchOrder()` – obtiene una sola orden (abierta o cerrada) por `id` de orden.
- `fetchOrders()` – obtiene una lista de todas las órdenes (ya sea abiertas o cerradas/canceladas).
- `createOrder()` – se usa para colocar órdenes
- `createOrders()` – se usa para colocar múltiples órdenes dentro de la misma solicitud
- `cancelOrder()` – se usa para cancelar una sola orden
- `cancelOrders()` - se usa para cancelar múltiples órdenes
- `cancelAllOrders()` - se usa para cancelar todas las órdenes
- `cancelAllOrdersAfter()` - se usa para cancelar todas las órdenes después del tiempo de espera indicado

La mayoría de los exchanges tendrán una forma de obtener las órdenes actualmente abiertas. Por eso existe `exchange.has['fetchOpenOrders']`. Si ese método no está disponible, lo más probable es que `exchange.has['fetchOrders']` proporcione una lista de todas las órdenes. El exchange devolverá una lista de órdenes abiertas ya sea desde `fetchOpenOrders()` o desde `fetchOrders()`. Uno de los dos métodos suele estar disponible en cualquier exchange.

Algunos exchanges proporcionarán el historial de órdenes, otros no. Si el exchange subyacente proporciona el historial de órdenes, entonces estará disponible `exchange.has['fetchClosedOrders']` o `exchange.has['fetchOrders']`. Si el exchange subyacente no proporciona el historial de órdenes, entonces `fetchClosedOrders()` y `fetchOrders()` no están disponibles. En este último caso, el usuario debe construir una caché local de órdenes y rastrear las órdenes abiertas usando `fetchOpenOrders()` y `fetchOrder()` para los estados de las órdenes y para marcarlas como cerradas localmente en el lado del usuario (cuando ya no estén abiertas).

Si el exchange subyacente no dispone de métodos para el historial de órdenes (`fetchClosedOrders()` y `fetchOrders()`), entonces proporcionará `fetchOpenOrders` más el historial de operaciones con `fetchMyTrades` (véase [Cómo se relacionan las órdenes con las operaciones](#how-orders-are-related-to-trades)). Ese conjunto de información es en muchos casos suficiente para el seguimiento en un robot de trading en vivo. Si no hay historial de órdenes, hay que rastrear las órdenes en vivo y restaurar la información histórica a partir de las órdenes abiertas y las operaciones históricas.

En general, los exchanges subyacentes suelen proporcionar uno o más de los siguientes tipos de datos históricos:

- `fetchClosedOrders()`
- `fetchOrders()`
- `fetchMyTrades()`

Cualquiera de los tres métodos anteriores puede estar ausente, pero las APIs de los exchanges suelen proporcionar al menos uno de los tres métodos.

Si el exchange subyacente no proporciona órdenes históricas, la biblioteca CCXT no emulará la funcionalidad faltante — debe añadirse del lado del usuario donde sea necesario.

**Por favor, tenga en cuenta que cierto método puede estar ausente ya sea porque el exchange no tiene un endpoint de API correspondiente, o porque CCXT aún no lo ha implementado (la biblioteca también es un trabajo en curso). En este último caso, el método faltante se añadirá lo antes posible.**

#### Consulta de múltiples órdenes y operaciones

Todos los métodos que devuelven listas de operaciones y listas de órdenes aceptan el segundo argumento `since` y el tercer argumento `limit`:

- `fetchTrades()` (público)
- `fetchMyTrades()` (privado)
- `fetchOrders()`
- `fetchOpenOrders()`
- `fetchClosedOrders()`
- `fetchCanceledOrders()`

El segundo argumento `since` reduce el array por marca de tiempo, el tercer argumento `limit` reduce por número (cantidad) de elementos devueltos.

Si el usuario no especifica `since`, los métodos `fetchTrades()/fetchOrders()` devolverán el conjunto de resultados predeterminado del exchange. El conjunto predeterminado es específico de cada exchange; algunos exchanges devolverán operaciones u órdenes recientes a partir de la fecha de listado de un par en el exchange, otros exchanges devolverán un conjunto reducido de operaciones u órdenes (como las últimas 24 horas, las últimas 100 operaciones, las primeras 100 órdenes, etc.). Si el usuario desea un control preciso sobre el marco temporal, el usuario es responsable de especificar el argumento `since`.

**NOTA: no todos los exchanges proporcionan medios para filtrar las listas de operaciones y órdenes por tiempo de inicio, por lo que el soporte para `since` y `limit` es específico de cada exchange. Sin embargo, la mayoría de los exchanges sí proporcionan al menos alguna alternativa para "paginación" y "desplazamiento" que se puede sobreescribir con el argumento adicional `params`.**

Algunos exchanges no disponen de un método para obtener las órdenes cerradas o todas las órdenes. Solo ofrecerán el endpoint `fetchOpenOrders()`, y a veces también un endpoint `fetchOrder`. Esos exchanges no tienen ningún método para obtener el historial de órdenes. Para mantener el historial de órdenes en esos exchanges, el usuario debe almacenar un diccionario o una base de datos de órdenes en el lado del usuario y actualizar las órdenes en la base de datos después de llamar a métodos como `createOrder()`, `fetchOpenOrders()`, `cancelOrder()`, `cancelAllOrders()`.

#### Por ID de orden

Para obtener los detalles de una orden concreta por su id, use el método `fetchOrder()` / `fetch_order()`. Algunos exchanges también requieren un símbolo incluso cuando se obtiene una orden concreta por id.

La firma del método fetchOrder/fetch_order es la siguiente:

```javascript
if (exchange.has['fetchOrder']) {
    //  you can use the params argument for custom overrides
    let order = await exchange.fetchOrder (id, symbol = undefined, params = {})
}
```

**Algunos exchanges no tienen un endpoint para obtener una orden por id; ccxt lo emulará donde sea posible.** Por ahora puede seguir faltando en algunos sitios, ya que es un trabajo en curso.

Puede pasar pares clave-valor personalizados sobreescritos en el argumento adicional params para proporcionar un tipo de orden específico u otro ajuste si es necesario.

A continuación se muestran ejemplos del uso del método fetchOrder para obtener información de una orden desde una instancia de exchange autenticada:

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


#### Todas las órdenes

```javascript
if (exchange.has['fetchOrders'])
    exchange.fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {})
```

**Algunos exchanges no tienen un endpoint para obtener todas las órdenes; ccxt lo emulará donde sea posible.** Por ahora puede seguir faltando en algunos sitios, ya que es un trabajo en curso.

#### Órdenes abiertas

```javascript
if (exchange.has['fetchOpenOrders'])
    exchange.fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {})
```

#### Órdenes cerradas

¡No confunda las *órdenes cerradas* con las *operaciones* también conocidas como *fills*! ¡Una orden puede cerrarse (completarse) con múltiples operaciones contrarias! Por lo tanto, una *orden cerrada* no es lo mismo que una *operación*. En general, la orden no tiene en absoluto un campo `fee`, pero cada operación particular del usuario sí tiene `fee`, `cost` y otras propiedades. Sin embargo, muchos exchanges propagan esas propiedades a las órdenes también.

**Algunos exchanges no tienen un endpoint para obtener las órdenes cerradas; ccxt lo emulará donde sea posible.** Por ahora puede seguir faltando en algunos sitios, ya que es un trabajo en curso.

```javascript
if (exchange.has['fetchClosedOrders'])
    exchange.fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {})
```

### Estructura de una orden

La mayoría de los métodos que devuelven órdenes dentro de la API unificada de ccxt producirán una estructura de orden como se describe a continuación:

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

- El `status` de una orden suele ser `'open'` (no completada o parcialmente completada), `'closed'` (completamente completada) o `'canceled'` (no completada y cancelada, o parcialmente completada y luego cancelada).
- Algunos exchanges permiten al usuario especificar una marca de tiempo de vencimiento al colocar una nueva orden. Si la orden no se completa para ese momento, su `status` pasa a ser `'expired'`.
- Use el valor `filled` para determinar si la orden está completada, parcialmente completada o totalmente completada, y en qué cantidad.
- El trabajo sobre la información de `'fee'` sigue en curso; la información de comisiones puede faltar parcial o totalmente, dependiendo de las capacidades del exchange.
- La divisa de `fee` puede ser diferente de ambas divisas negociadas (por ejemplo, una orden ETH/BTC con comisiones en USD).
- La marca de tiempo `lastTradeTimestamp` puede no tener valor y puede ser `undefined/None/null` cuando el exchange no lo soporta o en caso de una orden abierta (una orden que aún no ha sido completada ni parcialmente completada).
- El `lastTradeTimestamp`, si existe, designa la marca de tiempo de la última operación, en caso de que la orden esté completada total o parcialmente; de lo contrario, `lastTradeTimestamp` es `undefined/None/null`.
- El `status` de la orden prevalece o tiene precedencia sobre el `lastTradeTimestamp`.
- El `cost` de una orden es: `{ filled * price }`
- El `cost` de una orden significa el volumen total en *quote* de la orden (mientras que el `amount` es el volumen en *base*). El valor de `cost` debe ser lo más cercano posible al coste real más reciente conocido de la orden. El campo `cost` en sí existe principalmente por conveniencia y puede deducirse de otros campos.
- El campo `clientOrderId` puede establecerse al colocar órdenes por el usuario con [parámetros de orden personalizados](#custom-order-params). Usando el `clientOrderId`, el usuario puede distinguir posteriormente entre sus propias órdenes. Esto solo está disponible para los exchanges que actualmente admiten `clientOrderId`.

#### timeInForce

El campo `timeInForce` puede ser `undefined/None/null` si no lo especifica el exchange. La unificación de `timeInForce` es un trabajo en curso.

Valores posibles para el campo `timeInForce`:

- `'GTC'` = _Good Till Cancel(ed)_ (Válido hasta cancelar), la orden permanece en el libro de órdenes hasta que se empareja o se cancela.
- `'IOC'` = _Immediate Or Cancel_ (Inmediato o cancelar), la orden debe emparejarse inmediatamente y completarse parcial o totalmente; el resto no completado se cancela (o toda la orden se cancela).
- `'FOK'` = _Fill Or Kill_ (Completar o cancelar), la orden debe completarse totalmente y cerrarse de inmediato; de lo contrario, toda la orden se cancela.
- `'PO'` = _Post Only_ (Solo publicar), la orden se coloca como una orden de creador o se cancela. Esto significa que la orden debe colocarse en el libro de órdenes durante al menos un tiempo en estado no completado. La unificación de `PO` como opción de `timeInForce` es un trabajo en curso con los exchanges unificados que tienen `exchange.has['createPostOnlyOrder'] == True`.

### Colocación de órdenes

Existen diferentes tipos de órdenes que un usuario puede enviar al exchange; las órdenes regulares terminan finalmente en el libro de órdenes del símbolo correspondiente, otras órdenes pueden ser más avanzadas. A continuación se presenta una lista que describe los distintos tipos de órdenes:

- [Órdenes límite](#limit-orders) – órdenes regulares que tienen un `amount` en divisa base (cuánto desea comprar o vender) y un `price` en divisa quote (a qué precio desea comprar o vender).
- [Órdenes de mercado](#market-orders) – órdenes regulares que tienen un `amount` en divisa base (cuánto desea comprar o vender)
  - [Compras de mercado](#market-buys) – algunos exchanges requieren órdenes de compra de mercado con un `amount` en divisa quote (cuánto desea gastar para comprar)
- [Órdenes de activación](#conditional-orders) también conocidas como *órdenes condicionales* – un tipo avanzado de orden utilizado para esperar una cierta condición en un mercado y luego reaccionar automáticamente: cuando se alcanza un `triggerPrice`, la orden de activación se desencadena y luego se coloca una orden límite regular con `price` o una orden a precio de mercado, que eventualmente resulta en entrar en una posición o salir de una posición.
- [Órdenes de stop loss](#stop-loss-orders) – casi iguales que las órdenes de activación, pero utilizadas para cerrar una posición y detener más pérdidas en esa posición: cuando el precio alcanza `triggerPrice`, la orden de stop loss se activa y resulta en colocar otra orden límite o de mercado regular para cerrar una posición a un `price` límite específico o al precio de mercado (una posición con una orden de stop loss adjunta).
- [Órdenes de take profit](#take-profit-orders) – una contrapartida a las órdenes de stop loss; este tipo de orden se utiliza para cerrar una posición y tomar las ganancias existentes en esa posición: cuando el precio alcanza `triggerPrice`, la orden de take profit se activa y resulta en colocar otra orden límite o de mercado regular para cerrar una posición a un `price` límite específico o al precio de mercado (una posición con una orden de take profit adjunta).
- [Órdenes de StopLoss y TakeProfit adjuntas a una posición](#stoploss-and-takeprofit-orders-attached-to-a-position) – órdenes avanzadas que consisten en tres órdenes de los tipos mencionados anteriormente: una orden límite o de mercado regular colocada para entrar en una posición con órdenes de stop loss y/o take profit que se colocarán al abrir esa posición y se usarán para cerrarla más tarde (cuando se alcanza un stop loss, cerrará la posición y cancelará su contraparte de take profit, y viceversa, cuando se alcanza un take profit, cerrará la posición y cancelará su contraparte de stop loss; estas dos contrapartes también se conocen como "órdenes OCO – una cancela a la otra"); además del `amount` (y `price` para la orden límite) para abrir una posición, también requerirá un `triggerPrice` para una orden de stop loss (con un `price` límite si es una orden de stop loss límite) y/o un `triggerPrice` para una orden de take profit (con un `price` límite si es una orden de take profit límite).
- [Órdenes de seguimiento](#trailing-orders) – una orden que se ajusta automáticamente en relación con una posición abierta; `trailingAmount` puede configurarse para seguir una cantidad en divisa quote especificada por detrás de la posición abierta, o `trailingPercent` puede configurarse para seguir un porcentaje especificado por detrás de la posición abierta; cuando el precio de mercado de la posición es igual a la orden de seguimiento, esto resulta en entrar en una nueva posición o salir de una posición dependiendo de si la orden de seguimiento tiene el parámetro `reduceOnly` establecido en true o no.

Colocar una orden siempre requiere un `symbol` que el usuario debe especificar (en qué mercado desea operar).

Para colocar una orden utilice el método `createOrder`. Puede usar el `id` de la [estructura de orden](#order-structure) unificada devuelta para consultar el estado y la condición de la orden más adelante. Si necesita colocar varias órdenes simultáneamente, puede verificar la disponibilidad del método `createOrders`.

```javascript
createOrder (symbol, type, side, amount, price = undefined, params = {})
```

```javascript
createOrders (orders, params = {}) // orders is a list in which each element contains a symbol, type, side, amount, price and params
```

Parámetros

- **symbol** (String) *obligatorio* Símbolo de mercado unificado de CCXT
  - Asegúrese de que el símbolo en cuestión exista en el exchange de destino y esté disponible para operar.
- **side** *obligatorio* una cadena de texto literal que indica la dirección de su orden.
  **Lados unificados:**
  - `buy` entregar divisa de cotización y recibir divisa base; por ejemplo, comprar `BTC/USD` significa que recibirá bitcoins a cambio de sus dólares.
  - `sell` entregar divisa base y recibir divisa de cotización; por ejemplo, vender `BTC/USD` significa que recibirá dólares a cambio de sus bitcoins.
- **type** una cadena de texto literal con el tipo de orden
  **Tipos unificados:**
  - [market](#market-orders) no permitido por algunos exchanges, consulte [su documentación](#exchanges) para más detalles
  - [limit](#limit-orders)
  - consulte #custom-order-params y #other-order-types para tipos no unificados
- **amount**, cuánta divisa desea operar, generalmente, aunque no siempre, en unidades de la divisa base del símbolo del par de trading (las unidades en algunos exchanges dependen del lado de la orden: consulte su documentación de API para más detalles.)
- **price** el precio al que se debe ejecutar la orden en unidades de la divisa de cotización (ignorado en órdenes de mercado)
- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (p. ej. `{"settle": "usdt"}`)

Devuelve

- Una llamada de orden exitosa devuelve una [estructura de orden](#order-structure)

**Notas sobre createOrder**

- Algunos exchanges solo permiten operar con órdenes limitadas.

Algunos campos de la estructura de orden devuelta pueden ser `undefined / None / null` si esa información no es retornada por la respuesta de la API del exchange. Se garantiza al usuario que el método `createOrder` devolverá una [estructura de orden](#order-structure) unificada que contendrá al menos el `id` de la orden y el campo `info` (una respuesta sin procesar del exchange "tal cual"):

```javascript
{
    'id': 'string',  // order id
    'info': { ... }, // decoded original JSON response from the exchange as is
}
```

##### Errores comunes

- Hay un error común que ocurre al crear órdenes para mercados de contratos:

```
"must be greater than minimum amount precision of 1"
```

Este error ocurre cuando el exchange espera un número natural de contratos (1, 2, 3, etc.) en el argumento `amount` de `createOrder`. La [estructura de mercado](#market-structure) tiene una clave llamada `contractSize`. Cada contrato tiene un valor equivalente a cierta cantidad del activo base determinada por el `contractSize`. El número de contratos multiplicado por el `contractSize` es igual a la cantidad base. `Cantidad base = (contratos * contractSize)`, por lo tanto, para derivar el número de contratos que debe ingresar en el argumento `amount` puede resolver para contratos: `contratos = (Cantidad base / contractSize)`.

A continuación se muestra un ejemplo para encontrar el `contractSize`:
```python
await exchange.loadMarkets()
symbol = 'BTC/USDT:USDT'
market = exchange.market(symbol)
print(market['contractSize'])

# Let's say you want to convert 0.5 BTC to the number of contracts:
number_contracts = round((0.5 * 1) / market['contractSize'])
```

#### Órdenes Limitadas

Las órdenes limitadas se colocan en el libro de órdenes del exchange a un precio especificado por el trader. Se ejecutan (cierran) cuando no hay órdenes en el mismo mercado a un precio más favorable, y otro trader crea una [orden de mercado](#market-orders) o una orden opuesta a un precio que coincide o supera el precio de la orden limitada.

Las órdenes limitadas pueden no ejecutarse completamente. Esto ocurre cuando la orden de ejecución es por una cantidad menor que la cantidad especificada en la orden limitada.

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

#### Órdenes de Mercado

*también conocidas como*

- órdenes a precio de mercado
- órdenes a precio spot
- órdenes instantáneas

Las órdenes de mercado se ejecutan de inmediato satisfaciendo una o más órdenes ya existentes del lado de venta del libro de órdenes del exchange. Las órdenes que su orden de mercado satisface se eligen desde la parte superior de la pila del libro de órdenes, lo que significa que su orden de mercado se ejecuta al mejor precio disponible. Al colocar una orden de mercado no necesita especificar el precio de la orden, y si el precio se especifica, será ignorado.

No se garantiza que la orden se ejecute al precio que usted observa antes de colocarla. Existen múltiples razones para esto, entre las que se incluyen:

- **deslizamiento de precio** un ligero cambio en el precio del mercado operado mientras su orden se está ejecutando. Las razones del deslizamiento de precio incluyen, entre otras:

    - latencia de ida y vuelta de red
    - alta carga en el exchange
    - volatilidad del precio

- **tamaños de orden inequívocos** si una orden de mercado es por una cantidad mayor que el tamaño de la orden superior en el libro de órdenes, entonces una vez ejecutada esa orden superior, la orden de mercado continuará ejecutando la siguiente orden del libro, lo que significa que la orden de mercado se ejecuta a múltiples precios

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

**Tenga en cuenta que algunos exchanges no aceptan órdenes de mercado (solo permiten órdenes limitadas).** Para detectar programáticamente si el exchange en cuestión admite órdenes de mercado o no, puede usar la propiedad `.has['createMarketOrder']` del exchange:

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


#### Compras de Mercado

En general, al colocar una orden de `market buy` o `market sell`, el usuario solo necesita especificar la cantidad de la divisa base a comprar o vender. Sin embargo, con algunos exchanges las órdenes de compra de mercado implementan un enfoque diferente para calcular el valor de la orden.

Suponga que está operando BTC/USD y el precio de mercado actual de BTC supera los 9000 USD. Para una compra o venta de mercado podría especificar un `amount` de 2 BTC y eso resultaría en _más o menos_ 18000 USD (más o menos ;)) en su cuenta, dependiendo del lado de la orden.

**¡Con las compras de mercado algunos exchanges requieren el costo total de la orden en la divisa de cotización!** La lógica detrás de esto es simple: en lugar de tomar la cantidad de divisa base a comprar o vender, algunos exchanges operan con _"cuánta divisa de cotización desea gastar en la compra en total"_.

Para colocar una orden de compra de mercado con esos exchanges no especificaría una cantidad de 2 BTC; en cambio, debería especificar de alguna manera el costo total de la orden, es decir, 18000 USD en este ejemplo. Los exchanges que tratan las órdenes `market buy` de esta manera tienen una opción específica del exchange `createMarketBuyOrderRequiresPrice` que permite especificar el costo total de una orden `market buy` de dos formas.

La primera es la predeterminada y si especifica el `price` junto con el `amount`, el costo total de la orden se calculará dentro de la librería a partir de esos dos valores con una multiplicación simple (`cost = amount * price`). El `cost` resultante sería la cantidad en divisa de cotización USD que se gastará en esta orden de compra de mercado en particular.

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

La segunda alternativa es útil en los casos en que el usuario desea calcular y especificar él mismo el costo total resultante de la orden. Eso se puede hacer estableciendo la opción `createMarketBuyOrderRequiresPrice` en `false` para desactivarla:

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

Más información al respecto:

- https://github.com/ccxt/ccxt/issues/564#issuecomment-347458566
- https://github.com/ccxt/ccxt/issues/4914#issuecomment-478199357
- https://github.com/ccxt/ccxt/issues/4799#issuecomment-470966769
- https://github.com/ccxt/ccxt/issues/5197#issuecomment-496270785

#### Emulación de Órdenes de Mercado con Órdenes Limitadas

También es posible emular una orden `market` con una orden `limit`.

**ADVERTENCIA: este método puede ser arriesgado debido a la alta volatilidad, úselo bajo su propio riesgo y solo cuando sepa muy bien lo que está haciendo.**

La mayoría de las veces una `market sell` puede emularse con una `limit sell` a un precio muy bajo: el exchange la convertirá automáticamente en una orden taker al precio de mercado (el precio que actualmente es más favorable para usted entre los disponibles en el libro de órdenes). Cuando el exchange detecta que está vendiendo a un precio muy bajo, le ofrecerá automáticamente el mejor precio comprador disponible del libro de órdenes. Esto es efectivamente lo mismo que colocar una orden de venta de mercado. Por tanto, las órdenes de mercado pueden emularse con órdenes limitadas (cuando no estén disponibles).

Lo contrario también es cierto: una `market buy` puede emularse con una `limit buy` a un precio muy alto. La mayoría de los exchanges cerrarán su orden al mejor precio disponible, es decir, el precio de mercado.

Sin embargo, nunca debe depender de eso por completo. **¡SIEMPRE pruébelo primero con una cantidad pequeña!** Puede probarlo primero en la interfaz web del exchange para verificar la lógica. Puede vender la cantidad mínima a un precio limitado especificado (una cantidad que pueda permitirse perder, por si acaso) y luego verificar el precio de ejecución real en el historial de operaciones.

#### Órdenes Limitadas

Las órdenes a precio limitado también se conocen como *órdenes limitadas*. Algunos exchanges solo aceptan órdenes limitadas. Las órdenes limitadas requieren que se envíe un precio (tasa por unidad) junto con la orden. El exchange cerrará las órdenes limitadas si y solo si el precio de mercado alcanza el nivel deseado.

```javascript
// camelCaseStyle
exchange.createLimitBuyOrder (symbol, amount, price[, params])
exchange.createLimitSellOrder (symbol, amount, price[, params])

// underscore_style
exchange.create_limit_buy_order (symbol, amount, price[, params])
exchange.create_limit_sell_order (symbol, amount, price[, params])
```


#### Órdenes Condicionales

Proveniente del trading tradicional, el término "orden Stop" ha sido algo ambiguo, por lo que en lugar de él, en CCXT utilizamos el término orden "Trigger" (disparador). Cuando el precio del símbolo alcanza su precio de "trigger" ("stop"), la orden se activa como orden `market` o `limit`, dependiendo de cuál haya elegido.

Tenemos diferentes clasificaciones de órdenes trigger:
1) [Orden Trigger](#trigger-order) independiente para comprar/vender una moneda (abrir/cerrar posición)
2) [Stop Loss](#stop-loss-orders) o [Take Profit](#take-profit-orders) independientes diseñados para cerrar posiciones abiertas.
3) Una orden Stop Loss o Take Profit adjunta a una orden primaria ([Orden Trigger Condicional](#stoploss-and-takeprofit-orders-attached-to-a-position)).


##### Orden Trigger

La orden "stop" tradicional (que puede ver en los sitios web de los exchanges) ahora se denomina orden "trigger" en la librería CCXT. Se implementa añadiendo un parámetro `triggerPrice`. Son órdenes trigger básicas independientes que pueden abrir o cerrar una posición.

* Para verificar que el exchange admite esta funcionalidad, compruebe `exchange.features` o use el método auxiliar `exchange.featureValue('BTC/USDT', 'createOrder', 'triggerPrice')`.
* Generalmente, se activa cuando el precio del activo/contrato subyacente cruza el `triggerPrice` desde **cualquier dirección**. Sin embargo, la API de algunos exchanges requiere también establecer `triggerDirection`, que activa la orden dependiendo de si el precio está por encima o por debajo del `triggerPrice`. Por ejemplo, si desea activar una orden limitada (comprar 0.1 `ETH` al precio limitado `1500`) una vez que el precio del par cruce `1700`:


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


Generalmente, el exchange determina automáticamente la dirección del `triggerPrice` (si está "por encima" o "por debajo" del precio actual); sin embargo, algunos exchanges requieren que proporcione `triggerDirection` con valores `ascending` o `descending`:

```
params = {
    'triggerPrice': 1700,
    'triggerDirection': 'ascending', // order will be triggered when price goes upward and touches 1700
}
```

Tenga en cuenta que también puede añadir el parámetro `reduceOnly: true` a la orden trigger (con un posible parámetro `triggerDirection: 'ascending/descending'`), de modo que actúe como orden de "stop-loss" o "take-profit". Sin embargo, para algunos exchanges admitimos tipos de órdenes trigger "stop-loss" y "take-profit", que automáticamente incluyen el manejo de `reduceOnly` y `triggerDirection` (véanse a continuación).

##### Órdenes Stop Loss

Lo mismo que las Órdenes de Activación, pero la dirección importa. Se implementa especificando un parámetro `stopLossPrice` (para el triggerPrice de stop loss), y también implementa automáticamente `triggerDirection` en nombre del usuario, de modo que en lugar de una Orden de Activación regular, puedes usar esta como alternativa.

* Para asegurarte de que el exchange admite esta funcionalidad, consulta `exchange.features` o utiliza el método auxiliar `exchange.featureValue('BTC/USDT', 'createOrder', 'stopLossPrice')`.

Supongamos que entraste en una posición larga (compraste) a 1000 y quieres protegerte de pérdidas ante una posible caída del precio por debajo de 700. Colocarías una orden de stop loss con triggerPrice en 700. Para esa orden de stop loss, puedes especificar un precio límite o se ejecutará al precio de mercado.

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

Supongamos que entraste en una posición corta (vendiste) a 700 y quieres protegerte de pérdidas ante una posible subida del precio por encima de 1300. Colocarías una orden de stop loss con triggerPrice en 1300. Para esa orden de stop loss, puedes especificar un precio límite o se ejecutará al precio de mercado.

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

Las órdenes de Stop Loss se activan cuando el precio del activo/contrato subyacente:

* cae por debajo del `stopLossPrice` desde arriba, para órdenes de venta. (ej: para cerrar una posición larga y evitar pérdidas adicionales)
* sube por encima del `stopLossPrice` desde abajo, para órdenes de compra (ej: para cerrar una posición corta y evitar pérdidas adicionales)


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


##### Órdenes de Take Profit

Lo mismo que las Órdenes de Stop Loss, pero la dirección importa. Se implementa especificando un parámetro `takeProfitPrice` (para el triggerPrice de toma de ganancias).

Supongamos que entraste en una posición larga (compraste) a 1000 y quieres obtener tus ganancias ante una posible subida del precio por encima de 1300. Colocarías una orden de take profit con triggerPrice en 1300. Para esa orden de take profit, puedes especificar un precio límite o se ejecutará al precio de mercado.

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

Supongamos que entraste en una posición corta (vendiste) a 700 y quieres obtener tus ganancias ante una posible caída del precio por debajo de 600. Colocarías una orden de take profit con triggerPrice en 600. Para esa orden de take profit, puedes especificar un precio límite o se ejecutará al precio de mercado.

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

Las órdenes de Take Profit se activan cuando el precio del subyacente:

* sube por encima del `takeProfitPrice` desde abajo, para órdenes de venta (ej: para cerrar una posición larga con ganancia)
* cae por debajo del `takeProfitPrice` desde arriba, para órdenes de compra (ej: para cerrar una posición corta con ganancia)


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


#### Órdenes de StopLoss y TakeProfit Vinculadas a una Posición

Órdenes de **Take Profit** / **Stop Loss** que están vinculadas a una orden principal de apertura de posición. Se implementan proporcionando un diccionario de parámetros para `stopLoss` y `takeProfit` que describen cada uno respectivamente.

* Por defecto, los montos de las órdenes de stopLoss y takeProfit serán los mismos que los de la orden principal pero en la dirección opuesta.
* Las órdenes de activación vinculadas son condicionales a la ejecución de la orden principal.
* No es compatible con todos los exchanges. Para verificar si stop-loss es compatible, usa este enfoque:
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


Para los exchanges donde no es posible usar SL y TP vinculados, después de enviar una orden de entrada, puedes enviar inmediatamente otra orden (aunque la posición podría no estar abierta todavía) con `stopLossPrice/takeProfitPrice` en `params`, (o `triggerPrice` y `reduceOnly: true`), de modo que aún puede actuar como una orden de stop loss para tu próxima posición (nota: este enfoque podría no funcionar en algunos exchanges).

Ejemplo:

```
    symbol = 'ADA/USDT:USDT'
    main_order = await binance.create_order(symbol, 'market', 'buy', 50) # open position
    tp_order = await binance.create_order(symbol, 'limit', 'sell', 50, 1.5, {"takeProfitPrice": 1.6}) # take profit order
    sl_order = await binance.create_order(symbol, 'limit', 'sell', 50, 0.24, {"stopLossPrice": 0.25}) # stop loss order
```

#### Órdenes de Trailing

Las órdenes de **Trailing** siguen a una posición abierta. Se implementan proporcionando parámetros flotantes para `trailingPercent` o `trailingAmount`.

* Una orden de trailing ajusta continuamente el precio de la orden a un porcentaje fijo o monto en moneda de cotización fijo por debajo del precio de mercado actual.
* Una orden de trailing sigue a una posición a medida que se mueve en una dirección, pero no en la dirección opuesta.
* Si el valor de la posición sube, la orden de trailing cambia, pero si el valor de la posición baja, la orden de trailing permanece igual hasta que se ejecuta.
* Una orden de trailing puede colocarse de forma independiente después de abrir una posición.
* Se implementa rellenando el parámetro `trailingPercent` o `trailingAmount` según el exchange.
* El argumento de precio puede usarse como `trailingTriggerPrice`, y el argumento de tipo puede usarse para diferenciar entre órdenes de trailing de límite y de mercado si es necesario.

*No es compatible con todos los exchanges.*

*Nota: Esto aún está en proceso de unificación y es un trabajo en progreso*


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


#### Parámetros de Orden Personalizados

Algunos exchanges te permiten especificar parámetros opcionales para tu orden. Puedes pasar tus parámetros opcionales y sobrescribir tu consulta con un array asociativo usando el argumento `params` en tu llamada a la API unificada. Todos los parámetros personalizados son específicos de cada exchange, por supuesto, y no son intercambiables; no esperes que los parámetros personalizados de un exchange funcionen con otro exchange.


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


##### `clientOrderId` definido por el usuario

```text
- this part of the unified API is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

El usuario puede especificar un campo `clientOrderId` personalizado que se puede establecer al colocar órdenes con los `params`. Usando el `clientOrderId` se puede distinguir posteriormente entre las órdenes propias. Esto solo está disponible para los exchanges que admiten `clientOrderId` en este momento. Para los exchanges que no lo admiten, lanzarán un error al proporcionar el `clientOrderId` o lo ignorarán estableciendo el `clientOrderId` en `undefined/None/null`.


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


##### Modo hedge para órdenes

Si el exchange admite la [característica](#features) para órdenes `hedged`, el usuario puede pasar `params['hedged'] = true` en `createOrder` para abrir una posición `hedged` en lugar de la orden en modo `one-way` predeterminado. Sin embargo, si el exchange admite `.has['setPositionMode']`, es posible que esos exchanges no admitan el parámetro `hedged` directamente a través de `createOrder`; en su lugar, en dichos exchanges primero debes cambiar el modo de cuenta usando [setPositionMode()](#set-position-mode) y luego ejecutar `createOrder` (sin el parámetro `hedged`) y colocará la orden hedged por defecto.


### Edición de Órdenes

Para editar una orden, puedes usar el método `editOrder`

```javascript
editOrder (id, symbol, type, side, amount, price = undefined, params = {})
```

Parámetros

- **id** (String) *requerido* ID de la orden (ej. `1645807945000`)
- **symbol** (String) *requerido* Símbolo de mercado unificado de CCXT
- **side** (String) *requerido* la dirección de tu orden.
  **Lados unificados:**
  - `buy` entrega moneda de cotización y recibe moneda base; por ejemplo, comprar `BTC/USD` significa que recibirás bitcoins por tus dólares.
  - `sell` entrega moneda base y recibe moneda de cotización; por ejemplo, vender `BTC/USD` significa que recibirás dólares por tus bitcoins.
- **type** (String) *requerido* tipo de orden
  **Tipos unificados:**
  - [`market`](#market-orders) no permitido por algunos exchanges, consulta [sus documentos](#exchanges) para más detalles
  - [`limit`](#limit-orders)
  - consulta #custom-order-params y #other-order-types para tipos no unificados
- **amount** (Number) *requerido* cuánta moneda quieres operar, generalmente, aunque no siempre, en unidades de la moneda base del par de trading (las unidades para algunos exchanges dependen del lado de la orden: consulta sus documentos de API para más detalles.)
- **price** (Float) el precio al que se debe ejecutar la orden en unidades de la moneda de cotización (ignorado en órdenes de mercado)
- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (ej. `{"settle": "usdt"}`)

Retorna

- Una [estructura de orden](#order-structure)

### Cancelación de Órdenes

Para cancelar una orden existente usa

- `cancelOrder ()` para una sola orden
- `cancelOrders ()` para múltiples órdenes
- `cancelAllOrders ()` para todas las órdenes abiertas
- `cancelAllOrdersAfter ()` para todas las órdenes abiertas después del tiempo de espera indicado

```javascript
cancelOrder (id, symbol = undefined, params = {})
```

Parámetros

- **id** (String) *requerido* ID de la orden (ej. `1645807945000`)
- **symbol** (String) Símbolo de mercado unificado de CCXT **requerido** en algunos exchanges (ej. `"BTC/USDT"`)
- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (ej. `{"settle": "usdt"}`)

Retorna

- Una [estructura de orden](#order-structure)

```javascript
cancelOrders (ids, symbol = undefined, params = {})
```

Parámetros

- **ids** (\[String\]) *requerido* IDs de órdenes (ej. `1645807945000`)
- **symbol** (String) Símbolo de mercado unificado de CCXT **requerido** en algunos exchanges (ej. `"BTC/USDT"`)
- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (ej. `{"settle": "usdt"}`)

Retorna

- Un array de [estructuras de orden](#order-structure)

```javascript
async cancelAllOrders (symbol = undefined, params = {})
```

Parámetros

- **symbol** (String) Símbolo de mercado unificado de CCXT **requerido** en algunos exchanges (ej. `"BTC/USDT"`)
- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (ej. `{"settle": "usdt"}`)

Retorna

- Un array de [estructuras de orden](#order-structure)

```javascript
async cancelAllOrdersAfter (timeout, params = {})
```

Parámetros

- **timeout** (number) tiempo de cuenta regresiva en milisegundos **requerido** en algunos exchanges, 0 representa cancelar el temporizador (ej. ``10``\ )
- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (ej. ``{"type": "spot"}``\ )

Retorna

- Un objeto

#### Excepciones al Cancelar Órdenes

El `cancelOrder()` generalmente se usa solo en órdenes abiertas. Sin embargo, puede ocurrir que tu orden sea ejecutada (completada y cerrada) antes de que llegue tu solicitud de cancelación, por lo que una solicitud de cancelación podría afectar a una orden ya cerrada.

Una solicitud de cancelación también podría lanzar una `OperationFailed` indicando que la orden puede o no haber sido cancelada exitosamente y si necesitas reintentar o no. Las llamadas consecutivas a `cancelOrder()` también pueden afectar a una orden ya cancelada.

Por lo tanto, `cancelOrder()` puede lanzar una excepción `OrderNotFound` en estos casos:
- cancelar una orden ya cerrada
- cancelar una orden ya cancelada

## Mis Operaciones

```text
- this part of the unified API is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

### Cómo se Relacionan las Órdenes con las Operaciones

Una operación también se denomina frecuentemente `a fill` (ejecución). Cada operación es el resultado de la ejecución de una orden. Ten en cuenta que las órdenes y las operaciones tienen una relación de uno a muchos: la ejecución de una orden puede resultar en varias operaciones. Sin embargo, cuando una orden se empareja con otra orden contraria, el par de dos órdenes emparejadas genera una operación. Por lo tanto, cuando una orden se empareja con múltiples órdenes contrarias, esto genera múltiples operaciones, una operación por cada par de órdenes emparejadas.

En resumen, una orden puede contener *una o más* operaciones. O, en otras palabras, una orden puede ser *ejecutada* con una o más operaciones.

Por ejemplo, un libro de órdenes puede tener las siguientes órdenes (sea cual sea el símbolo o par de trading):

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

Todos los números específicos anteriores no son reales; esto es solo para ilustrar la forma en que las órdenes y las operaciones se relacionan en general.

Un vendedor decide colocar una orden de venta límite en el lado de oferta a un precio de 0.700 y una cantidad de 150.

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

Como el precio y la cantidad de la orden de venta entrante (oferta) cubren más de una orden de compra (órdenes `b` e `i`), la siguiente secuencia de eventos suele ocurrir dentro del motor del exchange muy rápidamente, aunque no de forma inmediata:

1. La orden `b` se empareja con la venta entrante porque sus precios se intersectan. Sus volúmenes *"se anulan mutuamente"*, de modo que el comprador obtiene 100 a un precio de 0.800. El vendedor (ofertante) tendrá su orden de venta parcialmente ejecutada por el volumen de compra de 100 a un precio de 0.800. Nota que para la parte ejecutada de la orden, el vendedor obtiene un precio mejor del que pidió inicialmente. Pidió al menos 0.7 pero obtuvo 0.8, lo que es aún mejor para el vendedor. La mayoría de los exchanges convencionales ejecutan órdenes al mejor precio disponible.

2. Se genera una operación para la orden `b` contra la orden de venta entrante. Esa operación *"completa"* la orden `b` en su totalidad y gran parte de la orden de venta. Se genera una operación por cada par de órdenes emparejadas, independientemente de si el volumen se completó total o parcialmente. En este ejemplo, el volumen del vendedor (100) completa la orden `b` por completo (cierra la orden `b`) y también completa parcialmente la orden de venta (la deja abierta en el libro de órdenes).

3. La orden `b` tiene ahora un estado `closed` y un volumen ejecutado de 100. Contiene una operación contra la orden de venta. La orden de venta tiene un estado `open` y un volumen ejecutado de 100. Contiene una operación contra la orden `b`. Así, cada orden tiene hasta ahora una sola operación de ejecución.

4. La orden de venta entrante tiene un volumen ejecutado de 100 y aún debe ejecutar el volumen restante de 50 de su volumen inicial total de 150.

El estado intermedio del libro de órdenes es ahora el siguiente (la orden `b` está `closed` y ya no figura en el libro de órdenes):

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

5. La orden `i` se empareja con la parte restante de la venta entrante, porque sus precios se cruzan. El volumen de la orden de compra `i`, que es 200, aniquila por completo el volumen de venta restante de 50. La orden `i` se ejecuta parcialmente en 50, pero el resto de su volumen, es decir, el volumen restante de 150, permanecerá en el libro de órdenes. La orden de venta, sin embargo, queda completamente satisfecha con este segundo emparejamiento.

6. Se genera una operación para la orden `i` contra la orden de venta entrante. Esa operación ejecuta parcialmente la orden `i` y completa la ejecución de la orden de venta. De nuevo, se trata de una sola operación para un par de órdenes emparejadas.

7. La orden `i` tiene ahora un estado `open`, un volumen ejecutado de 50 y un volumen restante de 150. Contiene una operación de ejecución contra la orden de venta. La orden de venta tiene ahora un estado `closed` y ha completado totalmente su volumen inicial de 150. Sin embargo, contiene dos operaciones: la primera contra la orden `b` y la segunda contra la orden `i`. Así, cada orden puede tener una o más operaciones de ejecución, dependiendo de cómo el motor del exchange haya emparejado sus volúmenes.

Una vez completada la secuencia anterior, el libro de órdenes actualizado tendrá el siguiente aspecto.

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

Obsérvese que la orden `b` ha desaparecido y la orden de venta tampoco está. Todas las órdenes cerradas y completamente ejecutadas desaparecen del libro de órdenes. La orden `i`, que fue ejecutada parcialmente y aún tiene un volumen restante y un estado `open`, sigue presente.

### Operaciones Personales

La mayoría de los métodos unificados devuelven un único objeto o un array plano (una lista) de objetos (operaciones). Sin embargo, muy pocos exchanges (si es que alguno) devolverán todas las operaciones de una vez. La mayoría de las veces sus APIs `limit`an la salida a un cierto número de objetos más recientes. **NO SE PUEDEN OBTENER TODOS LOS OBJETOS DESDE EL PRINCIPIO DE LOS TIEMPOS HASTA EL MOMENTO PRESENTE EN UNA SOLA LLAMADA**. En la práctica, muy pocos exchanges lo tolerarán o permitirán.

Al igual que con todos los demás métodos unificados para obtener datos históricos, el método `fetchMyTrades` acepta un argumento `since` para la [paginación basada en fecha](#date-based-pagination). Al igual que con todos los demás métodos unificados de la biblioteca CCXT, el argumento `since` para `fetchMyTrades` debe ser una **marca de tiempo entera en milisegundos**.

Para obtener operaciones históricas, el usuario deberá recorrer los datos en porciones o "páginas" de objetos. La paginación a menudo implica *"obtener porciones de datos una por una"* en un bucle.

En muchos casos, las APIs de los exchanges requieren un argumento `symbol`, por lo que hay que iterar sobre todos los símbolos para obtener todas las operaciones. Si falta `symbol` y el exchange lo requiere, CCXT lanzará una excepción `ArgumentsRequired` para indicar el requisito al usuario. En ese caso, hay que especificar `symbol`. Uno de los enfoques consiste en filtrar los símbolos relevantes de la lista de todos los símbolos mirando los saldos distintos de cero, así como las transacciones (retiros y depósitos). Además, los exchanges tendrán un límite en cuanto a cuánto tiempo atrás se puede ir.

En la mayoría de los casos, los usuarios **deben usar al menos algún tipo de [paginación](#pagination)** para obtener los resultados esperados de forma consistente.


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


Devuelve un array ordenado `[]` de operaciones (la operación más reciente al final).

#### Estructura de Operación

Las operaciones representan el intercambio de una divisa por otra, a diferencia de las [transacciones](#transaction-structure), que representan una transferencia de una moneda determinada.

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

- El trabajo sobre la información de `'fee'` y `'fees'` sigue en curso; la información sobre comisiones puede estar parcial o totalmente ausente, dependiendo de las capacidades del exchange.
- La divisa de `fee` puede ser diferente de ambas divisas negociadas (por ejemplo, una orden ETH/BTC con comisiones en USD).
- El `cost` de la operación significa `amount * price`. Es el volumen total en *cotización* de la operación (mientras que `amount` es el volumen en *base*). El campo `cost` existe principalmente por conveniencia y puede deducirse de otros campos.
- El `cost` de la operación es un valor *"bruto"*. Es decir, el valor antes de comisiones, y la comisión debe aplicarse después.

### Operaciones por Id de Orden

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


## Libro Mayor

El libro mayor es simplemente el historial de cambios, acciones realizadas por el usuario u operaciones que alteraron el saldo del usuario de alguna manera; es decir, el historial de movimientos de todos los fondos desde/hacia todas las cuentas del usuario, que incluye

- depósitos y retiros (financiación)
- importes entrantes y salientes como resultado de una operación o una orden
- comisiones de trading
- transferencias entre cuentas
- reembolsos, devoluciones en efectivo y otros tipos de eventos sujetos a contabilidad.

Los datos sobre las entradas del libro mayor se pueden obtener usando

- `fetchLedgerEntry ()` para una entrada del libro mayor
- `fetchLedger ( code )` para múltiples entradas del libro mayor de la misma divisa
- `fetchLedger ()` para todas las entradas del libro mayor

```javascript
fetchLedgerEntry (id, code = undefined, params = {})
```

Parámetros

- **id** (String) *requerido* Id de entrada del libro mayor
- **code** (String) Código de divisa CCXT unificado, requerido (p. ej. `"USDT"`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"type": "deposit"}`)

Devuelve

- Una [estructura de entrada del libro mayor](#ledger-entry-structure)

```javascript
async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {})
```

Parámetros

- **code** (String) Código de divisa CCXT unificado; *requerido* si no se admite la obtención de todas las entradas del libro mayor para todos los activos a la vez (p. ej. `"USDT"`)
- **since** (Integer) Marca de tiempo (ms) del momento más antiguo para el que recuperar retiros (p. ej. `1646940314000`)
- **limit** (Integer) El número de [estructuras de entrada del libro mayor](#ledger-entry-structure) a recuperar (p. ej. `5`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Devuelve

- Un array de [estructuras de entrada del libro mayor](#ledger-entry-structure)

### Estructura de Entrada del Libro Mayor

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

#### Notas Sobre la Estructura de Entrada del Libro Mayor

El tipo de entrada del libro mayor es el tipo de operación asociada a ella. Si el importe se genera por una orden de venta, está asociado a una entrada del libro mayor de tipo operación, y el `referenceId` contendrá el id de la operación asociada (si el exchange en cuestión lo proporciona). Si el importe sale debido a un retiro, está asociado a una transacción correspondiente.

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

El campo `referenceId` contiene el id del evento correspondiente que fue registrado al añadir un nuevo elemento al libro mayor.

El campo `status` existe para dar soporte a los exchanges que incluyen cambios pendientes y cancelados en el libro mayor. El libro mayor representa de forma natural los cambios reales que han tenido lugar, por lo que el estado es `'ok'` en la mayoría de los casos.

El tipo de entrada del libro mayor puede estar asociado a una operación ordinaria, a una transacción de financiación (depósito o retiro) o a una `transfer` interna entre dos cuentas del mismo usuario. Si la entrada del libro mayor está asociada a una transferencia interna, el campo `account` contendrá el id de la cuenta que está siendo modificada con la entrada del libro mayor en cuestión. El campo `referenceAccount` contendrá el id de la cuenta opuesta a la que se transfieren los fondos, o de la que proceden, dependiendo de la `direction` (`'in'` o `'out'`).

## Depósito

Para depositar fondos en criptomonedas en un exchange, debe obtener una dirección del exchange para la divisa que desea depositar usando `fetchDepositAddress`. Luego puede llamar al método `withdraw` con la divisa y la dirección especificadas.

Para depositar divisa fiat en un exchange, puede usar el método `deposit` con los datos obtenidos del método `fetchDepositMethodId`.
*esta función de depósito está actualmente soportada solo en coinbase; no dude en informar de cualquier problema que encuentre*

- `deposit ()`

```javascript
deposit (id, code = undefined, params = {})
```

Parámetros

- **id** (String) *requerido* Id del depósito
- **code** (String) Código de divisa fiat, requerido (p. ej. `"USD"`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"account": "fiat"}`)

Devuelve

- Una [estructura de transacción](#transaction-structure)

- `fetchDepositMethodId ()`

```javascript
fetchDepositMethodId (id, params = {})
```

Parámetros

- **id** (String) *requerido* Id del depósito
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"account": "fiat"}`)

Devuelve

- Una [estructura de id de depósito](#deposit-id-structure)

- `fetchDepositMethodIds ()`

```javascript
fetchDepositMethodIds (params = {})
```

Parámetros

- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"account": "fiat"}`)

Devuelve

- Un array de [estructuras de id de depósito](#deposit-id-structure)

### Estructura de Id de Depósito

La estructura de id de depósito devuelta por `fetchDepositMethodId` y `fetchDepositMethodIds` tiene el siguiente aspecto:

```javascript
{
    'info': {},                 // raw unparsed data as returned from the exchange
    'id': '75ab52ff-f25t',      // the deposit id
    'currency': 'USD',          // fiat currency
    'verified': true,           // whether funding through this id is verified or not
    'tag': 'from credit card',  // tag / memo / name of funding source
}
```

Los datos sobre los depósitos realizados en una cuenta se pueden obtener usando

- `fetchDeposit ()` para un único depósito
- `fetchDeposits ( code )` para múltiples depósitos de la misma divisa
- `fetchDeposits ()` para todos los depósitos en una cuenta

```javascript
fetchDeposit (id, code = undefined, params = {})
```

Parámetros

- **id** (String) *requerido* Id del depósito
- **code** (String) Código de divisa CCXT unificado, requerido (p. ej. `"USDT"`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"network": "TRX"}`)

Devuelve

- Una [estructura de transacción](#transaction-structure)

```javascript
fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {})
```

Parámetros

- **code** (String) Código de divisa CCXT unificado (p. ej. `"USDT"`)
- **since** (Integer) Marca de tiempo (ms) del momento más antiguo para el que recuperar depósitos (p. ej. `1646940314000`)
- **limit** (Integer) El número de [estructuras de transacción](#transaction-structure) a recuperar (p. ej. `5`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Devuelve

- Un array de [estructuras de transacción](#transaction-structure)

## Retiro

El método `withdraw` se puede usar para retirar fondos de una cuenta.

Algunos exchanges requieren una aprobación manual de cada retiro mediante 2FA (autenticación de dos factores). Para aprobar su retiro, normalmente tendrá que hacer clic en el enlace secreto que le envían a su bandeja de entrada de correo electrónico o introducir un código de Google Authenticator o un código de Authy en su sitio web para verificar que la transacción de retiro fue solicitada de forma intencional.

En algunos casos también puede usar el id del retiro para comprobar el estado del retiro más tarde (si se realizó correctamente o no) y para enviar códigos de confirmación 2FA, cuando esto es compatible con el exchange. Consulte [su documentación](#exchanges) para más detalles.

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


Parámetros

- **code** (String) *requerido* Código de moneda unificado de CCXT (p. ej. `"USDT"`)
- **amount** (Float) *requerido* La cantidad de moneda a retirar (p. ej. `20`)
- **address** (String) *requerido* La dirección de destino del retiro (p. ej. `"TEY6qjnKDyyq5jDc3DJizWLCdUySrpQ4yp"`)
- **tag** (String) Requerido para algunas redes (p. ej. `"52055"`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"network": "TRX"}`)

Retorna

- Una [estructura de transacción](#transaction-structure)

---

Los datos sobre los retiros realizados en una cuenta se pueden obtener usando

- `fetchWithdrawal ()` para un único retiro
- `fetchWithdrawals ( code )` para múltiples retiros de la misma moneda
- `fetchWithdrawals ()` para todos los retiros de una cuenta

```javascript
fetchWithdrawal (id, code = undefined, params = {})
```

Parámetros

- **id** (String) *requerido* ID del retiro
- **code** (String) Código de moneda unificado de CCXT (p. ej. `"USDT"`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"network": "TRX"}`)

```javascript
fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {})
```

Parámetros

- **code** (String) Código de moneda unificado de CCXT (p. ej. `"USDT"`)
- **since** (Integer) Marca de tiempo (ms) del momento más temprano para recuperar retiros (p. ej. `1646940314000`)
- **limit** (Integer) El número de [estructuras de transacción](#transaction-structure) a recuperar (p. ej. `5`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Retorna

- Un array de [estructuras de transacción](#transaction-structure)

### Redes de Depósito y Retiro

También es posible pasar los parámetros como cuarto argumento con o sin una etiqueta especificada

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


Los siguientes alias de `network` permiten retirar criptomonedas en múltiples cadenas

| Moneda | Red |
|:---:|:---:|
| ETH  | ERC20 |
| TRX  | TRC20 |
| BSC  | BEP20 |
| BNB  | BEP2  |
| HT   | HECO  |
| OMNI | OMNI  |

Puede establecer el valor de `exchange.withdraw ('USDT', 100, 'TVJ1fwyJ1a8JbtUxZ8Km95sDFN9jhLxJ2D', { 'network': 'TRX' })` para retirar USDT en la cadena TRON, o 'BSC' para retirar USDT en Binance Smart Chain. En la tabla anterior, BSC y BEP20 son alias equivalentes, por lo que no importa cuál use, ya que ambos lograrán el mismo efecto.

### Estructura de Transacción

Las transacciones representan una transferencia de una moneda determinada, a diferencia de las [operaciones](#trade-structure), que representan el intercambio de una moneda por otra.

- *estructura de depósito*
- *estructura de retiro*

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

#### Notas Sobre la Estructura de Transacción

- `addressFrom` o `addressTo` pueden ser `undefined/None/null` si el exchange en cuestión no especifica todos los lados de la transacción
- La semántica del campo `address` es específica del exchange. En algunos casos puede contener la dirección del remitente; en otros, puede contener la dirección del receptor. El valor real depende del exchange.
- El campo `updated` es la marca de tiempo UTC en milisegundos del cambio de estado más reciente de esa operación de financiación, ya sea `withdrawal` o `deposit`. Es necesario si desea rastrear sus cambios en el tiempo, más allá de una instantánea estática. Por ejemplo, si el exchange en cuestión reporta `created_at` y `confirmed_at` para una transacción, entonces el campo `updated` tomará el valor de `Math.max (created_at, confirmed_at)`, es decir, la marca de tiempo del cambio de estado más reciente.
- El campo `updated` puede ser `undefined/None/null` en ciertos casos específicos del exchange.
- La subestructura `fee` puede estar ausente si no se proporciona en la respuesta del exchange.
- El campo `comment` puede ser `undefined/None/null`; de lo contrario, contendrá un mensaje o nota definida por el usuario al crear la transacción.
- Tenga cuidado al manejar `tag` y `address`. ¡El `tag` **NO es una cadena arbitraria definida por el usuario** a su elección! No puede enviar mensajes ni comentarios de usuario en el `tag`. El propósito del campo `tag` es direccionar correctamente su billetera, por lo que debe ser correcto. Solo debe usar el `tag` recibido del exchange con el que está trabajando; de lo contrario, su transacción podría nunca llegar a su destino.
- El campo `type` puede ser `deposit/withdrawal` o, en algunos casos (cuando el endpoint del exchange devuelve tanto transferencias internas como transacciones en blockchain, p. ej. `ccxt.coinlist`), podría ser `transfer`.

### Ejemplos de fetchDeposits

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


### Ejemplos de fetchWithdrawals


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


### Ejemplos de fetchTransactions


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


## Direcciones de Depósito

La dirección para depositar puede ser una dirección ya existente que se creó previamente con el exchange, o puede crearse a petición. Para ver cuál de los dos métodos es compatible, compruebe las propiedades `exchange.has['fetchDepositAddress']` y `exchange.has['createDepositAddress']`.

```javascript
fetchDepositAddress (code, params = {})
createDepositAddress (code, params = {})
```

Parámetros

- **code** (String) *requerido* Código de moneda unificado de CCXT (p. ej. `"USDT"`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Retorna

- una [estructura de dirección](#address-structure)

---

Algunos exchanges también pueden tener un método para obtener múltiples direcciones de depósito a la vez o todas a la vez.

```javascript
fetchDepositAddresses (codes = undefined, params = {})
```

Parámetros

- **code** (\[String\]) Array de códigos de moneda unificados de CCXT. Puede o no ser requerido dependiendo del exchange (p. ej. `["USDT", "BTC"]`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Retorna

- un array de [estructuras de dirección](#address-structure)

```javascript
fetchDepositAddressesByNetwork (code, params = {})
```

Parámetros

- **code** (String) *requerido* Código de moneda unificado de CCXT (p. ej. `"USDT"`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Retorna

- un array de [estructuras de dirección](#address-structure)

### Estructura de Dirección

Las estructuras de dirección devueltas por `fetchDepositAddress`, `fetchDepositAddresses`, `fetchDepositAddressesByNetwork` y `createDepositAddress` tienen el siguiente aspecto:

```javascript
{
    'info': response,       // raw unparsed data as returned from the exchange
    'currency': 'USDC',     // currency code
    'network': 'ERC20',     // a deposit/withdraw networks, ERC20, TRC20, BSC20 (see below)
    'address': '0x',        // blockchain address in terms of the requested currency and network
    'tag': undefined,       // tag / memo / paymentId for particular currencies (XRP, XMR, ...)
}
```

Con ciertas monedas, como AEON, BTS, GXS, NXT, SBD, STEEM, STR, XEM, XLM, XMR, XRP, los exchanges suelen requerir un argumento adicional `tag`. Otras monedas tendrán el `tag` establecido en `undefined / None / null`. El tag es un memo, mensaje o ID de pago que se adjunta a una transacción de retiro. El tag es obligatorio para esas monedas e identifica la cuenta del usuario receptor.

Tenga cuidado al especificar el `tag` y la `address`. ¡El `tag` **NO es una cadena arbitraria definida por el usuario** a su elección! No puede enviar mensajes ni comentarios de usuario en el `tag`. El propósito del campo `tag` es direccionar correctamente su billetera, por lo que debe ser correcto. Solo debe usar el `tag` recibido del exchange con el que está trabajando; de lo contrario, su transacción podría nunca llegar a su destino.

**El campo `network` es relativamente nuevo; puede ser `undefined / None / null` o estar completamente ausente en ciertos casos (con algunos exchanges), pero eventualmente se añadirá en todas partes. Todavía está en proceso de unificación.**

## Transferencias

El método `transfer` realiza transferencias internas de fondos entre cuentas en el mismo exchange. Esto puede incluir subcuentas o cuentas de diferentes tipos (`spot`, `margin`, `future`, ...). Si un exchange está separado en CCXT en una clase spot y de futuros (p. ej. `binanceusdm`, `kucoinfutures`, ...), entonces el método `transferIn` puede estar disponible para transferir fondos hacia la cuenta de futuros, y el método `transferOut` puede estar disponible para transferir fondos fuera de la cuenta de futuros

```javascript
transfer (code, amount, fromAccount, toAccount, params = {})
```

Parámetros

- **code** (String) Código de moneda unificado de CCXT (p. ej. `"USDT"`)
- **amount** (Float) La cantidad de moneda a transferir (p. ej. `10.5`)
- **fromAccount** (String) La cuenta desde la que transferir fondos.
- **toAccount** (String) La cuenta a la que transferir fondos.
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)
- **params.symbol** (String) Símbolo de mercado al transferir hacia o desde una cuenta de margen (p. ej. `'BTC/USDT'`)

### Tipos de Cuenta

`fromAccount` y `toAccount` pueden aceptar el ID de cuenta del exchange o uno de los siguientes valores unificados:

- `funding` *para algunos exchanges, `funding` y `spot` son la misma cuenta*
- `main` *para algunos exchanges que permiten subcuentas*
- `spot`
- `margin`
- `future`
- `swap`
- `lending`

Puede recuperar todos los tipos de cuenta seleccionando las claves de `exchange.options['accountsByType']`

Algunos exchanges permiten transferencias a direcciones de correo electrónico, números de teléfono o a otros usuarios mediante ID de usuario.

Retorna

- Una [estructura de transferencia](#transfer-structure)

```javascript
transferIn (code, amount, params = {})
transferOut (code, amount, params = {})
```

Parámetros

- **code** (String) Código de moneda unificado de CCXT (p. ej. `"USDT"`)
- **amount** (Float) La cantidad de moneda a transferir (p. ej. `10.5`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Retorna

- Una [estructura de transferencia](#transfer-structure)

```javascript
fetchTransfers (code = undefined, since = undefined, limit = undefined, params = {})
```

Parámetros

- **code** (String) Código de moneda unificado de CCXT (p. ej. `"USDT"`)
- **since** (Integer) Marca de tiempo (ms) del momento más temprano para recuperar transferencias (p. ej. `1646940314000`)
- **limit** (Integer) El número de [estructuras de transferencia](#transfer-structure) a recuperar (p. ej. `5`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Retorna

- Un array de [estructuras de transferencia](#transfer-structure)

```javascript
fetchTransfer (id, since = undefined, limit = undefined, params = {})
```

Parámetros

- **id** (String) ID de transferencia (p. ej. `"12345"`)
- **since** (Integer) Marca de tiempo (ms) del momento más temprano para recuperar transferencias (p. ej. `1646940314000`)
- **limit** (Integer) El número de [estructuras de transferencia](#transfer-structure) a recuperar (p. ej. `5`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Retorna

- Una [estructura de transferencia](#transfer-structure)

### Estructura de Transferencia

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
## Comisiones

**Esta sección de la API Unificada de CCXT está en desarrollo.**

Las comisiones se agrupan frecuentemente en dos categorías:

- Comisiones de trading. La comisión de trading es el importe pagadero al exchange, generalmente un porcentaje del volumen negociado (ejecutado).
- Comisiones de transacción. El importe pagadero al exchange al depositar y retirar, así como las comisiones de transacción subyacentes de criptomonedas (comisiones tx).

Dado que la estructura de comisiones puede depender del volumen real de monedas negociadas por el usuario, las comisiones pueden ser específicas de la cuenta. Métodos para trabajar con comisiones específicas de la cuenta:

```javascript
fetchTradingFee (symbol, params = {})
fetchTradingFees (params = {})
fetchDepositWithdrawFees (codes = undefined, params = {})
fetchDepositWithdrawFee (code, params = {})
```


Los métodos de comisiones devolverán una estructura de comisiones unificada, que también suele estar presente en órdenes y operaciones. La estructura de comisiones es un formato común para representar la información de comisiones en toda la biblioteca. Las estructuras de comisiones generalmente están indexadas por mercado o moneda.

Dado que esto sigue siendo un trabajo en progreso, algunos o todos los métodos e información descritos en esta sección pueden no estar disponibles en este o aquel exchange.

**NO use la propiedad `.fees` de la instancia del exchange, ya que la mayoría de las veces contiene información predefinida o codificada de forma fija. Las comisiones reales solo deben obtenerse de los mercados y las monedas.**

**NOTA: Anteriormente usábamos fetchTransactionFee(s) para obtener las comisiones de transacción, que ahora están OBSOLETAS y estas funciones han sido reemplazadas por fetchDepositWithdrawFee(s)**

Puedes llamar a `fetchTradingFee` / `fetchTradingFees` para obtener las comisiones de trading, y `fetchDepositWithdrawFee` / `fetchDepositWithdrawFees` para obtener las comisiones de depósito y retiro.

### Estructura de Comisiones

Las órdenes, operaciones privadas, transacciones y entradas del libro mayor pueden definir la siguiente información en su campo `fee`:

```javascript
{
    'currency': 'BTC', // the unified fee currency code
    'rate': percentage, // the fee rate, 0.05% = 0.0005, 1% = 0.01, ...
    'cost': feePaid, // the fee cost (amount * fee rate)
}
```

### Programa de Comisiones

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

### Comisiones de Trading

Las comisiones de trading son propiedades de los mercados. En la mayoría de los casos, las comisiones de trading se cargan en los mercados mediante la llamada `fetchMarkets`. Sin embargo, en ocasiones los exchanges sirven las comisiones desde endpoints diferentes.

El método `calculateFee` puede usarse para precalcular las comisiones de trading que se pagarán (usa `calculateFeeWithRate` si tienes una comisión de trading personalizada / nivel, como VIP-X, en lugar de la comisión de usuario predeterminada). **¡ADVERTENCIA! Este método es experimental, inestable y puede producir resultados incorrectos en ciertos casos.** Solo debes usarlo con precaución. Las comisiones reales pueden diferir de los valores devueltos por `calculateFee`; esto es solo para precálculo. No dependas de los valores precalculados, ya que las condiciones del mercado cambian con frecuencia. Es difícil saber de antemano si tu orden será tomadora o formadora de mercado.

```javascript
    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {})
    calculateFeeWithRate (symbol, type, side, amount, price, takerOrMaker = 'taker', customRate, params = {})
```

El método `calculateFee` devolverá una estructura de comisiones unificada con las comisiones precalculadas para una orden con los parámetros especificados.

El acceso a las tasas de comisiones de trading debe realizarse mediante [`fetchTradingFees`](#fee-schedule), que es el enfoque recomendado. Si ese método no es compatible con el exchange, entonces a través de la propiedad `.markets`, de la siguiente manera:

```javascript
exchange.markets['ETH/BTC']['taker'] // taker fee rate for ETH/BTC
exchange.markets['BTC/USD']['maker'] // maker fee rate for BTC/USD
```

Los mercados almacenados bajo la propiedad `.markets` pueden contener información adicional relacionada con las comisiones:

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

**¡ADVERTENCIA! La información relacionada con las comisiones es experimental, inestable y puede estar solo parcialmente disponible o no estar disponible en absoluto.**

Las comisiones de formador de mercado (maker) se pagan cuando proporcionas liquidez al exchange, es decir, cuando *creas* una orden y otra persona la ejecuta. Las comisiones de formador suelen ser más bajas que las de tomador. De manera similar, las comisiones de tomador (taker) se pagan cuando *tomas* liquidez del exchange y ejecutas la orden de otra persona.

Las comisiones pueden ser negativas, lo cual es muy común entre los exchanges de derivados. Una comisión negativa significa que el exchange pagará un reembolso (recompensa) al usuario por el trading.

Además, algunos exchanges pueden no especificar las comisiones como porcentaje del volumen; comprueba el campo `percentage` del mercado para asegurarte.

#### Programa de Comisiones de Trading

Algunos exchanges tienen un endpoint para obtener el programa de comisiones de trading; esto se mapea a los métodos unificados `fetchTradingFees` y `fetchTradingFee`.

```javascript
fetchTradingFee (symbol, params = {})
```

Parámetros

- **symbol** (String) *requerido* Símbolo de mercado unificado (p. ej. `"BTC/USDT"`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"currency": "quote"}`)

Retorna

- Una [estructura de comisión de trading](#trading-fee-structure)

```javascript
fetchTradingFees (params = {})
```

Parámetros

- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"currency": "quote"}`)

Retorna

- Un array de [estructuras de comisión de trading](#trading-fee-structure)

#### Estructura de Comisión de Trading

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

### Comisiones de Transacción

Las comisiones de transacción son propiedades de las monedas (saldo de cuenta).

El acceso a las tasas de comisiones de transacción debe realizarse a través de la propiedad `.currencies`. Este aspecto aún no está unificado y está sujeto a cambios.

```javascript
exchange.currencies['ETH']['fee'] // tx/withdrawal fee rate for ETH
exchange.currencies['BTC']['fee'] // tx/withdrawal fee rate for BTC
```

#### Programa de Comisiones de Transacción

Algunos exchanges tienen un endpoint para obtener el programa de comisiones de transacción; esto se mapea a los métodos unificados

- `fetchTransactionFee ()` para un programa de comisiones de transacción individual
- `fetchTransactionFees ()` para todos los programas de comisiones de transacción

```javascript
fetchTransactionFee (code, params = {})
```

Parámetros

- **code** (String) *requerido* Código de moneda unificado de CCXT, requerido (p. ej. `"USDT"`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"type": "deposit"}`)
- **params.network** (String) Especifica la red unificada de CCXT (p. ej. `{"network": "TRC20"}`)

Retorna

- Una [estructura de comisión de transacción](#transaction-fee-structure)

```javascript
fetchTransactionFees (codes = undefined, params = {})
```

Parámetros

- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"type": "deposit"}`)

Retorna

- Un array de [estructuras de comisión de transacción](#transaction-fee-structure)

#### Estructura de Comisión de Transacción

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

## Interés por Préstamo

* solo para margen

Para operar con apalancamiento en mercados spot o de margen, se debe tomar prestada la moneda como préstamo. Esta moneda prestada debe devolverse con intereses. Para obtener la cantidad de interés acumulado puedes usar el método `fetchBorrowInterest`.

```javascript
fetchBorrowInterest (code = undefined, symbol = undefined, since = undefined, limit = undefined, params = {})
```

Parámetros

- **code** (String) El código de moneda unificado para la moneda del interés (p. ej. `"USDT"`)
- **symbol** (String) El símbolo de mercado de un mercado de margen aislado; si no se define, se devuelve el interés para los mercados de margen cruzado (p. ej. `"BTC/USDT:USDT"`)
- **since** (Integer) Marca de tiempo (ms) del momento más antiguo para recibir registros de interés (p. ej. `1646940314000`)
- **limit** (Integer) El número de [estructuras de interés por préstamo](#borrow-interest-structure) a recuperar (p. ej. `5`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Retorna

- Un array de [estructuras de interés por préstamo](#borrow-interest-structure)

### Estructura de Interés por Préstamo

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

## Tomar Prestado y Reembolsar Margen

*solo para margen*

Para tomar prestada y reembolsar moneda como préstamo de margen, usa `borrowCrossMargin`, `borrowIsolatedMargin`, `repayCrossMargin` y `repayIsolatedMargin`.

```javascript
borrowCrossMargin (code, amount, params = {})
repayCrossMargin (code, amount, params = {})
```
Parámetros

- **code** (String) *requerido* El código de moneda unificado para la moneda a tomar prestada o reembolsar (p. ej. `"USDT"`)
- **amount** (Float) *requerido* La cantidad de margen a tomar prestada o reembolsar (p. ej. `20.92`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"rate": 0.002}`)

Retorna

- Una [estructura de préstamo de margen](#margin-loan-structure)

```javascript
borrowIsolatedMargin (symbol, code, amount, params = {})
repayIsolatedMargin (symbol, code, amount, params = {})
```
Parámetros

- **symbol** (String) *requerido* El símbolo de mercado unificado de CCXT de un mercado de margen aislado (p. ej. `"BTC/USDT"`)
- **code** (String) *requerido* El código de moneda unificado para la moneda a tomar prestada o reembolsar (p. ej. `"USDT"`)
- **amount** (Float) *requerido* La cantidad de margen a tomar prestada o reembolsar (p. ej. `20.92`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"rate": 0.002}`)

Retorna

- Una [estructura de préstamo de margen](#margin-loan-structure)

### Estructura de Préstamo de Margen

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

## Margen

*solo para margen y contratos*

Nota: a lo largo del manual usamos el término "colateral" que significa el saldo de margen actual, pero no lo confundas con el "margen inicial" o el "margen de mantenimiento":
- `colateral (saldo de margen actual) = margen inicial + ganancia realizada y no realizada`.

Por ejemplo, cuando has abierto una posición aislada con un margen inicial de **50$** y la posición tiene una ganancia no realizada de **-15$**, entonces el **colateral** de tu posición será de **35$**. Sin embargo, si tomamos que el requisito de Margen de Mantenimiento (para mantener la posición abierta) indicado por el exchange es de **$25** para esa posición, entonces tu colateral no debería caer por debajo de ese valor, de lo contrario la posición será liquidada.

Para aumentar, reducir o establecer tu saldo de margen (colateral) en una posición apalancada abierta, usa `addMargin`, `reduceMargin` y `setMargin` respectivamente. Es algo así como ajustar la cantidad de apalancamiento que estás usando con una posición que ya está abierta.

Algunos escenarios para usar estos métodos incluyen:
- si la operación va en tu contra, puedes añadir margen para reducir el riesgo de liquidación
- si tu operación va bien, puedes reducir el saldo de margen de tu posición y tomar ganancias

```javascript
addMargin (symbol, amount, params = {})
reduceMargin (symbol, amount, params = {})
setMargin (symbol, amount, params = {})
```


Parámetros

- **symbol** (String) *requerido* Símbolo de mercado unificado de CCXT (p. ej. `"BTC/USDT:USDT"`)
- **amount** (String) *requerido* Cantidad de margen a añadir o reducir (p. ej. `20`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"leverage": 5}`)

Retorna

- una [estructura de margen](#margin-structure)

Puedes obtener el historial de ajustes de margen realizados usando los métodos anteriores o automáticamente por el exchange usando el siguiente método

```javascript
fetchMarginAdjustmentHistory (symbol = undefined, type = undefined, since = undefined, limit = undefined, params = {})
```

Parámetros

- **symbol** (String) Símbolo de mercado unificado de CCXT (p. ej. `"BTC/USDT:USDT"`)
- **type** (String) "add" o "reduce"
- **since** (Integer) Marca de tiempo (ms) del momento más antiguo para recuperar ajustes de margen (p. ej. `1646940314000`)
- **limit** (Integer) El número de [estructuras de margen](#margin-structure) a recuperar (p. ej. `5`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"auto": true}`)

Retorna

- una [estructura de margen](#margin-structure)

### Estructura de Margen

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

## Establecer Modo de Margen

*solo para contratos*

Actualiza el tipo de margen utilizado a uno de los siguientes:

- `cross` Se usa una cuenta para compartir el colateral entre los mercados. El margen se toma del saldo total de la cuenta para evitar la liquidación cuando sea necesario.
- `isolated` Cada mercado mantiene el colateral en una cuenta separada

```javascript
setMarginMode (marginMode, symbol = undefined, params = {})
```

Parámetros

- **marginMode** (String) *requerido* el tipo de margen utilizado
    **Tipos de margen unificados:**
    - `"cross"`
    - `"isolated"`
- **symbol** (String) Símbolo de mercado unificado de CCXT (p. ej. `"BTC/USDT:USDT"`) *requerido* en la mayoría de los exchanges. No es requerido cuando el modo de margen no es específico de un mercado
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"leverage": 5}`)

Retorna

- respuesta del exchange

### Exchanges Sin setMarginMode

Razones comunes por las que un exchange podría no tener

```javascript
exchange.has['setMarginMode'] == false
```

incluyen:

- el exchange no ofrece trading apalancado
- el exchange solo ofrece uno de los modos de margen `cross` o `isolated`, pero no ambos
- el modo de margen debe establecerse usando un parámetro específico del exchange dentro de `params` al usar `createOrder`

### Notas Sobre Errores Suprimidos Para setMarginMode

Algunas APIs de exchanges devuelven una respuesta de error cuando se envía una solicitud para establecer el modo de margen al modo que ya está configurado (p. ej. enviar una solicitud para establecer el modo de margen a `cross` para el mercado `BTC/USDT:USDT` cuando la cuenta ya tiene `BTC/USDT:USDT` configurado para usar margen cruzado). CCXT no considera esto un error porque el resultado final es lo que el usuario quería, por lo que el error se suprime y el resultado del error se devuelve como un objeto.

p. ej.

```javascript
{ code: -4046, msg: 'No need to change margin type.' }
```

### Notas Sobre el Parámetro marginMode

Algunos métodos permiten el uso de un parámetro `marginMode` que puede establecerse a `cross` o `isolated`. Esto puede ser útil para especificar el `marginMode` directamente dentro de los parámetros del método, para su uso con mercados de margen spot o de contratos. Para especificar un mercado de margen spot, debes usar un símbolo spot unificado o establecer el tipo de mercado a spot, mientras se establece el parámetro marginMode a `cross` o `isolated`.

Crear una Orden de Margen Spot:

*Usa un símbolo spot unificado, mientras se establece el parámetro marginMode.*


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


## Obtener Modo de Margen

*solo para margen y contratos*

El método `fetchMarginMode()` puede usarse para obtener el modo de margen establecido para un mercado. El método `fetchMarginModes()` puede usarse para obtener el modo de margen establecido para múltiples mercados a la vez.

Puedes acceder al modo de margen establecido usando:

- `fetchMarginMode()` (símbolo único)
- `fetchMarginModes([symbol1, symbol2, ...])` (múltiples símbolos)
- `fetchMarginModes()` (todos los símbolos de mercado)

```javascript
fetchMarginMode(symbol, params = {})
```

Parámetros

- **symbol** (String) *requerido* Un símbolo CCXT unificado (p. ej. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"subType": "linear"}`)

Retorna

- una [estructura de modo de margen](#margin-mode-structure)

```javascript
fetchMarginModes(symbols = undefined, params = {})
```

Parámetros

- **symbols** (\[String\]) Una lista de símbolos CCXT unificados (p. ej. `[ "BTC/USDT:USDT" ]`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"subType": "linear"}`)

Retorna

- un array de [estructuras de modo de margen](#margin-mode-structure)

### Estructura de Modo de Margen

```javascript
{
    "info": { ... }             // response from the exchange
    "symbol": "BTC/USDT:USDT",  // unified market symbol
    "marginMode": "cross",      // the margin mode either cross or isolated
}
```

## Establecer Apalancamiento

*solo margen y contratos*

```javascript
setLeverage (leverage, symbol = undefined, params = {})
```

Parámetros

- **leverage** (Integer) *requerido* El apalancamiento deseado
- **symbol** (String) Símbolo de mercado CCXT unificado (p. ej. `"BTC/USDT:USDT"`) *requerido* en la mayoría de los exchanges. No es requerido cuando el apalancamiento no es específico de un mercado (p. ej. si el apalancamiento se establece para la cuenta y no por mercado)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"marginMode": "cross"}`)

Retorna

- respuesta del exchange

## Apalancamiento

*solo margen y contratos*

El método `fetchLeverage()` puede usarse para obtener el apalancamiento establecido para un mercado. El método `fetchLeverages()` puede usarse para obtener el apalancamiento establecido para múltiples mercados a la vez.

Puedes acceder al apalancamiento establecido usando:

- `fetchLeverage()` (símbolo único)
- `fetchLeverages([symbol1, symbol2, ...])` (múltiples símbolos)
- `fetchLeverages()` (todos los símbolos de mercado)

```javascript
fetchLeverage(symbol, params = {})
```

Parámetros

- **symbol** (String) *requerido* Un símbolo CCXT unificado (p. ej. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"marginMode": "cross"}`)

Retorna

- una [estructura de apalancamiento](#leverage-structure)

```javascript
fetchLeverages(symbols = undefined, params = {})
```

Parámetros

- **symbols** (\[String\]) Una lista de símbolos CCXT unificados (p. ej. `[ "BTC/USDT:USDT" ]`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"marginMode": "cross"}`)

Retorna

- un array de [estructuras de apalancamiento](#leverage-structure)

### Estructura de Apalancamiento

```javascript
{
    "info": { ... }             // response from the exchange
    "symbol": "BTC/USDT:USDT",  // unified market symbol
    "marginMode": "cross",      // the margin mode either cross or isolated
    "longLeverage": 100,        // the set leverage for a long position
    "shortLeverage": 75,        // the set leverage for a short position
}
```

## Trading de Contratos

Esto puede incluir futuros con una fecha de vencimiento fija, swaps perpetuos con pagos de financiamiento, y futuros o swaps inversos.
La información sobre las posiciones puede provenir de diferentes endpoints dependiendo del exchange.
En el caso de que haya múltiples endpoints que sirvan diferentes tipos de derivados, CCXT tomará por defecto solo los contratos "lineales" (en contraposición a los "inversos") o los contratos "swap" (en contraposición a los de "futuro").

### Posiciones

*solo contratos*

Para obtener información sobre las posiciones actualmente mantenidas en mercados de contratos, usa

- fetchPosition ()            // para un mercado único
- fetchPositions ()           // para todas las posiciones
- fetchAccountPositions ()    // TODO
- fetchPositionHistory ()     // para una posición histórica única
- fetchPositionsHistory ()     // para posiciones históricas

```javascript
fetchPosition (symbol, params = {})                         // for a single market
```

Parámetros

- **symbol** (String) *requerido* Símbolo de mercado CCXT unificado (p. ej. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Retorna

- Una [estructura de posición](#position-structure)

```javascript
fetchPositions (symbols = undefined, params = {})
fetchAccountPositions (symbols = undefined, params = {})
```

Parámetros

- **symbols** (\[String\]) Símbolos de mercado CCXT unificados; no establecer para recuperar todas las posiciones (p. ej. `["BTC/USDT:USDT"]`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Retorna

- Un array de [estructuras de posición](#position-structure)

```javascript
fetchPositionHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

Parámetros

- **symbol** (\[String\]) Símbolos de mercado CCXT unificados; no establecer para recuperar todas las posiciones (p. ej. `["BTC/USDT:USDT"]`)
- **since** (Integer) Marca de tiempo (ms) del momento más temprano para recuperar posiciones (p. ej. `1646940314000`)
- **limit** (Integer) El número de [estructuras de posición](#position-structure) a recuperar (p. ej. `5`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Retorna

- Un array de [estructuras de posición](#position-structure)

#### Estructura de Posición

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
Las posiciones te permiten tomar prestado dinero de un exchange para ir largo o corto en un mercado. Algunos exchanges requieren que pagues una comisión de financiamiento para mantener la posición abierta.

Cuando vas largo en una posición estás apostando a que el precio será más alto en el futuro y que el precio nunca será inferior al `liquidationPrice`.

A medida que cambia el precio del índice subyacente, también cambia el unrealisedPnl y, como consecuencia, la cantidad de colateral que te queda en la posición (ya que solo puedes cerrarla al precio de mercado o peor). En algún precio tendrás cero colateral restante, esto se llama el precio de "bust" o "cero". Más allá de este punto, si el precio va en la dirección opuesta lo suficiente, el colateral de la posición caerá por debajo del `maintenanceMargin`. El maintenanceMargin actúa como un búfer de seguridad entre tu posición y el colateral negativo, un escenario en el que el exchange incurre en pérdidas en tu nombre. Para protegerse, el exchange liquidará rápidamente tu posición si y cuando esto suceda. Incluso si el precio vuelve por encima del liquidationPrice no recuperarás tu dinero ya que el exchange vendió todos los `contracts` que compraste al precio de mercado. En otras palabras, el maintenanceMargin es una comisión oculta por tomar dinero prestado.

Se recomienda usar `maintenanceMargin` e `initialMargin` en lugar de `maintenanceMarginPercentage` e `initialMarginPercentage` ya que estos tienden a ser más precisos. El maintenanceMargin podría calcularse a partir de otros factores fuera del maintenanceMarginPercentage, incluida la tasa de financiamiento y las comisiones de taker, por ejemplo en [kucoin](https://futures.kucoin.com/contract/detail).

Un contrato inverso te permitirá ir largo o corto en BTC/USD poniendo BTC como colateral. Nuestra API para contratos inversos es la misma que para contratos lineales. Los montos en un contrato inverso se cotizan como si se negociaran USD/BTC, sin embargo el precio sigue cotizándose en términos de BTC/USD. La fórmula para las ganancias y pérdidas de un contrato inverso es `(1/markPrice - 1/price) * contracts`. Las ganancias y pérdidas y el colateral ahora se cotizarán en BTC, y el número de contratos se cotiza en USD.

#### Cerrar Posiciones

*solo contratos*

Para cerrar rápidamente posiciones abiertas con una orden de mercado, usa

- closePosition (symbol)               // para un mercado único
- closeAllPositions (symbol)           // para todas las posiciones

```typescript
closePosition (symbol: string, side: OrderSide = undefined, params = {}): Promise<Order>
```

Parámetros

- **symbol** (String) *requerido* Símbolo de mercado CCXT unificado (p. ej. `"BTC/USDT:USDT"`)
- **side** *opcional* una cadena literal para la dirección de tu orden. Algunos exchanges la requieren.
  **Lados unificados:**
  - `buy` entrega moneda cotizada y recibe moneda base; por ejemplo, comprar `BTC/USD` significa que recibirás bitcoins por tus dólares.
  - `sell` entrega moneda base y recibe moneda cotizada; por ejemplo, vender `BTC/USD` significa que recibirás dólares por tus bitcoins.
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Retorna

- Una [estructura de orden](#order-structure)

```typescript
closeAllPositions (params = {}): Promise<Position[]>
```

Parámetros
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Retorna

- Una lista de [estructuras de orden](#order-structure)


### Modo de Posición

*solo margen y contratos*

Método usado para establecer el modo de posición:

```javascript
setPositionMode (hedged, symbol = undefined, params = {})
```

Parámetros

- **hedged** (String) *requerido* valor del modo cubierto:
    - `true` - establece el modo **cubierto**
    - `false` - establece el modo **unidireccional**
- **symbol** (String) Símbolo de mercado CCXT unificado (p. ej. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange

Método usado para obtener el modo de posición:

```javascript
fetchPositionMode (symbol = undefined, params = {}) {
```

Parámetros

- **symbol** (String) Símbolo de mercado CCXT unificado (p. ej. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange

Retorna

```javascript
{
    'info': { ... },
    'hedged': true,
}
```


#### Precio de Liquidación

Es el precio al que `initialMargin + unrealized = collateral = maintenanceMargin`. El precio ha ido en la dirección opuesta a tu posición hasta el punto donde solo queda colateral de maintenanceMargin y si continúa avanzando la posición tendrá colateral negativo.

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

### Historial de Financiamiento

*solo contratos*

Los contratos de swap perpetuo (también conocidos como futuros perpetuos) mantienen un precio de mercado que refleja el precio del activo en el que están basados porque las comisiones de financiamiento se intercambian entre los traders que mantienen posiciones en los mercados de swap perpetuo.

Si el contrato se está negociando a un precio superior al precio del activo que representa, entonces los traders en posiciones largas pagan una comisión de financiamiento a los traders en posiciones cortas en momentos específicos del día, lo que alienta a más traders a entrar en posiciones cortas antes de esos momentos.

Si el contrato se está negociando a un precio inferior al precio del activo que representa, entonces los traders en posiciones cortas pagan una comisión de financiamiento a los traders en posiciones largas en momentos específicos del día, lo que alienta a más traders a entrar en posiciones largas antes de esos momentos.

Estas comisiones generalmente se intercambian entre traders sin que ninguna comisión vaya al exchange

El método `fetchFundingHistory` puede usarse para recuperar el historial de comisiones de financiamiento pagadas o recibidas de una cuenta

```javascript
fetchFundingHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

Parámetros

- **symbol** (String) Símbolo de mercado CCXT unificado (p. ej. `"BTC/USDT:USDT"`)
- **since** (Integer) Marca de tiempo (ms) del momento más temprano para recuperar el historial de financiamiento (p. ej. `1646940314000`)
- **limit** (Integer) El número de [estructuras de historial de financiamiento](#funding-history-structure) a recuperar (p. ej. `5`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"endTime": 1645807945000}`)

Retorna

- Un array de [estructuras de historial de financiamiento](#funding-history-structure)

#### Estructura de Historial de Financiamiento

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


### Conversión

El método `fetchConvertQuote` puede usarse para recuperar una cotización que puede usarse para una operación de conversión.
La cotización generalmente debe usarse dentro de un cierto período de tiempo especificado por el exchange para que la operación de conversión se ejecute con éxito.

```javascript
fetchConvertQuote (fromCode, toCode, amount = undefined, params = {})
```

Parámetros

- **fromCode** (String) *requerido* El código de moneda CCXT unificado para la moneda a convertir (p. ej. `"USDT"`)
- **toCode** (String) *requerido* El código de moneda CCXT unificado para la moneda a la que se convertirá (p. ej. `"USDC"`)
- **amount** (Float) Cantidad a convertir en unidades de la moneda de origen (p. ej. `20.0`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"toAmount": 2.9722}`)

Retorna

- Una [estructura de conversión](#conversion-structure)

El método `createConvertTrade` puede usarse para crear una orden de operación de conversión usando el id recuperado de fetchConvertQuote.
La cotización generalmente debe usarse dentro de un cierto período de tiempo especificado por el exchange para que la operación de conversión se ejecute con éxito.

```javascript
createConvertTrade (id, fromCode, toCode, amount = undefined, params = {})
```

Parámetros

- **id** (String) *requerido* Id de cotización de conversión (p. ej. `1645807945000`)
- **fromCode** (String) *requerido* El código de moneda CCXT unificado para la moneda a convertir (p. ej. `"USDT"`)
- **toCode** (String) *requerido* El código de moneda CCXT unificado para la moneda a la que se convertirá (p. ej. `"USDC"`)
- **amount** (Float) Cantidad a convertir en unidades de la moneda de origen (p. ej. `20.0`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"toAmount": 2.9722}`)

Retorna

- Una [estructura de conversión](#conversion-structure)

El método `fetchConvertTrade` se puede usar para obtener una operación de conversión específica mediante el id de la operación.

```javascript
fetchConvertTrade (id, code = undefined, params = {})
```

Parámetros

- **id** (String) *requerido* Id de la operación de conversión (p. ej. `"80794187SDHJ25"`)
- **code** (String) El código de moneda unificado de la operación de conversión (p. ej. `"USDT"`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"toAmount": 2.9722}`)

Retorna

- Una [estructura de conversión](#conversion-structure)

El método `fetchConvertTradeHistory` se puede usar para obtener el historial de conversiones de un código de moneda especificado.

```javascript
fetchConvertTradeHistory (code = undefined, since = undefined, limit = undefined, params = {})
```

Parámetros

- **code** (String) El código de moneda unificado para el cual obtener el historial de operaciones de conversión (p. ej. `"USDT"`)
- **since** (Integer) Marca de tiempo de la conversión más antigua (p. ej. `1645807945000`)
- **limit** (Integer) El número máximo de estructuras de conversión a recuperar (p. ej. `10`)
- **params** (Dictionary) Parámetros específicos del endpoint de la API del exchange (p. ej. `{"toAmount": 2.9722}`)

Retorna

- Un array de [estructuras de conversión](#conversion-structure)

#### Estructura de Conversión

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

*solo contratos*

Use los métodos `fetchPositionADLRank` o `fetchPositionsADLRank` para obtener los detalles privados del rango de auto desapalancamiento de una posición en el exchange.

```javascript
fetchPositionADLRank (symbol, params = {})
```

Parámetros

- **symbol** (String) Símbolo de mercado unificado de CCXT (p. ej. `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (p. ej. `{"category": "futures"}`)

Retorna

- Una [estructura de auto desapalancamiento](#auto-de-leverage)

```javascript
fetchPositionsADLRank (symbols, params = {})
```

Parámetros

- **symbols** (\[String\]) Una lista de símbolos unificados de CCXT (p. ej. `[ "BTC/USDT:USDT" ]`)
- **params** (Dictionary) Parámetros adicionales específicos del endpoint de la API del exchange (p. ej. `{"category": "futures"}`)

Retorna

- Una lista de [estructuras de auto desapalancamiento](#auto-de-leverage)

### Estructura de Auto De Leverage

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

En algunos casos específicos puede que desee un proxy, cuando:
- El exchange no está disponible en su ubicación
- Su IP está bloqueada por el exchange
- Experimenta restricciones aleatorias por parte del exchange, como [protección DDoS por Cloudflare](#ddos-protection-by-cloudflare-incapsula)

Sin embargo, tenga en cuenta que cada intermediario adicional puede añadir algo de latencia a las solicitudes.

**Nota para usuarios de Go:** Después de configurar cualquier propiedad de proxy, debe llamar a `UpdateProxySettings()` para aplicar los cambios:
```go
exchange := ccxt.NewBinance(nil)
exchange.ProxyUrl = "http://your-proxy-url:8080"
exchange.UpdateProxySettings()  // Required in Go to apply proxy settings
```
Sin embargo, tenga en cuenta que cada intermediario adicional puede añadir algo de latencia a las solicitudes.

### Tipos de proxy soportados
CCXT soporta los siguientes tipos de proxy (note que cada uno también tiene [soporte de callbacks](#using-proxy-callbacks)):

#### proxyUrl

Esta propiedad antepone una URL a las solicitudes de la API. Puede ser útil para redirecciones simples o para [evitar la restricción CORS del navegador](#cors-access-control-allow-origin).
```
ex = ccxt.binance();
ex.proxyUrl = 'YOUR_PROXY_URL';
```
mientras que 'YOUR_PROXY_URL' podría ser como (use la barra diagonal según corresponda):
- `https://cors-anywhere.herokuapp.com/`
- `http://127.0.0.1:8080/`
- `http://your-website.com/sample-script.php?url=`
- etc

Por lo tanto, las solicitudes se realizarán a, por ejemplo, `https://cors-anywhere.herokuapp.com/https://exchange.xyz/api/endpoint`. (También puede tener un pequeño script de proxy ejecutándose en su dispositivo/servidor web para usarlo en `.proxyUrl` - "sample-local-proxy-server" en la [carpeta de ejemplos](https://github.com/ccxt/ccxt/tree/master/examples)). Para personalizar la URL de destino, también puede sobreescribir el método `urlEncoderForProxyUrl` de la instancia.

Este enfoque funciona **solo para solicitudes REST**, pero no para conexiones WebSocket. ((_Cómo probar si su proxy funciona_))[#test-if-your-proxy-works]

#### httpProxy y httpsProxy
Para configurar un proxy http(s) real para sus scripts, necesita tener acceso a un [proxy http o https](https://stackoverflow.com/q/10440690/2377343) remoto, de modo que las llamadas se realicen directamente al exchange de destino, enrutadas a través de su servidor proxy:
```
ex.httpProxy = 'http://1.2.3.4:8080/';
// or
ex.httpsProxy = 'http://1.2.3.4:8080/';
```
Este enfoque solo afecta las solicitudes **no-websocket** de ccxt. Para enrutar las conexiones WebSocket de CCXT a través de un proxy, debe configurar específicamente la propiedad `wsProxy` (o `wssProxy`), además de `httpProxy` (o `httpsProxy`), por lo que su script debería ser así:
```
ex.httpProxy = 'http://1.2.3.4:8080/';
ex.wsProxy   = 'http://1.2.3.4:8080/';
```
Así, ambas conexiones (HTTP y WS) pasarían a través de los proxies.
((_Cómo probar si su proxy funciona_))[#test-if-your-proxy-works]


#### socksProxy
También puede usar un [proxy socks](https://www.google.com/search?q=what+is+socks+proxy) con el siguiente formato:
```
// from protocols: socks, socks5, socks5h
ex.socksProxy = 'socks5://1.2.3.4:8080/';
ex.wsSocksProxy = 'socks://1.2.3.4:8080/';
```
((_Cómo probar si su proxy funciona_))[#test-if-your-proxy-works]

#### Probar si su proxy funciona
Después de configurar cualquiera de las propiedades de proxy mencionadas anteriormente en su fragmento de ccxt, puede probar si funciona haciendo ping a algunos sitios web que devuelven la IP - consulte el archivo "proxy-usage" en los [ejemplos](https://github.com/ccxt/ccxt/blob/master/examples/).

#### uso de callbacks de proxy
**En lugar de configurar una propiedad, también puede usar los callbacks `proxyUrlCallback, http(s)ProxyCallback, socksProxyCallback`:
```
myEx.proxyUrlCallback = function (url, method, headers, body) { ... return 'http://1.2.3.4/'; }
```

### detalles adicionales relacionados con el proxy

#### userAgent

Si lo necesita para casos especiales, puede sobreescribir la propiedad `userAgent` así:
```
exchange.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'
```

#### agentes proxy personalizados

Dependiendo de su lenguaje de programación, puede configurar agentes proxy personalizados.
 - Para JS, consulte [este ejemplo](
https://github.com/ccxt/ccxt/blob/master/examples/js/custom-proxy-agent-for-js.js)
 - Para Python, consulte los siguientes ejemplos: [proxies-for-synchronous-python](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxies-for-synchronous-python.py), [proxy-asyncio-aiohttp-python-3](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxy-asyncio-aiohttp-python-3.py), [proxy-asyncio-aiohttp-socks](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxy-asyncio-aiohttp-socks.py), [proxy-sync-python-requests-2-and-3](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxy-sync-python-requests-2-and-3.py)

#### CORS (Access-Control-Allow-Origin)

CORS (conocido como [Intercambio de Recursos de Origen Cruzado](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)) afecta principalmente a los navegadores y es la causa del conocido aviso `No 'Access-Control-Allow-Origin' header is present on the requested resource`. Ocurre cuando un script (ejecutándose en un navegador) realiza una solicitud a un dominio de terceros (por defecto dichas solicitudes están bloqueadas, a menos que el dominio de destino lo permita explícitamente).
Por lo tanto, en tales casos necesitará comunicarse con un proxy "CORS", que redirigiría las solicitudes (a diferencia de las solicitudes directas del lado del navegador) al exchange de destino. Para configurar un proxy CORS, puede ejecutar el archivo de ejemplo [sample-local-proxy-server-with-cors](https://github.com/ccxt/ccxt/blob/master/examples/) y en ccxt establecer la propiedad [`.proxyUrl`](#proxyurl) para enrutar las solicitudes a través del servidor cors/proxy.

## Matemáticas de Cadenas

Algunos usuarios pueden querer controlar cómo CCXT maneja las operaciones aritméticas. Aunque por defecto usa tipos numéricos, los usuarios pueden cambiar a matemáticas de punto fijo usando tipos de cadena. Esto se puede hacer mediante:


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


# Manejo de Errores

- [Mecanismo de Reintento](#retry-mechanism)
- [Jerarquía de Excepciones](#exception-hierarchy)
- [ExchangeError](#exchangeerror)
- [OperationFailed](#operationfailed)
- [DDoSProtection](#ddosprotection)
- [RateLimitExceeded](#ratelimitexceeded)
- [RequestTimeout](#requesttimeout)
- [RequestTimeout](#requesttimeout)
- [ExchangeNotAvailable](#exchangenotavailable)
- [InvalidNonce](#invalidnonce)

El manejo de errores con CCXT se realiza mediante el mecanismo de excepciones disponible de forma nativa en todos los lenguajes.

Para manejar los errores debe agregar un bloque `try` alrededor de la llamada a un método unificado y capturar las excepciones como lo haría normalmente en su lenguaje:

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

Para pipelines asíncronas (`fetchTickerAsync`, etc.), `CompletableFuture` envuelve
los errores lanzados en `CompletionException`. Use `Helpers.unwrap()` dentro de
`.exceptionally(...)` para desenvolver el contenedor y hacer coincidir el patrón
con el error ccxt subyacente:

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


## Mecanismo de Reintento
Al trabajar con solicitudes HTTP, es importante entender que las solicitudes pueden fallar por diversas razones. Las causas comunes de estos fallos incluyen que el servidor no esté disponible, inestabilidad de la red o problemas temporales del servidor. Para manejar estos escenarios de forma adecuada, CCXT ofrece una opción para reintentar automáticamente las solicitudes fallidas. Puede establecer el valor de `maxRetriesOnFailure` y `maxRetriesOnFailureDelay` para configurar el número de reintentos y el retraso entre reintentos, por ejemplo:

```python
exchange.options['maxRetriesOnFailure'] = 3 # if we get an error like the ones mentioned above we will retry up to three times per request
exchange.options['maxRetriesOnFailureDelay'] = 1000 # we will wait 1000ms (1s) between retries
```

Es importante destacar que solo los problemas relacionados con el servidor/red formarán parte del mecanismo de reintento; si el usuario obtiene un error debido a `InsufficientFunds` o `InvalidOrder`, la solicitud no se repetirá.

## Jerarquía de Excepciones

Todas las excepciones derivan de la excepción base BaseError, que a su vez está definida en la biblioteca ccxt de la siguiente manera:


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


La jerarquía de herencia de excepciones se encuentra en este archivo: https://github.com/ccxt/ccxt/blob/master/ts/src/base/errorHierarchy.ts , y visualmente puede esquematizarse como se muestra a continuación:

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

La clase `BaseError` es una clase de error raíz genérica para todo tipo de errores, incluidos los de accesibilidad y los de discordancia entre solicitud/respuesta. Si no necesita capturar ninguna subclase específica de excepciones, puede usar simplemente `BaseError`, donde se capturan todos los tipos de excepciones.

De `BaseError` derivan dos familias diferentes de errores: `OperationFailed` y `ExchangeError` (también tienen sus subtipos específicos, como se explica a continuación).

### OperationFailed


Un `OperationFailed` puede ocurrir cuando el usuario envía una **solicitud correctamente construida y válida** al exchange, pero se produjo un problema no determinista:
- mantenimiento en curso
- problemas de conectividad a internet/red
- protecciones DDoS
- "Servidor ocupado, inténtelo de nuevo"...

Estas excepciones son temporales y volver a intentar la solicitud puede ser suficiente. Sin embargo, si el error persiste, puede indicar un problema persistente con el exchange o con su conexión.

`OperationFailed` tiene los siguientes subtipos: `RequestTimeout`, `DDoSProtection` (incluye el subtipo `RateLimitExceeded`), `ExchangeNotAvailable`, `InvalidNonce`.


#### DDoSProtection

Esta excepción se lanza en casos en que los servicios en la nube/alojamiento (Cloudflare, Incapsula u otros) limitan las solicitudes del usuario/región/ubicación o cuando la API del exchange restringe al usuario por realizar solicitudes anormales. Esta excepción también contiene la excepción de subtipo específico `RateLimitExceeded`, que significa directamente que el usuario realiza solicitudes con más frecuencia de la tolerada por el motor de la API del exchange.

#### RequestTimeout

Esta excepción se genera cuando la conexión con el exchange falla o los datos no se reciben completamente en un tiempo especificado. Esto está controlado por la propiedad `.timeout` del exchange. Cuando se genera un `RequestTimeout`, el usuario no conoce el resultado de una solicitud (si fue aceptada por el servidor del exchange o no).

Por lo tanto, se recomienda manejar este tipo de excepción de la siguiente manera:

- para solicitudes de obtención de datos es seguro reintentar la llamada
- para una solicitud a `cancelOrder()` el usuario debe reintentar la misma llamada una segunda vez. Un reintento posterior a `cancelOrder()` devolverá uno de los siguientes resultados posibles:
  - la solicitud se completa con éxito, lo que significa que la orden se ha cancelado correctamente ahora
  - se genera una excepción `OrderNotFound`, lo que significa que la orden ya fue cancelada en el primer intento o fue ejecutada (completada y cerrada) en el intervalo entre los dos intentos.
- si una solicitud a `createOrder()` falla con un `RequestTimeout` el usuario debe:
  - llamar a `fetchOrders()`, `fetchOpenOrders()`, `fetchClosedOrders()` para verificar si la solicitud de colocación de la orden tuvo éxito y la orden está ahora abierta
  - si la orden no está `'open'` el usuario debe llamar a `fetchBalance()` para verificar si el saldo ha cambiado desde que se creó la orden en la primera ejecución y luego fue completada y cerrada en el momento de la segunda verificación.

#### ExchangeNotAvailable

Este tipo de excepción se lanza cuando el exchange subyacente no está disponible. La biblioteca ccxt también lanza este error si detecta alguna de las siguientes palabras clave en la respuesta:

  - `offline`
  - `unavailable`
  - `busy`
  - `retry`
  - `wait`
  - `maintain`
  - `maintenance`
  - `maintenancing`

#### InvalidNonce

Se lanza cuando tu nonce es menor que el nonce anterior utilizado con tu par de claves, tal como se describe en la sección de [Autenticación](#authentication). Este tipo de excepción se lanza en los siguientes casos (en orden de precedencia para la verificación):

  - No estás limitando la tasa de tus solicitudes o estás enviando demasiadas con demasiada frecuencia.
  - Tus claves API no son nuevas y recientes (ya han sido usadas con algún otro software o script; crea siempre un nuevo par de claves cuando agregues este o aquel exchange).
  - El mismo par de claves está compartido entre múltiples instancias de la clase del exchange (por ejemplo, en un entorno multihilo o en procesos separados).
  - El reloj de tu sistema está desincronizado. La hora del sistema debe sincronizarse con UTC en una zona horaria sin horario de verano con una frecuencia de al menos cada diez minutos, o incluso con mayor frecuencia, debido a la deriva del reloj. **¡Activar la sincronización de hora en Windows generalmente no es suficiente!** Debes configurarlo en el Registro del sistema operativo (busca en Google *"time synch frequency"* para tu sistema operativo).


### ExchangeError

En contraste con `OperationFailed`, el `ExchangeError` ocurre principalmente cuando la solicitud es imposible de completar con éxito (por los factores enumerados a continuación), por lo que aunque la repitas cientos de veces, seguirá fallando, ya que la solicitud se está realizando de manera incorrecta.

Posibles razones para esta excepción:

  - el endpoint ha sido desactivado por el exchange
  - el símbolo no se encuentra en el exchange
  - falta un parámetro requerido
  - el formato de los parámetros es incorrecto
  - algún problema del lado del usuario que debe corregirse

`ExchangeError` tiene los siguientes subtipos de excepciones:

  - `NotSupported`: cuando el endpoint/operación no es ofrecido ni soportado por la API del exchange.
  - `BadRequest`: el usuario envía una solicitud/parámetro/acción **incorrectamente** construida que es inválida o no permitida (por ejemplo: "número inválido", "símbolo prohibido", "tamaño fuera de los límites mínimos/máximos", "precisión incorrecta", etc.). Reintentar no ayudaría en este caso; la solicitud debe corregirse o ajustarse primero.
  - `OperationRejected` - el usuario envía una solicitud **correctamente** construida (que en un caso típico debería ser aceptada por el exchange), pero algún factor determinista impide que la solicitud tenga éxito. Por ejemplo, el estado actual de tu cuenta podría no permitirlo (es decir, "cierra las posiciones existentes antes de cambiar el apalancamiento", "demasiadas órdenes pendientes", "tu cuenta está en un modo de posición/margen incorrecto") o en ese momento el símbolo no es negociable (por ejemplo, "MarketClosed") o hay factores explicados donde debes tomar una acción específica (es decir, cambiar alguna configuración primero, o esperar hasta un momento específico). En resumen: [**OperationFailed**](#operationfailed) puede reintentarse sin más y debería tener éxito, mientras que `OperationRejected` es un fallo que depende de factores específicos y exactos que deben considerarse antes de poder reintentar la solicitud.
  - `AuthenticationError`: cuando un exchange requiere una de las credenciales API que olvidaste especificar, o cuando hay un error en el par de claves o un nonce desactualizado. La mayoría de las veces necesitas `apiKey` y `secret`; a veces también necesitas `uid` y/o `password` si la API del exchange lo requiere.
  - `PermissionDenied`: cuando no hay acceso para la acción especificada o los permisos son insuficientes para la `apiKey` especificada.
  - `InsufficientFunds`: cuando no tienes suficiente moneda en el saldo de tu cuenta para colocar una orden.
  - `InvalidAddress`: cuando se encuentra una dirección de financiamiento incorrecta o una dirección de financiamiento más corta que `.minFundingAddressLength` (10 caracteres por defecto) en una llamada a `fetchDepositAddress`, `createDepositAddress` o `withdraw`.
  - `InvalidOrder`: la clase base para todas las excepciones relacionadas con la API unificada de órdenes.
  - `OrderNotFound`: cuando intentas obtener o cancelar una orden que no existe.

### Manejo de errores de marca de tiempo

Los usuarios pueden encontrar ocasionalmente errores como:

> "La marca de tiempo para esta solicitud está fuera del recvWindow."
> "Solicitud inválida, por favor verifica la marca de tiempo de tu servidor o el parámetro recv_window."
> "La marca de tiempo para esta solicitud estaba 1000ms por delante de la hora del servidor."

Estos problemas pueden surgir por varias razones:

#### 1. Desincronización del reloj del sistema
El reloj del sistema de tu dispositivo puede no estar correctamente sincronizado con los estándares de tiempo globales, lo que genera discrepancias en las marcas de tiempo.
Para resolverlo, asegúrate de que el reloj de tu sistema sea preciso al milisegundo. Esto no debe ser un ajuste único — configura tu sistema operativo para sincronizar la hora periódicamente (por ejemplo, cada hora) para mantener la precisión.

#### 2. Latencia de red o solicitudes retrasadas
Si el reloj de tu dispositivo está correctamente sincronizado, pero los retrasos de red hacen que las solicitudes tarden más que la ventana aceptada por el exchange (comúnmente alrededor de `5` segundos, aunque esto varía según el exchange), tu solicitud puede ser rechazada.


Si el problema persiste, puedes comparar tu marca de tiempo local con la hora del servidor del exchange para diagnosticar discrepancias:

```
for i in range(0, 20):
    local_time = exchange.milliseconds()
    exchange_time = await exchange.fetch_time()
    print(exchange_time - local_time)
```

####  Ajuste de opciones del exchange

Si continúas experimentando errores de marca de tiempo después de verificar la sincronización, puedes modificar ciertas opciones del exchange para ayudar a mitigar el problema.

A) `exchange.options['adjustForTimeDifference'] = True`
o ampliar la ventana a, por ejemplo, 10 segundos (solo si un exchange lo soporta; busca esta palabra clave en el [archivo del exchange](https://github.com/ccxt/ccxt/tree/master/ts/src) objetivo):
B) `exchange.options['recvWindow'] = 10000`


Para pasos adicionales de resolución de problemas, discusiones de la comunidad y problemas relacionados con marcas de tiempo y `recvWindow`, consulta los siguientes hilos de GitHub:

- [CCXT Issue #773](https://github.com/ccxt/ccxt/issues/773)
- [CCXT Issue #850](https://github.com/ccxt/ccxt/issues/850)
- [CCXT Issue #936](https://github.com/ccxt/ccxt/issues/936)

# Resolución de problemas

En caso de que tengas dificultades para conectarte a un exchange en particular, haz lo siguiente en orden de precedencia:

- Asegúrate de tener la versión más reciente de ccxt.
  Nunca confíes en tu instalador de paquetes (ya sea `npm`, `pip` o `composer`); en su lugar, siempre verifica tu **número de versión real en tiempo de ejecución** ejecutando este código en tu entorno:
  ```javascript
  console.log (ccxt.version) // JavaScript
  ```
  ```python
  print('CCXT version:', ccxt.__version__)  # Python
  ```
  ```php
  echo "CCXT v." . \ccxt\Exchange::VERSION . "\n"; // PHP
  ```
- Revisa los [Issues](https://github.com/ccxt/ccxt/issues) o los [Anuncios](#announcements) para ver actualizaciones recientes.
- Asegúrate de no haber desactivado el [limitador de tasa con `enableRateLimit: false`](#rate-limit) (si alguien tiene una solución de límite de tasa personalizada, asegúrate de que no funcione incorrectamente).
- Si usas la funcionalidad de proxy de ccxt, asegúrate de que no funcione incorrectamente.
- ¡Activa `verbose = true` para obtener más detalles sobre el problema!
  ```
  exchange = ccxt.binance()
  exchange.load_markets()
  exchange.verbose = True  # for less noise, you can set that after `load_markets`, but if the error happens during `load_markets` then place this line before it
  # ... your codes here ...
  ```
  Tu [código para reproducir el problema + salida detallada es necesario](/docs/faq#what-is-required-to-get-help) para obtener ayuda.
- Los usuarios de Python pueden activar el nivel de registro DEBUG con el registrador estándar de Python, añadiendo estas dos líneas al comienzo de su código:
  ```python
  import logging
  logging.basicConfig(level=logging.DEBUG)
  ```
- Usa el modo detallado para asegurarte de que las credenciales API utilizadas corresponden a las claves que deseas usar. Asegúrate de que no haya confusión de pares de claves.
- **Intenta con un par de claves nuevo si es posible.**
- Lee las respuestas a las Preguntas Frecuentes: /docs/faq
- ¡Verifica los permisos del par de claves en el sitio web del exchange!
- Verifica tu nonce. Si usaste tus claves API con otro software, lo más probable es que debas [sobreescribir tu función de nonce](#overriding-the-nonce) para que coincida con tu valor de nonce anterior. Normalmente un nonce puede restablecerse fácilmente generando un nuevo par de claves no utilizado. Si estás obteniendo errores de nonce con una clave existente, prueba con una nueva clave API que aún no haya sido usada.
- Verifica tu tasa de solicitudes si estás obteniendo errores de nonce. Tus solicitudes privadas no deben seguirse unas a otras rápidamente. No debes enviarlas una tras otra en una fracción de segundo o en poco tiempo. El exchange muy probablemente te bloqueará si no haces una pausa antes de enviar cada nueva solicitud. En otras palabras, no debes alcanzar su límite de tasa enviando solicitudes privadas ilimitadas con demasiada frecuencia. Añade un retraso a tus solicitudes subsiguientes o activa el limitador de tasa integrado, como se muestra en los [ejemplos](https://github.com/ccxt/ccxt/tree/master/examples) del sondeo prolongado, también [aquí](#order-book--market-depth).
- Lee la [documentación de tu exchange](/docs/exchange-markets) y compara tu salida detallada con la documentación.
- Verifica tu conectividad con el exchange accediendo a él desde tu navegador.
- Verifica tu conexión con el exchange a través de un [proxy](#proxy).
- Intenta acceder al exchange desde una computadora diferente o un servidor remoto, para ver si se trata de un problema local o global con el exchange.
- Verifica si hubo noticias recientes del exchange sobre tiempo de inactividad por mantenimiento. Algunos exchanges se desconectan regularmente para actualizaciones (como una vez por semana).
- Asegúrate de que la hora de tu sistema esté sincronizada con los relojes del resto del mundo, ya que de lo contrario podrías obtener errores de nonce inválido.

**Notas adicionales:**

- Usa la opción `verbose = true` o instancia tu exchange problemático con `new ccxt.exchange ({ 'verbose': true })` para ver las solicitudes y respuestas HTTP en detalle. La salida detallada también será útil para que podamos depurarlo si envías un issue en GitHub.
- ¡Usa el registro DEBUG en Python!
- Algunos exchanges no están disponibles en ciertos países; usar un [proxy](#proxy) puede ser la solución en esos casos.
- Si estás obteniendo errores de autenticación o errores de *'claves inválidas'*, lo más probable es que se deban a un problema de nonce.
- Algunos exchanges no indican claramente si fallan al autenticar tu solicitud. En esas circunstancias, pueden responder con un código de error exótico, como el Error HTTP 502 Bad Gateway o algo que está aún menos relacionado con la causa real del error.
