---
title: "Manual"
description: "A biblioteca ccxt é uma coleção de exchanges de criptomoedas disponíveis ou classes de exchanges. Cada classe implementa a API pública e privada de uma determinada exchange de criptomoedas…"
---

# Visão Geral

A biblioteca ccxt é uma coleção de *exchanges* de criptomoedas disponíveis ou classes de exchanges. Cada classe implementa a API pública e privada de uma determinada exchange de criptomoedas. Todas as exchanges são derivadas da classe base Exchange e compartilham um conjunto de métodos comuns. Para acessar uma exchange específica da biblioteca ccxt, é necessário criar uma instância da classe de exchange correspondente. As exchanges suportadas são atualizadas com frequência e novas exchanges são adicionadas regularmente.

A estrutura da biblioteca pode ser descrita da seguinte forma:

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

As APIs REST HTTP públicas e privadas completas para todas as exchanges estão implementadas em JavaScript, Python, PHP, C#, Go e Java. As implementações WebSocket estão disponíveis no [CCXT Pro](https://ccxt.pro), com suporte a streams WebSocket.

- [**Exchanges**](#exchanges)
- [**Mercados**](#markets)
- [**API Implícita**](#implicit-api)
- [**API Unificada**](#unified-api)
- [**API Pública**](#public-api)
- [**API Privada**](#private-api)
- [**Tratamento de Erros**](#error-handling)
- [**Solução de Problemas**](#troubleshooting)
- [**CCXT Pro**](#ccxt-pro)

## Social

- <sub>[![Twitter](https://img.shields.io/twitter/follow/ccxt_official?style=social)](https://twitter.com/ccxt_official)</sub> Siga-nos no Twitter
- <sub>[![Medium](https://img.shields.io/badge/read-our%20blog-black?logo=medium)](https://medium.com/@ccxt)</sub> Leia nosso blog no Medium
- <sub>[![Discord](https://img.shields.io/discord/690203284119617602?logo=discord&logoColor=white)](https://discord.gg/dhzSKYU)</sub> Entre no nosso Discord
- <sub>[![Telegram Chat](https://img.shields.io/badge/CCXT-Chat-blue?logo=telegram)](https://t.me/ccxt_chat)</sub> Chat CCXT no Telegram (suporte técnico)

- Canais de anúncios:
- - <sub>[![Telegram](https://img.shields.io/badge/CCXT-Channel-blue?logo=telegram)](https://t.me/ccxt_announcements)</sub>
- - <sub>[![Discord](https://img.shields.io/badge/CCXT-Channel-blue?logo=discord)](https://discord.com/channels/690203284119617602/1057748769690619984)</sub>


# Exchanges

- [Instanciação](#instantiation)
- [Estrutura da Exchange](#exchange-structure)
- [Limite de Taxa](#rate-limit)
<!--- init list -->A biblioteca CCXT suporta atualmente os seguintes 108 mercados de exchanges de criptomoedas e APIs de negociação:

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

Além de fazer ordens básicas de mercado e ordens limitadas, algumas corretoras oferecem negociação com margem (alavancagem), vários derivativos (como contratos futuros e opções) e também possuem [dark pools](https://en.wikipedia.org/wiki/Dark_pool), [OTC](https://en.wikipedia.org/wiki/Over-the-counter_(finance)) (negociação de balcão), APIs para comerciantes e muito mais.

## Instanciação

Para conectar a uma corretora e começar a negociar, você precisa instanciar uma classe de corretora da biblioteca ccxt.

Para obter a lista completa de ids das corretoras suportadas de forma programática:


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


Uma corretora pode ser instanciada como mostrado nos exemplos abaixo:


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

A biblioteca ccxt em PHP utiliza as funções de tempo UTC/GMT integradas, portanto, é necessário definir `date.timezone` no seu `php.ini` ou chamar a função [date_default_timezone_set()](http://php.net/manual/en/function.date-default-timezone-set.php) antes de usar a versão PHP da biblioteca. A configuração de fuso horário recomendada é `"UTC"`.

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


### Funcionalidades

As principais corretoras possuem a propriedade `.features` disponível, onde você pode ver quais métodos e funcionalidades são suportados para cada tipo de mercado (se algum método estiver definido como `null/undefined`, significa que o método "não é suportado" pela corretora)

*este recurso está atualmente em desenvolvimento e pode estar incompleto; sinta-se à vontade para reportar quaisquer problemas que encontrar*

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


### Sobrescrevendo Propriedades da Corretora na Instanciação

A maioria das propriedades da corretora, bem como opções específicas, pode ser sobrescrita no momento da instanciação da classe da corretora ou posteriormente, como mostrado abaixo:


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


### Sobrescrevendo Métodos da Corretora

Em todas as linguagens suportadas pelo CCXT, você pode sobrescrever métodos de instância em tempo de execução:


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


### Testnets e Ambientes Sandbox

Algumas corretoras também oferecem APIs separadas para fins de teste, que permitem aos desenvolvedores negociar dinheiro virtual gratuitamente e testar suas ideias. Essas APIs são chamadas de _"testnets", "sandboxes" ou "ambientes de staging"_ (com ativos virtuais de teste), em contraste com _"mainnets" e "ambientes de produção"_ (com ativos reais). Na maioria das vezes, uma API em sandbox é um clone da API de produção, ou seja, é literalmente a mesma API, exceto pela URL do servidor da corretora.

O CCXT unifica esse aspecto e permite que o usuário mude para a sandbox da corretora (se suportado pela corretora subjacente).
Para mudar para a sandbox, é necessário chamar `exchange.setSandboxMode (true)` ou `exchange.set_sandbox_mode(true)` **imediatamente após criar a corretora, antes de qualquer outra chamada**!


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


- O `exchange.setSandboxMode (true) / exchange.set_sandbox_mode (True)` deve ser sua primeira chamada imediatamente após criar a corretora (antes de qualquer outra chamada)
- Para obter as [chaves de API](#authentication) para a sandbox, o usuário deve se registrar no site sandbox da corretora em questão e criar um par de chaves sandbox
- **Chaves sandbox não são intercambiáveis com chaves de produção!**

## Estrutura da Corretora

Cada corretora possui um conjunto de propriedades e métodos, a maioria dos quais você pode sobrescrever passando um array associativo de parâmetros ao construtor da corretora. Você também pode criar uma subclasse e sobrescrever tudo.

Aqui está uma visão geral das propriedades genéricas de corretora com valores de exemplo:

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

### Propriedades da Corretora

Abaixo está uma descrição detalhada de cada uma das propriedades base da corretora:

- `id`: Cada corretora possui um id padrão. O id não é usado para nada, é um literal de string para fins de identificação da instância da corretora no código do usuário. Você pode ter múltiplos links para a mesma corretora e diferenciá-los por ids. Os ids padrão são todos em minúsculas e correspondem aos nomes das corretoras.

- `name`: Este é um literal de string contendo o nome legível da corretora.

- `countries`: Um array de literais de string com códigos de país ISO de 2 símbolos, indicando onde a corretora opera.

- `urls['api']`: O literal de string de URL base única para chamadas de API ou um array associativo de URLs separadas para APIs privadas e públicas.

- `urls['www']`: A URL principal do site HTTP.

- `urls['doc']`: Um único link de URL para a documentação original da API da corretora em seu site ou um array de links para a documentação.

- `version`: Um literal de string contendo o identificador de versão da API da corretora atual. A biblioteca ccxt acrescentará essa string de versão à URL Base da API em cada solicitação. Você não precisa modificá-la, a menos que esteja implementando uma nova API de corretora. O identificador de versão é geralmente uma string numérica que começa com a letra 'v' em alguns casos, como v1.1. Não sobrescreva a menos que esteja implementando sua própria nova classe de corretora de criptomoedas.

- `api`: Um array associativo contendo a definição de todos os endpoints de API expostos por uma corretora de criptomoedas. A definição da API é usada pelo ccxt para construir automaticamente métodos de instância chamáveis para cada endpoint disponível.

- `has`: Este é um array associativo de capacidades da corretora (por exemplo, `fetchTickers`, `fetchOHLCV` ou `CORS`).

- `timeframes`: Um array associativo de intervalos de tempo, suportados pelo método fetchOHLCV da corretora. Isso só é preenchido quando a propriedade `has['fetchOHLCV']` é verdadeira.

- `timeout`: Um timeout em milissegundos para um ciclo de solicitação-resposta (o timeout padrão é 10000 ms = 10 segundos). Se a resposta não for recebida nesse tempo, a biblioteca lançará uma exceção `RequestTimeout`. Você pode deixar o valor de timeout padrão ou defini-lo para um valor razoável. Aguardar indefinidamente sem timeout não é uma opção. Geralmente, você não precisa sobrescrever esta opção.

- `rateLimit`: O limite de taxa em milissegundos. Este valor representa o número de milissegundos a aguardar entre solicitações consecutivas para permanecer dentro dos limites de taxa da corretora. Por exemplo, se `rateLimit` for 1000, significa que 1 solicitação por segundo é permitida. O limitador de taxa integrado é habilitado por padrão e pode ser desativado definindo a propriedade `enableRateLimit` como false.

- `enableRateLimit`: Um valor booleano (true/false) que habilita o limitador de taxa integrado e regula as solicitações consecutivas. Esta configuração é `true` (habilitada) por padrão. **O usuário é obrigado a implementar seu próprio [limite de taxa](#rate-limit) ou deixar o limitador de taxa integrado habilitado para evitar ser banido da corretora**.

- `userAgent`: Um objeto para definir o cabeçalho HTTP User-Agent. A biblioteca ccxt definirá seu User-Agent por padrão. Algumas corretoras podem não gostar disso. Se você estiver tendo dificuldades para obter uma resposta de uma corretora e quiser desativar o User-Agent ou usar o padrão, defina este valor como false, undefined ou uma string vazia. O valor de `userAgent` pode ser sobrescrito pela propriedade HTTP `headers` abaixo.

- `headers`: Um array associativo de cabeçalhos HTTP e seus valores. O valor padrão é `{}` vazio. Todos os cabeçalhos serão adicionados a todas as solicitações. Se o cabeçalho `User-Agent` for definido dentro de `headers`, ele substituirá qualquer valor definido na propriedade `userAgent` acima.

- `verbose`: Um sinalizador booleano indicando se deve registrar solicitações HTTP no stdout (o sinalizador verbose é false por padrão). Usuários de Python têm uma forma alternativa de registro DEBUG com um logger pythônico padrão, que é habilitado adicionando estas duas linhas no início do código:
  ```python
  import logging
  logging.basicConfig(level=logging.DEBUG)
  ```
- `returnResponseHeaders`: Se definido como `true`, os cabeçalhos de resposta HTTP da corretora serão incluídos na propriedade `responseHeaders` dentro do campo `info` do resultado retornado para chamadas de API REST. Isso pode ser útil para acessar metadados como informações de limite de taxa ou cabeçalhos específicos da corretora. Por padrão, é `false` e os cabeçalhos não são incluídos na resposta. Nota: só é suportado quando a resposta é um objeto e não uma lista ou string

- `markets`: Um array associativo de mercados indexado por pares de negociação comuns ou símbolos. Os mercados devem ser carregados antes de acessar esta propriedade. Os mercados não estão disponíveis até que você chame o método `loadMarkets() / load_markets()` na instância da corretora.

- `symbols`: Um array não-associativo (uma lista) de símbolos disponíveis em uma corretora, ordenados em ordem alfabética. Estas são as chaves da propriedade `markets`. Os símbolos são carregados e recarregados a partir dos mercados. Esta propriedade é um atalho conveniente para todas as chaves de mercado.

- `currencies`: Um array associativo (um dicionário) de moedas por códigos (geralmente 3 ou 4 letras) disponíveis em uma corretora. As moedas são carregadas e recarregadas a partir dos mercados.

- `markets_by_id`: Um array associativo de arrays de mercados indexado por ids específicos da corretora. Tipicamente um array de comprimento um, a menos que haja múltiplos mercados com o mesmo marketId. Os mercados devem ser carregados antes de acessar esta propriedade.

- `apiKey`: Esta é sua string literal de chave de API pública. A maioria das corretoras requer [configuração de chaves de API](#api-keys-setup).

- `secret`: Sua string literal de chave de API secreta privada. A maioria das corretoras também requer isso junto com o apiKey.

- `password`: Um literal de string com sua senha/frase. Algumas corretoras requerem este parâmetro para negociar, mas a maioria não.

- `uid`: Um id único de sua conta. Pode ser um literal de string ou um número. Algumas corretoras também requerem isso para negociar, mas a maioria não.

- `requiredCredentials`: Um dicionário associativo unificado que mostra quais das credenciais de API acima são necessárias para enviar chamadas de API privadas para a corretora subjacente (uma corretora pode requerer um conjunto específico de chaves).

- `options`: Um dicionário associativo específico da corretora contendo chaves e opções especiais aceitas pela corretora subjacente e suportadas no CCXT.

- `precisionMode`: O modo de contagem de precisão decimal da corretora; leia mais sobre [Precisão e Limites](#precision-and-limits)

- Para proxies - `proxyUrl`, `httpUrl`, `httpsUrl`, `socksProxy`, `wsProxy`, `wssProxy`, `wsSocksProxy`: Uma URL de proxy específico. Consulte a seção [Proxy](#proxy) para mais detalhes.

Consulte esta seção sobre [Sobrescrevendo propriedades da corretora](#overriding-exchange-properties-upon-instantiation).

#### Metadados da Corretora

- `has`: Um array associativo contendo sinalizadores para as capacidades da corretora, incluindo os seguintes:

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

    O significado de cada sinalizador que indica a disponibilidade deste ou daquele método é:

    - um valor de `undefined` / `None` / `null` significa que o método não está implementado atualmente no ccxt (ou o ccxt ainda não o unificou, ou o método não está disponível nativamente na API da corretora)
    - booleano `false` significa especificamente que o endpoint não está disponível nativamente na API da corretora
    - booleano `true` significa que o endpoint está disponível nativamente na API da corretora e unificado na biblioteca ccxt
    - a string `'emulated'` significa que o endpoint não está disponível nativamente na API da corretora, mas é reconstruído (tanto quanto possível) pela biblioteca ccxt a partir de outros métodos verdadeiros disponíveis

    Para uma lista completa de todas as corretoras e seus métodos suportados, por favor, consulte este exemplo: https://github.com/ccxt/ccxt/blob/master/examples/js/exchange-capabilities.js

## Limite de Taxa

As corretoras geralmente impõem o que é chamado de *limite de taxa*. As corretoras lembram e rastreiam suas credenciais de usuário e seu endereço IP, e não permitem que você consulte a API com muita frequência. Elas equilibram sua carga e controlam o congestionamento de tráfego para proteger os servidores de API de (D)DoS e uso indevido.

**AVISO: Mantenha-se abaixo do limite de requisições para evitar banimento!**

A maioria das exchanges permite **até 1 ou 2 requisições por segundo**. As exchanges podem restringir temporariamente o seu acesso à API ou bani-lo por algum período de tempo se você fizer requisições de forma muito agressiva.

**A propriedade `exchange.rateLimit` está definida com um padrão seguro que é sub-ótimo. Algumas exchanges podem ter limites de requisições diferentes para endpoints distintos. Cabe ao usuário ajustar o `rateLimit` de acordo com os propósitos específicos da aplicação.**

A biblioteca CCXT possui algoritmos experimentais integrados de limitação de taxa que realizam o throttling necessário em segundo plano de forma transparente para o usuário. **AVISO: os usuários são responsáveis por pelo menos algum tipo de limitação de taxa: seja implementando um algoritmo personalizado ou utilizando o limitador de taxa integrado.**

O CCXT possui os seguintes algoritmos integrados de limitação de taxa:

- **Leaky Bucket (padrão)**: Funciona enfileirando requisições e liberando-as em uma taxa constante e fixa. Rajadas de requisições são suavizadas ao longo do tempo em vez de executadas imediatamente, o que ajuda a evitar atingir os limites de taxa das exchanges, ao mesmo tempo em que permite que picos curtos de atividade sejam tratados de forma adequada.
- **Baseado em Janela (opcional)**: Se o usuário fornecer a opção `{ 'rateLimiterAlgorithm': 'rollingWindow' }`, o ccxt muda do modelo de leaky bucket para um limitador de taxa baseado em janela (o tamanho da janela pode ser personalizado fornecendo `rollingWindowSize: X0000`; o CCXT usa 60s como tamanho de janela padrão). Um limitador baseado em janela impõe um número máximo de requisições dentro de uma janela de tempo fixa (por exemplo, N requisições por X milissegundos). Quando o limite é atingido, as requisições adicionais são adiadas até que a janela atual expire.

Você pode ativar/desativar o limitador de taxa integrado com a propriedade `.enableRateLimit`, da seguinte forma:


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


Caso suas chamadas atinjam um limite de taxa ou gerem erros de nonce, a biblioteca ccxt lançará uma exceção `InvalidNonce` ou, em alguns casos, um dos seguintes tipos:

- `DDoSProtection`
- `ExchangeNotAvailable`
- `ExchangeError`
- `InvalidNonce`

Uma nova tentativa posterior geralmente é suficiente para lidar com isso.

### Notas Sobre o Limitador de Taxa
#### Um Limitador de Taxa Por Cada Instância de Exchange

O limitador de taxa é uma propriedade da instância da exchange; em outras palavras, cada instância de exchange possui seu próprio limitador de taxa que não tem conhecimento das outras instâncias. Em muitos casos, o usuário deve reutilizar a mesma instância de exchange ao longo do programa. Não use múltiplas instâncias da mesma exchange com o mesmo par de chaves de API a partir do mesmo endereço IP.

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

Reutilize a instância da exchange tanto quanto possível, conforme mostrado abaixo:

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

Como o limitador de taxa pertence à instância da exchange, destruir a instância da exchange também destruirá o limitador de taxa. Um dos erros mais comuns com a limitação de taxa é criar e descartar a instância da exchange repetidamente. Se no seu programa você estiver criando e destruindo a instância da exchange (por exemplo, dentro de uma função chamada várias vezes), você estará efetivamente reiniciando o limitador de taxa repetidamente, o que eventualmente violará os limites de taxa. Se você estiver recriando a instância da exchange a cada vez em vez de reutilizá-la, o CCXT tentará carregar os mercados a cada vez. Portanto, você forçará o carregamento dos mercados repetidamente, conforme explicado na seção [Carregando Mercados](#loading-markets). O uso abusivo do endpoint de mercados também acabará por violar o limitador de taxa.

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

Não quebre esta regra a menos que você realmente entenda o funcionamento interno do limitador de taxa e tenha 100% de certeza do que está fazendo. Para se manter seguro, sempre reutilize a instância da exchange ao longo da cadeia de chamadas de suas funções e métodos, conforme mostrado abaixo:

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

### Proteção DDoS por Cloudflare / Incapsula

Algumas exchanges são protegidas contra [DDoS](https://en.wikipedia.org/wiki/Denial-of-service_attack) pelo [Cloudflare](https://www.cloudflare.com) ou [Incapsula](https://www.incapsula.com). Seu IP pode ser temporariamente bloqueado durante períodos de alta carga. Às vezes, eles até restringem países e regiões inteiras. Nesse caso, os servidores geralmente retornam uma página que indica um erro HTTP 40x ou executam um teste AJAX do seu navegador / teste de captcha e atrasam o recarregamento da página por vários segundos. Em seguida, seu navegador/impressão digital recebe acesso temporário e é adicionado a uma lista branca ou recebe um cookie HTTP para uso posterior.

Os sintomas mais comuns de um problema de proteção DDoS, problema de limitação de taxa ou problema de filtragem baseada em localização:
- Receber exceções `RequestTimeout` com todos os tipos de métodos de exchange
- Capturar `ExchangeError` ou `ExchangeNotAvailable` com códigos de erro HTTP 400, 403, 404, 429, 500, 501, 503, etc.
- Ter problemas de resolução DNS, problemas com certificados SSL e problemas de conectividade de baixo nível
- Receber uma página HTML de template em vez de JSON da exchange

Se você encontrar erros de proteção DDoS e não conseguir acessar uma exchange específica, então:

- use um [proxy](#proxy) (embora isso seja menos responsivo)
- peça ao suporte da exchange para adicioná-lo a uma lista branca
- tente um IP alternativo em uma região geográfica diferente
- execute seu software em uma rede distribuída de servidores
- execute seu software próximo à exchange (mesmo país, mesma cidade, mesmo datacenter, mesmo rack de servidores, mesmo servidor)
- ...

## Capacidade Máxima de Requisições

Na programação assíncrona, o CCXT permite agendar um número ilimitado de requisições. No entanto, há um limite no comprimento da fila, que por padrão é definido como no máximo 1000 requisições simultâneas. Se você tentar enfileirar mais do que isso, encontrará o erro: "throttle queue is over maxCapacity".

Na maioria dos casos, ter tantas tarefas pendentes indica um design sub-ótimo, pois novas requisições serão atrasadas até que as tarefas existentes sejam concluídas.

Dito isso, os usuários que desejam contornar essa restrição podem aumentar o maxCapacity padrão durante a instanciação, conforme mostrado abaixo:

```
ex = ccxt.binance({'options': {'maxRequestsQueue': 9999}})
```

# Mercados

- [Estrutura de Moeda](#currency-structure)
- [Estrutura de Mercado](#market-structure)
- [Precisão e Limites](#precision-and-limits)
- [Carregando Mercados](#loading-markets)
- [Símbolos e IDs de Mercado](#symbols-and-market-ids)
- [Recarga Forçada do Cache de Mercados](#market-cache-force-reload)

Cada exchange é um local para negociar algum tipo de ativo. As exchanges podem usar termos diferentes para chamá-los: _"uma moeda"_, _"um ativo"_, _"uma coin"_, _"um token"_, _"ação"_, _"commodity"_, _"cripto"_, "fiat", etc. Um local para negociar um ativo por outro geralmente é chamado de _"um mercado"_, _"um símbolo"_, _"um par de negociação"_, _"um contrato"_, etc.

Em termos da biblioteca ccxt, cada exchange oferece múltiplos **mercados** dentro de si. Cada mercado é definido por duas ou mais **moedas**. O conjunto de mercados difere de exchange para exchange, abrindo possibilidades para arbitragem entre exchanges e entre mercados.

## Estrutura de Moeda

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

Cada moeda é um array associativo (também conhecido como dicionário) com as seguintes chaves:

- `id`. O ID de string ou numérico da moeda dentro da exchange. Os IDs de moedas são usados internamente pelas exchanges para identificar coins durante o processo de requisição/resposta.
- `code`. Uma representação em string de código maiúsculo de uma moeda específica. Os códigos de moedas são usados para referenciar moedas dentro da biblioteca ccxt (explicado abaixo).
- `name`. Um nome legível por humanos da moeda (pode ser uma combinação de caracteres maiúsculos e minúsculos).
- `fee`. O valor da taxa de saque conforme especificado pela exchange. Na maioria dos casos, representa um valor fixo pago na mesma moeda. Se a exchange não especificar isso via endpoints públicos, a `fee` pode ser `undefined/None/null` ou estar ausente.
- `active`. Um booleano indicando se a negociação ou financiamento (depósito ou saque) desta moeda é atualmente possível; mais sobre isso aqui: [status `active`](#active-status).
- `info`. Um array associativo de propriedades de mercado não comuns, incluindo taxas, preços, limites e outras informações gerais de mercado. O array info interno é diferente para cada mercado específico; seu conteúdo depende da exchange.
- `precision`. Precisão aceita em valores pelas exchanges ao referenciar esta moeda. O valor desta propriedade depende de [`exchange.precisionMode`](#precision-mode).
- `limits`. Os mínimos e máximos para quantidades (volumes), saques e depósitos.

## Estrutura de Rede

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

Cada rede é um array associativo (também conhecido como dicionário) com as seguintes chaves:

- `id`. O ID de string ou numérico da rede dentro da exchange. Os IDs de rede são usados internamente pelas exchanges para identificar redes durante o processo de requisição/resposta.
- `network`. Uma representação em string maiúscula de uma rede específica. As redes são usadas para referenciar redes dentro da biblioteca ccxt.
- `name`. Um nome legível por humanos da rede (pode ser uma combinação de caracteres maiúsculos e minúsculos).
- `fee`. O valor da taxa de saque conforme especificado pela exchange. Na maioria dos casos, representa um valor fixo pago na mesma moeda. Se a exchange não especificar isso via endpoints públicos, a `fee` pode ser `undefined/None/null` ou estar ausente.
- `active`. Um booleano indicando se a negociação ou financiamento (depósito ou saque) desta moeda é atualmente possível; mais sobre isso aqui: [status `active`](#active-status).
- `info`. Um array associativo de propriedades de mercado não comuns, incluindo taxas, preços, limites e outras informações gerais de mercado. O array info interno é diferente para cada mercado específico; seu conteúdo depende da exchange.
- `precision`. Precisão aceita em valores pelas exchanges ao referenciar esta moeda. O valor desta propriedade depende de [`exchange.precisionMode`](#precision-mode).
- `limits`. Os mínimos e máximos para quantidades (volumes), saques e depósitos.

## Estrutura de Mercado

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

Cada mercado é um array associativo (também conhecido como dicionário) com as seguintes chaves:

- `id`. O ID de string ou numérico do mercado ou instrumento de negociação dentro da exchange. Os IDs de mercado são usados internamente pelas exchanges para identificar pares de negociação durante o processo de requisição/resposta.
- `symbol`. Uma representação em string de código maiúsculo de um par de negociação ou instrumento específico. Geralmente é escrito como `BaseCurrency/QuoteCurrency` com uma barra, como em `BTC/USD`, `LTC/CNY` ou `ETH/EUR`, etc. Os símbolos são usados para referenciar mercados dentro da biblioteca ccxt (explicado abaixo).
- `base`. Um código de string maiúsculo unificado da moeda base, seja fiat ou cripto. Este é o código de moeda padronizado usado para se referir a essa moeda ou token em todo o CCXT e em toda a API Unificada do CCXT; é a linguagem que o CCXT entende.
- `quote`. Um código de string maiúsculo unificado da moeda cotada, seja fiat ou cripto.
- `baseId`. Um ID específico da exchange para a moeda base deste mercado, não unificado. Pode ser qualquer string, literalmente. Isso é comunicado à exchange usando a linguagem que ela entende.
- `quoteId`. Um ID específico da exchange para a moeda cotada, não unificado.
- `active`. Um booleano indicando se a negociação neste mercado é atualmente possível ou não; mais sobre isso aqui: [status `active`](#active-status).
- `maker`. Float, 0,0015 = 0,15%. As taxas de maker são pagas quando você fornece liquidez à exchange, ou seja, você *cria* uma ordem e outra pessoa a preenche. As taxas de maker são geralmente menores que as taxas de taker. As taxas podem ser negativas, o que é muito comum entre exchanges de derivativos. Uma taxa negativa significa que a exchange pagará um rebate (recompensa) ao usuário por negociar neste mercado (note que 'taker' e 'maker' são taxas disponíveis publicamente, sem considerar seu nível vip/volume/etc. Use [`fetchTradingFees`](#fee-schedule) para obter as taxas específicas da sua conta).
- `taker`. Float, 0,002 = 0,2%. As taxas de taker são pagas quando você *retira* liquidez da exchange e preenche a ordem de outra pessoa.
- `percentage`. Um valor booleano verdadeiro/falso indicando se `taker` e `maker` são multiplicadores ou valores fixos.
- `tierBased`. Um valor booleano verdadeiro/falso indicando se a taxa depende do seu nível de negociação (geralmente, o volume negociado ao longo de um período de tempo).
- `info`. Um array associativo de propriedades de mercado não comuns, incluindo taxas, preços, limites e outras informações gerais de mercado. O array info interno é diferente para cada mercado específico; seu conteúdo depende da exchange.
- `precision`. Precisão aceita nos valores das ordens pelas exchanges no momento do envio de ordens para preço, quantidade e custo. (O valor dentro desta propriedade depende do [`exchange.precisionMode`](#precision-mode)).
- `limits`. Os mínimos e máximos para preços, quantidades (volumes) e custos (onde custo = preço * quantidade).
- `optionType`. O tipo da opção; `call` representa uma opção com direito de compra e `put` uma opção com direito de venda.
- `strike`. Preço pelo qual uma opção pode ser comprada ou vendida quando exercida.

## Status Ativo

O sinalizador `active` é tipicamente utilizado em [`currencies`](#currency-structure) e [`markets`](#market-structure). As exchanges podem atribuir um significado ligeiramente diferente a ele. Se uma moeda estiver inativa, na maioria das vezes todos os tickers, livros de ordens e outros endpoints relacionados retornam respostas vazias, todos zeros, sem dados ou informações desatualizadas. O utilizador deve verificar se a moeda está `active` e [recarregar os mercados periodicamente](#market-cache-force-reload).

Nota: o valor `false` para a propriedade `active` nem sempre garante que todas as funcionalidades possíveis, como negociação, levantamento ou depósito, estejam desativadas na exchange. Da mesma forma, o valor `true` também não garante que todas essas funcionalidades estejam habilitadas na exchange. Consulte a documentação das exchanges subjacentes e o código no CCXT para entender o significado exato do sinalizador `active` para cada exchange. Este sinalizador ainda não é suportado ou implementado por todos os mercados e pode estar ausente.

**AVISO! As informações sobre taxas são experimentais, instáveis e podem ser parciais ou não estar disponíveis.**

## Precisão e Limites

**Não confunda `limits` com `precision`!** Precisão não tem nada a ver com limites mínimos. Uma precisão de `0.01` não significa necessariamente que o limite mínimo para o mercado seja `0.01`. O contrário também é verdadeiro: um limite mínimo de `0.01` não significa necessariamente que a precisão seja `0.01`.

Exemplos:

1.
```
market['limits']['amount']['min'] == 0.05 &&
market['precision']['amount'] == 0.0001 &&
market['precision']['price'] == 0.01
```

  - O *valor da quantidade* deve ser >= 0.05:
    ```diff
    + good: 0.05, 0.051, 0.0501, 0.0502, ..., 0.0599, 0.06, 0.0601, ...
    - bad: 0.04, 0.049, 0.0499
    ```
  - A *precisão da quantidade* deve ser de até 4 dígitos após o ponto (0.0001):
    ```diff
    + good: 0.05, 0.0501, ..., 0.06, ..., 0.0719, ...
    - bad: 0.05001, 0.05000, 0.06001
    ```
  - A *precisão do preço* deve ser de até 2 dígitos após o ponto (0.01):
    ```diff
    + good: 1.6, 1.61, 123.01, ..., 1234.56, ...
    - bad: 1.601, ..., 123.012, ..., 1234.567
    ```
  - 

2. `(market['precision']['amount'] == -1)`

    Uma *precisão* negativa só pode ocorrer teoricamente se o `precisionMode` da exchange for `SIGNIFICANT_DIGIT` ou `DECIMAL_PRECISION`. Significa que a quantidade deve ser um múltiplo inteiro de 10 (elevado à potência absoluta especificada):
    ```diff
    + good: 10, 50, ..., 110, ... 1230, ..., 1000000, ..., 1234560, ...
    - bad: 9.5, ... 10.1, ..., 11, ... 200.71, ...
    ```
    No caso de `-2`, os valores aceitáveis seriam múltiplos de `100` (por exemplo, 100, 200, ...), e assim por diante.


#### Modo de Precisão

Os modos de precisão suportados em `exchange['precisionMode']` são:

- `TICK_SIZE` – quase todas as exchanges utilizam este modo de precisão. Neste modo, os números em `market_or_currency['precision']` designam as frações mínimas de precisão (floats) para arredondamento ou truncamento.
- `SIGNIFICANT_DIGITS` – conta apenas dígitos não-zero; algumas exchanges (`bitfinex` e talvez algumas outras) implementam este modo de contagem de decimais. Neste modo de precisão, os números em `market_or_currency['precision']` designam a Nésima posição do último dígito decimal significativo (não-zero) após o ponto.
- `DECIMAL_PLACES` (**DESCONTINUADO, o CCXT não utiliza mais este modo em nenhum lugar**) – conta todos os dígitos. Neste modo de precisão, os números em `market_or_currency['precision']` designam o número de dígitos decimais após o ponto para arredondamento ou truncamento posteriores.

### Notas Sobre Precisão e Limites

O utilizador deve respeitar todos os limites e precisão! Os valores da ordem devem satisfazer as seguintes condições:

- `amount` da ordem >= `limits['amount']['min']`
- `amount` da ordem <= `limits['amount']['max']`
- `price` da ordem >= `limits['price']['min']`
- `price` da ordem <= `limits['price']['max']`
- `cost` da ordem (`amount * price`) >= `limits['cost']['min']`
- `cost` da ordem (`amount * price`) <= `limits['cost']['max']`
- A precisão de `amount` deve ser <= `precision['amount']`
- A precisão de `price` deve ser <= `precision['price']`

Os valores acima podem estar ausentes em algumas exchanges que não fornecem informações sobre limites através da sua API ou que ainda não implementaram isso.

### Métodos para Formatação de Decimais

Cada exchange tem suas próprias configurações de arredondamento, contagem e preenchimento.

Os modos de arredondamento suportados são:

- `ROUND` – arredondará os últimos dígitos decimais para a precisão
- `TRUNCATE` – cortará os dígitos após determinada precisão

O modo de contagem de precisão decimal está disponível na propriedade `exchange.precisionMode`.

#### Modo de Preenchimento

Os modos de preenchimento suportados são:

- `NO_PADDING` – padrão para a maioria dos casos
- `PAD_WITH_ZERO` – acrescenta caracteres zero até a precisão

#### Formatação Para Precisão

Na maior parte das vezes, o utilizador não precisa se preocupar com a formatação de precisão, pois o CCXT cuidará disso quando o utilizador colocar ordens ou enviar solicitações de levantamento, desde que siga as regras descritas em [Precisão e Limites](#precision-and-limits). No entanto, em alguns casos os detalhes de formatação de precisão podem ser importantes, por isso os seguintes métodos podem ser úteis no código do utilizador.

A classe base da exchange contém o método `decimalToPrecision` para ajudar a formatar valores na precisão decimal necessária, com suporte para diferentes modos de arredondamento, contagem e preenchimento.


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


Para exemplos de como utilizar o `decimalToPrecision` para formatar strings e floats, consulte os seguintes arquivos:

- Typescript: https://github.com/ccxt/ccxt/blob/master/ts/src/test/base/functions/test.number.ts
- JavaScript: https://github.com/ccxt/ccxt/blob/master/js/src/test/base/functions/test.number.js
- Python: https://github.com/ccxt/ccxt/blob/master/python/ccxt/test/base/test_number.py
- PHP: https://github.com/ccxt/ccxt/blob/master/php/test/base/test_number.php

**AVISO Python! O método `decimal_to_precision` é suscetível a `getcontext().prec!`**

Para conveniência dos utilizadores, a classe base da exchange do CCXT também implementa os seguintes métodos:


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


Cada exchange tem suas próprias configurações de precisão; os métodos acima ajudarão a formatar esses valores de acordo com as regras de precisão específicas da exchange, de forma portável e independente da exchange subjacente. Para que isso seja possível, os mercados e moedas devem ser carregados antes de formatar qualquer valor.

**Certifique-se de [carregar os mercados com `exchange.loadMarkets()`](#loading-markets) antes de chamar estes métodos!**

Por exemplo:


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


Mais exemplos práticos que descrevem o comportamento de `exchange.precisionMode`:

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

## Carregando Mercados

Na maioria dos casos, é necessário carregar a lista de mercados e símbolos de negociação de uma exchange específica antes de acessar outros métodos da API. Caso se esqueça de carregar os mercados, a biblioteca ccxt fará isso automaticamente na primeira chamada à API unificada. Serão enviadas duas requisições HTTP, primeiro para os mercados e depois para os outros dados, de forma sequencial. Por essa razão, a primeira chamada a um método unificado da API CCXT, como fetchTicker, fetchBalance, etc., levará mais tempo do que as chamadas subsequentes, pois há mais trabalho a ser feito para carregar as informações de mercado da API da exchange. Consulte [Notas Sobre o Limitador de Taxa](#notes-on-rate-limiter) para mais detalhes.

Para carregar os mercados manualmente com antecedência, chame o método `loadMarkets ()` / `load_markets ()` em uma instância de exchange. Ele retorna um array associativo de mercados indexados pelo símbolo de negociação. Se quiser ter mais controle sobre a execução da sua lógica, recomenda-se pré-carregar os mercados manualmente.


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


Além das informações de mercado, a chamada `loadMarkets()` também carregará as moedas da exchange e armazenará em cache as informações nas propriedades `.markets` e `.currencies`, respectivamente.

O utilizador também pode ignorar o cache e chamar métodos unificados para buscar essas informações diretamente nos endpoints da exchange, `fetchMarkets()` e `fetchCurrencies()`, embora o uso desses métodos não seja recomendado para utilizadores finais. A forma recomendada de pré-carregar mercados é chamando o método unificado `loadMarkets()`. No entanto, novas integrações de exchanges devem implementar esses métodos se a exchange subjacente tiver os endpoints de API correspondentes.

### Compartilhando Mercados Entre Instâncias de Exchange

Para otimizar o uso de memória e reduzir chamadas de API redundantes, é possível compartilhar dados de mercado entre múltiplas instâncias da mesma exchange. Isso é especialmente útil ao criar múltiplas instâncias de exchange ou quando se deseja reutilizar dados de mercado que já foram carregados.


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


**Benefícios do Compartilhamento de Mercados:**
- **Eficiência de Memória**: Múltiplas instâncias de exchange compartilham os mesmos objetos de mercado na memória
- **Desempenho**: Elimina chamadas de API redundantes para dados de mercado
- **Conservação de Recursos**: Reduz requisições de rede e o uso do limite de taxa da API
- **Persistência**: Os dados de mercado permanecem disponíveis mesmo que instâncias individuais de exchange sejam destruídas

**Atribuição Direta Alternativa:**

Se preferir a atribuição direta de propriedades, também é possível compartilhar mercados atribuindo diretamente a propriedade `markets`:

```javascript
// Simple direct assignment (ensure both exchanges are of same type)
exchange2.markets = exchange1.markets;
exchange2.symbols = exchange1.symbols;  // Also copy symbols for full functionality
```

No entanto, recomenda-se utilizar o método `setMarketsFromExchange()`, pois ele:
- Valida que ambas as exchanges são do mesmo tipo
- Garante que todos os dados de mercado relacionados sejam copiados corretamente
- Fornece melhor tratamento de erros

**Notas Importantes:**
- Compartilhe mercados apenas entre instâncias do mesmo tipo de exchange
- O compartilhamento de mercados é mais eficaz quando ambas as instâncias utilizam as mesmas credenciais e configuração de API
- Os objetos de mercado compartilhados persistirão na memória enquanto existir pelo menos uma referência
- Tanto o método `setMarketsFromExchange()` quanto a atribuição direta criam referências compartilhadas, não cópias

## Símbolos e IDs de Mercado

Um código de moeda é um código de três a cinco letras, como `BTC`, `ETH`, `USD`, `GBP`, `CNY`, `JPY`, `DOGE`, `RUB`, `ZEC`, `XRP`, `XMR`, etc. Algumas exchanges possuem moedas exóticas com códigos mais longos.

Um símbolo é geralmente uma string literal em maiúsculas com o nome de um par de moedas negociadas separadas por uma barra. A primeira moeda antes da barra é normalmente chamada de *moeda base*, e a que vem após a barra é chamada de *moeda de cotação*. Exemplos de símbolos são: `BTC/USD`, `DOGE/LTC`, `ETH/EUR`, `DASH/XRP`, `BTC/CNY`, `ZEC/XMR`, `ETH/JPY`.

Os IDs de mercado são utilizados durante o processo de requisição-resposta REST para referenciar pares de negociação dentro das exchanges. O conjunto de IDs de mercado é único por exchange e não pode ser utilizado entre exchanges diferentes. Por exemplo, o par/mercado BTC/USD pode ter IDs diferentes em várias exchanges populares, como `btcusd`, `BTCUSD`, `XBTUSD`, `btc/usd`, `42` (ID numérico), `BTC/USD`, `Btc/Usd`, `tBTCUSD`, `XXBTZUSD`. Não é necessário memorizar ou utilizar IDs de mercado; eles existem para fins internos de requisição-resposta HTTP dentro das implementações das exchanges.

A biblioteca ccxt abstrai IDs de mercado incomuns para símbolos, padronizados em um formato comum. Símbolos não são o mesmo que IDs de mercado. Cada mercado é referenciado por um símbolo correspondente. Os símbolos são comuns entre as exchanges, o que os torna adequados para arbitragem e muitas outras finalidades.

Às vezes, o utilizador pode notar um símbolo como `'XBTM18'` ou `'.XRPUSDM20180101'` ou outros *"símbolos exóticos/raros"*. O símbolo **não é obrigatório** ter uma barra ou ser um par de moedas. A string no símbolo realmente depende do tipo de mercado (se é um mercado spot ou de futuros, um mercado darkpool ou um mercado expirado, etc). Tentar analisar a string do símbolo é altamente desaconselhado; não se deve depender do formato do símbolo — recomenda-se utilizar as propriedades do mercado.

As estruturas de mercado são indexadas por símbolos e ids. A classe base de exchange também possui métodos integrados para acessar mercados por símbolos. A maioria dos métodos de API requer que um símbolo seja passado como primeiro argumento. Frequentemente é necessário especificar um símbolo ao consultar preços atuais, fazer ordens, etc.

Na maior parte do tempo os usuários trabalharão com símbolos de mercado. Você receberá uma exceção padrão de usuário se acessar chaves inexistentes nesses dicionários.

### Métodos Para Mercados E Moedas


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


### Consistência de Nomenclatura

Existe certa ambiguidade de termos entre as diversas exchanges que pode causar confusão entre traders iniciantes. Algumas exchanges chamam mercados de *pares*, enquanto outras chamam símbolos de *produtos*. Em termos da biblioteca ccxt, cada exchange contém um ou mais mercados de negociação. Cada mercado tem um id e um símbolo. A maioria dos símbolos são pares de moeda base e moeda de cotação.

``` → Markets → Symbols → Currencies```

Historicamente, vários nomes simbólicos foram usados para designar os mesmos pares de negociação. Algumas criptomoedas (como o Dash) até mudaram de nome mais de uma vez ao longo de sua existência. Para manter consistência entre as exchanges, a biblioteca ccxt realizará as seguintes substituições conhecidas para símbolos e moedas:

- `XBT → BTC`: `XBT` é mais recente, mas `BTC` é mais comum entre as exchanges e soa mais como bitcoin ([leia mais](https://www.google.ru/search?q=xbt+vs+btc)).
- `BCC → BCH`: O fork do Bitcoin Cash é frequentemente chamado por dois nomes simbólicos diferentes: `BCC` e `BCH`. O nome `BCC` é ambíguo para o Bitcoin Cash, sendo confundido com BitConnect. A biblioteca ccxt converterá `BCC` para `BCH` quando apropriado (algumas exchanges e agregadores os confundem).
- `DRK → DASH`: `DASH` era Darkcoin e depois se tornou Dash ([leia mais](https://minergate.com/blog/dashcoin-and-dash/)).
- `BCHABC → BCH`: Em 15 de novembro de 2018 o Bitcoin Cash fez um segundo fork, portanto agora existem `BCH` (para BCH ABC) e `BSV` (para BCH SV).
- `BCHSV → BSV`: Este é um mapeamento de substituição comum para o fork Bitcoin Cash SV (algumas exchanges o chamam de `BSV`, outras de `BCHSV`; usamos o primeiro).
- `DSH → DASH`: Tente não confundir símbolos e moedas. O `DSH` (Dashcoin) não é o mesmo que `DASH` (Dash). Algumas exchanges rotulam `DASH` de forma inconsistente como `DSH`; a biblioteca ccxt também realiza uma correção para isso (`DSH → DASH`), mas apenas em determinadas exchanges que confundem essas duas moedas, enquanto a maioria das exchanges as trata corretamente. Lembre-se que `DASH/BTC` não é o mesmo que `DSH/BTC`.
- `XRB` → `NANO`: `NANO` é o código mais recente para RaiBlocks; portanto, a API unificada CCXT substituirá o antigo `XRB` por `NANO` quando necessário. https://hackernoon.com/nano-rebrand-announcement-9101528a7b76
- `USD` → `USDT`: Algumas exchanges, como Bitfinex, HitBTC e algumas outras, denominam a moeda como `USD` em suas listagens, mas esses mercados na verdade negociam `USDT`. A confusão pode decorrer de uma limitação de 3 letras nos nomes de símbolos ou por outros motivos. Nos casos em que a moeda negociada é de fato `USDT` e não `USD` – a biblioteca CCXT realizará a conversão `USD` → `USDT`. Observe, porém, que algumas exchanges possuem tanto símbolos `USD` quanto `USDT`; por exemplo, a Kraken possui o par de negociação `USDT/USD`.

#### Notas Sobre Consistência de Nomenclatura

Cada exchange possui um array associativo de substituições para códigos simbólicos de criptomoedas na propriedade `exchange.commonCurrencies`, como:
```
'commonCurrencies' : {
    'XBT': 'BTC',
    'OPTIMISM': 'OP',
    // ... etc
}
```
onde a chave representa o nome real pelo qual o motor da exchange se refere àquela moeda, e o valor representa como você deseja referenciá-la através do ccxt.

Às vezes o usuário pode notar nomes de símbolos exóticos com palavras em maiúsculas e minúsculas misturadas e espaços no código. A lógica por trás desses nomes é explicada pelas regras para resolução de conflitos de nomenclatura e codificação de moedas quando uma ou mais moedas possuem o mesmo código simbólico em exchanges diferentes:

- Primeiro, reunimos todas as informações disponíveis das próprias exchanges sobre os códigos de moedas em questão. Elas geralmente possuem uma descrição das suas listagens de moedas em algum lugar na sua API, documentação, bases de conhecimento ou em outro lugar nos seus sites.
- Quando identificamos cada criptomoeda específica por trás do código de moeda, consultamos o [CoinMarketCap](https://coinmarketcap.com).
- A moeda com a maior capitalização de mercado entre todas elas ganha o código de moeda e o mantém. Por exemplo, HOT frequentemente representa `Holo` ou `Hydro Protocol`. Nesse caso, `Holo` retém o código `HOT`, e `Hydro Protocol` terá seu nome como código, literalmente, `Hydro Protocol`. Portanto, podem existir pares de negociação com símbolos como `HOT/USD` (para `Holo`) e `Hydro Protocol/USD` – esses são dois mercados diferentes.
- Se a capitalização de mercado de uma moeda específica for desconhecida ou insuficiente para determinar o vencedor, também levamos em conta volumes de negociação e outros fatores.
- Quando o vencedor é determinado, todas as outras moedas concorrentes têm seus códigos devidamente remapeados e substituídos nas exchanges em conflito via `.commonCurrencies`. **Observação: isso deve ser definido antes que `.loadMarkets()` aconteça!**
- Infelizmente, este é um trabalho em andamento, pois novas moedas são listadas diariamente e novas exchanges são adicionadas periodicamente; portanto, em geral, este é um processo interminável de autocorreção em um ambiente em rápida mudança, praticamente em *"modo ao vivo"*. Somos gratos por todos os conflitos e inconsistências relatados que você possa encontrar.

#### Perguntas Sobre Consistência de Nomenclatura

_É possível que os símbolos mudem?_

Em resumo, sim, às vezes, mas raramente. Os mapeamentos simbólicos podem ser alterados se isso for absolutamente necessário e não puder ser evitado. No entanto, todas as alterações simbólicas anteriores foram relacionadas à resolução de conflitos ou forks. Até o momento, não houve precedente de capitalização de mercado de uma moeda superando outra moeda com o mesmo código simbólico no CCXT.

_Podemos confiar em que sempre a mesma cripto será listada com o mesmo símbolo?_

Mais ou menos ) Primeiro, esta biblioteca é um trabalho em andamento e está tentando se adaptar à realidade em constante mudança, portanto pode haver conflitos que resolveremos alterando alguns mapeamentos no futuro. Em última análise, a licença diz "sem garantias, use por sua conta e risco". No entanto, não alteramos mapeamentos simbólicos aleatoriamente por toda parte, pois entendemos as consequências e também gostaríamos de confiar na biblioteca, e não gostamos de quebrar a compatibilidade retroativa.

Caso aconteça de o símbolo de um token importante ser bifurcado ou precisar ser alterado, o controle ainda estará nas mãos dos usuários. A propriedade `exchange.commonCurrencies` pode ser [substituída na inicialização ou posteriormente](#overriding-exchange-properties-upon-instantiation), assim como qualquer outra propriedade de exchange. Se um token significativo estiver envolvido, geralmente publicamos instruções sobre como manter o comportamento antigo adicionando algumas linhas aos parâmetros do construtor.

#### Consistência Das Moedas Base E De Cotação

Depende de qual exchange você está usando, mas algumas delas têm um emparelhamento invertido (inconsistente) de `base` e `quote`. Elas de fato têm base e cotação trocados (lados alternados/invertidos). Nesse caso, você verá uma diferença entre os valores de moeda `base` e `quote` analisados e as informações não analisadas em `info` na subestrutura do mercado.

Para essas exchanges, o ccxt fará uma correção, alternando e normalizando os lados das moedas base e de cotação ao analisar as respostas da exchange. Essa lógica é financeira e terminologicamente correta. Se você quiser menos confusão, lembre-se da seguinte regra: **a base sempre vem antes da barra, a cotação sempre vem depois da barra em qualquer símbolo e em qualquer mercado**.

```text
base currency ↓
             BTC / USDT
             ETH / BTC
            DASH / ETH
                    ↑ quote currency
```

#### Convenções de Nomenclatura de Contratos

Atualmente carregamos mercados à vista com o esquema de símbolo unificado `BASE/QUOTE` no mapeamento `.markets`, indexado por símbolo. Isso causaria um conflito de nomenclatura para futuros e outros derivativos que possuem o mesmo símbolo que seus equivalentes no mercado à vista. Para acomodar ambos os tipos de mercado em `.markets`, exigimos que os símbolos entre mercados 'futuro' e 'à vista' sejam distintos, assim como os símbolos entre contratos 'linear' e 'inverso' devem ser distintos.

**Por favor, verifique este anúncio: [Convenções unificadas de nomenclatura de contratos](https://github.com/ccxt/ccxt/issues/10931)**

CCXT suporta os seguintes tipos de contratos derivativos:

- `future` – para contratos futuros com vencimento que possuem uma data de entrega/liquidação [](https://en.wikipedia.org/wiki/Futures_contract)
- `swap` – para futuros perpétuos que não possuem data de entrega [](https://en.wikipedia.org/wiki/Perpetual_futures)
- `option` – para contratos de opções (https://en.wikipedia.org/wiki/Option_contract)

##### Futuro

Um símbolo de mercado futuro consiste na moeda subjacente, na moeda de cotação, na moeda de liquidação e em um identificador arbitrário. Na maioria das vezes, o identificador é a data de liquidação do contrato futuro no formato `YYMMDD`:

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

##### Swap Perpétuo (Futuro Perpétuo)

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

##### Opção

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

| Rede | Código CCXT  |
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

## Recarga Forçada do Cache de Mercados

O `loadMarkets () / load_markets ()` também é um método com efeito colateral de salvar o array de mercados na instância da exchange. Você só precisa chamá-lo uma vez por exchange. Todas as chamadas subsequentes ao mesmo método retornarão o array de mercados salvo localmente (em cache).

Quando os mercados da exchange são carregados, você pode acessar as informações de mercado a qualquer momento através da propriedade `markets`. Essa propriedade contém um array associativo de mercados indexados por símbolo. Se você precisar forçar o recarregamento da lista de mercados após já tê-los carregado, passe o sinalizador reload = true para o mesmo método novamente.


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

- [Métodos / Endpoints de API](#api-methods--endpoints)
- [Métodos de API Implícitos](#implicit-api-methods)
- [API Pública/Privada](#publicprivate-api)
- [Chamadas Síncronas vs Assíncronas](#synchronous-vs-asynchronous-calls)
- [Passando Parâmetros para Métodos de API](#passing-parameters-to-api-methods)

## Métodos / Endpoints de API

Cada exchange oferece um conjunto de métodos de API. Cada método da API é chamado de *endpoint*. Endpoints são URLs HTTP para consultar vários tipos de informação. Todos os endpoints retornam JSON em resposta às solicitações dos clientes.

Geralmente, há um endpoint para obter uma lista de mercados de uma exchange, um endpoint para recuperar um livro de ordens de um mercado específico, um endpoint para recuperar o histórico de negociações, endpoints para realizar e cancelar ordens, para depósito e retirada de dinheiro, etc... Basicamente, cada tipo de ação que você poderia realizar dentro de uma exchange específica tem uma URL de endpoint separada oferecida pela API.

Como o conjunto de métodos difere de exchange para exchange, a biblioteca ccxt implementa o seguinte:
- uma API pública e privada para todas as URLs e métodos possíveis
- uma API unificada que suporta um subconjunto de métodos comuns

As URLs de endpoint são predefinidas na propriedade `api` para cada exchange. Você não precisa substituí-las, a menos que esteja implementando uma nova API de exchange (pelo menos você deve saber o que está fazendo).

A maioria dos métodos de API específicos de exchange são implícitos, o que significa que não são definidos explicitamente em nenhum lugar no código. A biblioteca implementa uma abordagem declarativa para definir métodos de API implícitos (não unificados) das exchanges.

## Métodos de API Implícitos

Cada método da API geralmente tem seu próprio endpoint. A biblioteca define todos os endpoints para cada exchange específica na propriedade `.api`. Após a construção da exchange, um método *mágico* implícito (também conhecido como *função parcial* ou *closure*) será criado dentro de `defineRestApi()/define_rest_api()` na instância da exchange para cada endpoint da lista de endpoints `.api`. Isso é realizado para todas as exchanges de forma universal. Cada método gerado será acessível tanto na notação `camelCase` quanto na notação `under_score`.

A definição de endpoints é uma **lista completa de TODAS AS URLs de API** expostas por uma exchange. Essa lista é convertida em métodos chamáveis durante a instanciação da exchange. Cada URL na lista de endpoints de API recebe um método chamável correspondente. Isso é feito automaticamente para todas as exchanges, portanto, a biblioteca ccxt suporta **todas as URLs possíveis** oferecidas pelas exchanges de criptomoedas.

Cada método implícito recebe um nome único que é construído a partir da definição `.api`. Por exemplo, um endpoint privado HTTPS PUT `https://api.exchange.com/order/{id}/cancel` terá um método de exchange correspondente chamado `.privatePutOrderIdCancel()`/`.private_put_order_id_cancel()`. Um endpoint público HTTPS GET `https://api.exchange.com/market/ticker/{pair}` resultaria no método correspondente chamado `.publicGetTickerPair()`/`.public_get_ticker_pair()`, e assim por diante.

Um método implícito recebe um dicionário de parâmetros, envia a solicitação para a exchange e retorna um resultado JSON específico da exchange da API **como está, sem análise**. Para passar um parâmetro, adicione-o ao dicionário explicitamente sob uma chave igual ao nome do parâmetro. Para os exemplos acima, isso ficaria como `.privatePutOrderIdCancel ({ id: '41987a2b-...' })` e `.publicGetTickerPair ({ pair: 'BTC/USD' })`.

A forma recomendada de trabalhar com exchanges não é usar métodos implícitos específicos de exchange, mas usar os métodos unificados do ccxt. Os métodos específicos de exchange devem ser usados como alternativa nos casos em que um método unificado correspondente não está disponível (ainda).

Para obter uma lista de todos os métodos disponíveis com uma instância de exchange, incluindo métodos implícitos e métodos unificados, você pode simplesmente fazer o seguinte:

```text
console.log (new ccxt.kraken ())   // JavaScript
print(dir(ccxt.kraken()))           # Python
var_dump (new \ccxt\kraken ()); // PHP
```

## API Pública/Privada

As URLs de API são frequentemente agrupadas em dois conjuntos de métodos chamados de *API pública* para dados de mercado e *API privada* para negociação e acesso à conta. Esses grupos de métodos de API geralmente são prefixados com a palavra 'public' ou 'private'.

Uma API pública é usada para acessar dados de mercado e não requer nenhuma autenticação. A maioria das exchanges fornece dados de mercado abertamente para todos (sob seu limite de taxa). Com a biblioteca ccxt, qualquer pessoa pode acessar dados de mercado sem precisar se registrar nas exchanges e sem configurar chaves de conta e senhas.

As APIs públicas incluem o seguinte:

- instrumentos/pares de negociação
- feeds de preços (taxas de câmbio)
- livros de ordens (L1, L2, L3...)
- histórico de negociações (ordens fechadas, transações, execuções)
- tickers (preço spot / 24h)
- séries OHLCV para gráficos
- outros endpoints públicos

A API privada é usada principalmente para negociação e para acessar dados privados específicos da conta, portanto requer autenticação. Você precisa obter as chaves de API privadas das exchanges. Isso geralmente significa se registrar em um site de exchange e criar as chaves de API para sua conta. A maioria das exchanges exige informações pessoais ou identificação. Algumas exchanges só permitem negociação após a conclusão da verificação KYC.
As APIs privadas permitem o seguinte:

- gerenciar informações pessoais da conta
- consultar saldos da conta
- negociar fazendo ordens a mercado e a limite
- criar endereços de depósito e financiar contas
- solicitar retirada de fundos em fiat e criptomoedas
- consultar ordens abertas/fechadas pessoais
- consultar posições em negociação com margem/alavancagem
- obter histórico do razão
- transferir fundos entre contas
- usar serviços de merchant

Algumas exchanges oferecem a mesma lógica sob nomes diferentes. Por exemplo, uma API pública também é frequentemente chamada de *market data*, *basic*, *market*, *mapi*, *api*, *price*, etc... Todos eles significam um conjunto de métodos para acessar dados disponíveis ao público. Uma API privada também é frequentemente chamada de *trading*, *trade*, *tapi*, *exchange*, *account*, etc...

Algumas exchanges também expõem uma API de merchant que permite criar faturas e aceitar pagamentos em criptomoedas e fiat de seus clientes. Esse tipo de API é frequentemente chamado de *merchant*, *wallet*, *payment*, *ecapi* (para e-commerce).

Para obter uma lista de todos os métodos disponíveis com uma instância de exchange, você pode simplesmente fazer o seguinte:

```text
console.log (new ccxt.kraken ())   // JavaScript
print(dir(ccxt.kraken()))           # Python
var_dump (new \ccxt\kraken ()); // PHP
```

**somente contrato e somente margem**

- os métodos nesta documentação que são documentados como **somente contrato** ou **somente margem** são destinados apenas para negociação de contratos e negociação com margem, respectivamente. Eles podem funcionar ao negociar em outros tipos de mercados, mas muito provavelmente retornarão informações irrelevantes.

## Chamadas Síncronas vs Assíncronas


#### **Javascript**

Na versão JavaScript do CCXT, todos os métodos são assíncronos e retornam [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) que resolvem com um objeto JSON decodificado. No CCXT usamos a sintaxe moderna *async/await* para trabalhar com Promises. Se você não estiver familiarizado com essa sintaxe, pode ler mais sobre ela [aqui](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function).

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

A biblioteca ccxt suporta modo de concorrência assíncrona em Python 3.5+ com sintaxe async/await. A versão assíncrona de Python usa puro [asyncio](https://docs.python.org/3/library/asyncio.html) com [aiohttp](http://aiohttp.readthedocs.io). No modo assíncrono você tem todas as mesmas propriedades e métodos, mas a maioria dos métodos é decorada com a palavra-chave async. Se você quiser usar o modo assíncrono, deve vincular ao subpacote `ccxt.async_support`, como no exemplo a seguir:

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

O CCXT suporta versões PHP 8+. A biblioteca tem versões síncronas e assíncronas. Para usar a versão síncrona, use o namespace `\ccxt` (ou seja, `new ccxt\binance()`) e para usar a versão assíncrona, use o namespace `\ccxt\async` (ou seja, `new ccxt\async\binance()`). A versão assíncrona usa a biblioteca [ReactPHP](https://reactphp.org/) em segundo plano. No modo assíncrono você tem todas as mesmas propriedades e métodos, mas qualquer método de API de rede deve ser decorado com a palavra-chave `\React\Async\await` e seu script deve estar em um wrapper ReactPHP:
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

Veja mais exemplos no diretório `examples/php`; procure por nomes de arquivos que incluam a palavra `async`. Além disso, certifique-se de ter instalado as dependências necessárias usando `composer require recoil/recoil clue/buzz-react react/event-loop recoil/react react/http`. Por fim, [este artigo](https://sergeyzhuk.me/2018/10/26/from-promise-to-coroutines/) fornece uma boa introdução aos métodos usados aqui. Embora sintaticamente a mudança seja simples (ou seja, apenas usar uma palavra-chave `yield` antes dos métodos relevantes), a concorrência tem implicações significativas para o design geral do seu código.

#### **Go**

Em Go, cada método de rede é síncrono e retorna um par `(value, error)` — não há variante assíncrona. Sempre verifique o `error` retornado antes de usar o valor:

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

Em C#, cada método de rede é assíncrono e retorna um `Task<T>` que você `await`. Os métodos unificados usam `async`/`await` nativo:

```csharp
// C#

var exchange = new Kraken();
var ticker = await exchange.FetchTicker("ETH/BTC");
Console.WriteLine(exchange.id + " " + ticker.last);
```

#### **Java**

Em Java, cada exchange tem sua própria subclasse tipada. Cada método tipado fornece
**tanto** uma sobrecarga síncrona bloqueante quanto uma sobrecarga assíncrona não bloqueante que retorna `CompletableFuture` — simétrica para REST `fetch*` / `fetch*Async` e WS `watch*` /
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

O mesmo par síncrono/assíncrono se aplica às classes pro (WebSocket) — `watchTicker`
bloqueia para uma atualização; `watchTickerAsync` retorna um `CompletableFuture<Ticker>`
que é completado na próxima atualização:

```java
import io.github.ccxt.exchanges.pro.Binance;

var ws = new Binance();
ws.loadMarkets(false);

// WS — synchronous (blocks for one update)
Ticker tick = ws.watchTicker("BTC/USDT");

// WS — asynchronous (composable with allOf, anyOf, thenApply, ...)
CompletableFuture<Ticker> stream = ws.watchTickerAsync("BTC/USDT", null);
```


### Objetos JSON Retornados

Todos os métodos de API públicos e privados retornam objetos JSON brutos decodificados em resposta das exchanges, como estão, sem modificação. A API unificada retorna objetos decodificados em JSON em um formato comum e estruturados de forma uniforme em todas as exchanges.

## Passando Parâmetros para Métodos de API

O conjunto de todos os endpoints de API possíveis difere de exchange para exchange. A maioria dos métodos aceita um único array associativo (ou um dict Python) de parâmetros chave-valor. Os parâmetros são passados da seguinte forma:

```text
bitso.publicGetTicker ({ book: 'eth_mxn' })                 // JavaScript
ccxt.zaif().public_get_ticker_pair ({ 'pair': 'btc_jpy' })  # Python
$luno->public_get_ticker (array ('pair' => 'XBTIDR'));      // PHP
```

Os métodos unificados das exchanges podem esperar e aceitarão vários `params` que afetam sua funcionalidade, como:

```python
params = {'type':'margin', 'isIsolated': 'TRUE'}  # --------------┑
# params will go as the last argument to the unified method       |
#                                                                 v
binance.create_order('BTC/USDT', 'limit', 'buy', amount, price, params)
```

Uma exchange não aceitará os params de uma exchange diferente, eles não são intercambiáveis. A lista de parâmetros aceitos é definida por cada exchange específica.

Para descobrir quais parâmetros podem ser passados para um método unificado:

- abra o arquivo de [implementação específica da exchange](https://github.com/ccxt/ccxt/tree/master/js) e pesquise a função desejada (ou seja, `createOrder`) para inspecionar e descobrir os detalhes do uso de `params`
- ou vá à documentação da API da exchange e leia a lista de parâmetros para sua função ou endpoint específico (ou seja, `order`)

Para uma lista completa dos parâmetros aceitos por cada método em cada exchange, consulte a [documentação da API](#exchanges).

### Convenções de Nomenclatura dos Métodos da API

O nome de um método de exchange é uma string concatenada composta pelo tipo (public ou private), pelo método HTTP (GET, POST, PUT, DELETE) e pelo caminho do endpoint URL, como nos exemplos a seguir:

| Nome do Método               | URL Base da API                | URL do Endpoint                |
|------------------------------|--------------------------------|--------------------------------|
| publicGetIdOrderbook         | https://bitbay.net/API/Public  | {id}/orderbook                 |
| publicGetPairs               | https://bitlish.com/api        | pairs                          |
| publicGetJsonMarketTicker    | https://www.bitmarket.net      | json/{market}/ticker           |
| privateGetUserMargin         | https://bitmex.com             | user/margin                    |
| privatePostTrade             | https://btc-x.is/api           | trade                          |
| tapiCancelOrder              | https://yobit.net              | tapi/CancelOrder               |
| ...                          | ...                            | ...                            |

A biblioteca ccxt suporta tanto a notação camelCase (preferida em JavaScript) quanto a notação com sublinhado (preferida em Python e PHP), portanto todos os métodos podem ser chamados em qualquer uma das notações ou estilos de código em qualquer linguagem. Ambas as notações funcionam em JavaScript, Python e PHP:

```text
exchange.methodName ()  // camelcase pseudocode
exchange.method_name()  // underscore pseudocode
```

Para obter uma lista de todos os métodos disponíveis em uma instância de exchange, basta fazer o seguinte:

```text
console.log (new ccxt.kraken ())   // JavaScript
print(dir(ccxt.hitbtc()))           # Python
var_dump (new \ccxt\okcoin ()); // PHP
```

# API Unificada

- [Sobrescrevendo Parâmetros da API Unificada](#overriding-unified-api-params)
- [Paginação](#pagination)
- [Paginação Automática](#automatic-pagination)

A API unificada do ccxt é um subconjunto de métodos comuns entre as exchanges. Atualmente contém os seguintes métodos:

- `fetchMarkets ()`: Busca uma lista de todos os mercados disponíveis em uma exchange e retorna um array de objetos Market conforme definido pela [estrutura Market](#market-structure) (com propriedades como `symbol`, `base`, `quote`, etc.). Algumas exchanges não dispõem de meios para obter uma lista de mercados via API online. Para essas, a lista de mercados é codificada diretamente.
- `fetchCurrencies ()`: Busca todas as moedas disponíveis em uma exchange e retorna um dicionário associativo de moedas (objetos com propriedades como `code`, `name`, etc.). Algumas exchanges não dispõem de meios para obter moedas via API online. Para essas, as moedas serão extraídas dos pares de mercado ou codificadas diretamente.
- `loadMarkets ([reload])`: Retorna a lista de mercados como um objeto indexado por símbolo e a armazena em cache na instância da exchange. Retorna os mercados em cache se já foram carregados, a menos que o sinalizador `reload = true` seja forçado.
- `fetchOrderBook (symbol, limit = undefined, params = {})`: Busca o livro de ordens L2/L3 para um símbolo de negociação de mercado específico.
- `fetchStatus (params = {})`: Retorna informações sobre o status da exchange, seja a partir das informações codificadas na instância da exchange ou da API, quando disponível.
- `fetchL2OrderBook (symbol, limit = undefined, params)`: Livro de ordens de nível 2 (agregado por preço) para um símbolo específico.
- `fetchTrades (symbol, since, limit, params)`: Busca negociações recentes para um símbolo de negociação específico.
- `fetchTicker (symbol)`: Busca os dados mais recentes do ticker pelo símbolo de negociação.
- `fetchBalance ()`: Busca o saldo.
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

## Sobrescrevendo Parâmetros da API Unificada

Observe que a maioria dos métodos da API unificada aceita um argumento opcional `params`. É um array associativo (um dicionário, vazio por padrão) contendo os parâmetros que você deseja sobrescrever. O conteúdo de `params` é específico de cada exchange; consulte a documentação da API das exchanges para conhecer os campos e valores suportados. Use o dicionário `params` quando precisar passar uma configuração personalizada ou um parâmetro opcional para a sua consulta unificada.


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


## Paginação

A maioria dos métodos unificados retornará um único objeto ou um array simples (uma lista) de objetos (negociações, ordens, transações, etc.). No entanto, pouquíssimas exchanges (se é que alguma) retornarão todas as ordens, todas as negociações, todas as velas OHLCV ou todas as transações de uma só vez. Na maior parte dos casos, suas APIs `limit` (limitam) a saída a um certo número dos objetos mais recentes. **VOCÊ NÃO PODE OBTER TODOS OS OBJETOS DESDE O INÍCIO DOS TEMPOS ATÉ O MOMENTO PRESENTE EM UMA ÚNICA CHAMADA**. Na prática, pouquíssimas exchanges tolerarão ou permitirão isso.

Para buscar ordens ou negociações históricas, o usuário precisará percorrer os dados em porções ou "páginas" de objetos. A paginação frequentemente implica *"buscar porções de dados uma a uma"* em um loop.

Na maioria dos casos, os usuários são **obrigados a usar pelo menos algum tipo de paginação** para obter os resultados esperados de forma consistente. Se o usuário não aplicar nenhuma paginação, a maioria dos métodos retornará o padrão da exchange, que pode começar desde o início do histórico ou pode ser um subconjunto dos objetos mais recentes. O comportamento padrão (sem paginação) é específico de cada exchange! Os meios de paginação são frequentemente usados com os seguintes métodos em particular:

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

Com métodos que retornam listas de objetos, as exchanges podem oferecer um ou mais tipos de paginação. O CCXT unifica a **paginação baseada em data** por padrão, com timestamps **em milissegundos** em toda a biblioteca.


### Paginação Automática

*Aviso: este é um recurso experimental e pode produzir resultados inesperados/incorretos em alguns casos.*

Recentemente, o CCXT introduziu uma forma de paginar por vários resultados automaticamente, bastando fornecer o sinalizador `paginate` dentro de `params,` retirando esse trabalho do lado do usuário. A maioria das principais exchanges suporta esse recurso, e mais serão adicionadas no futuro, mas a maneira mais fácil de verificar é consultar a documentação do método e procurar o parâmetro de *paginação*. Como sempre há exceções, alguns endpoints podem não oferecer uma forma de paginar por timestamp ou cursor, e nesses casos o CCXT não pode fazer nada a respeito.


Atualmente, temos três formas diferentes de paginar:
- **dinâmica/baseada em tempo**: usa os parâmetros `until` e `since` para paginar por resultados dinâmicos como (negociações, ordens, transações, etc.). Como não sabemos a priori quantas entradas estão disponíveis para busca, será realizada uma requisição por vez até atingirmos o fim dos dados ou o número máximo de chamadas de paginação (configurável por meio de uma opção)
- **determinística**: quando é possível pré-computar os limites de cada página, as requisições são realizadas de forma concorrente para máximo desempenho. Isso se aplica a OHLCV, Taxas de Financiamento e Interesse Aberto, e também respeita a opção `paginationCalls`.
- **baseada em cursor**: quando a exchange fornece um cursor dentro da resposta, extraímos o cursor e realizamos a requisição subsequente até o fim dos dados ou atingirmos o número máximo de chamadas de paginação.

O usuário não pode selecionar o método de paginação utilizado; isso dependerá de cada implementação, considerando os recursos da API da exchange.

#### Parâmetros de paginação

Não podemos realizar uma quantidade infinita de requisições, e algumas delas podem gerar um erro por diferentes motivos; por isso, temos algumas opções que permitem ao usuário controlar essas variáveis e outras especificidades da paginação.

*Todas as opções abaixo devem ser fornecidas dentro de `params`; você pode conferir os exemplos abaixo*

- **paginate**: (**boolean**) indica que o usuário deseja paginar por diferentes páginas para obter mais dados. O padrão é *false*.
- **paginationCalls**: (**integer**) permite ao usuário controlar o número máximo de requisições para paginar os dados. Devido aos limites de taxa, esse valor não deve ser muito alto. O padrão é 10.
- **maxRetries**: (**integer**) quantas vezes o mecanismo de paginação deve tentar novamente ao receber um erro. O padrão é 3.
- **paginationDirection**: (**string**) Aplica-se apenas à paginação dinâmica e pode ser *forward* (iniciar a paginação a partir de algum momento no passado e paginar para frente) ou *backward* (iniciar a partir do momento mais recente e paginar para trás). Se *forward* for selecionado, um parâmetro *since* também deve ser fornecido. O padrão é *backward*.
- **maxEntriesPerRequest**: (**integer**): A quantidade máxima de entradas por requisição para que possamos maximizar os dados recuperados por chamada. Varia de endpoint para endpoint e o CCXT preencherá esse valor automaticamente, mas você pode sobrescrevê-lo se necessário.

#### Exemplos

```python

trades = await binance.fetch_trades("BTC/USDT", params = {"paginate": True}) # dynamic/time-based

ohlcv = await binance.fetch_ohlcv("BTC/USDT", params = {"paginate": True, "paginationCalls": 5}) # deterministic-pagination will perform 5 requests

trades = await binance.fetch_trades("BTC/USDT", since = 1664812416000, params = {"paginate": True, "paginationDirection": "forward"}) # dynamic/time-based pagination starting from 1664812416000

ledger = await bybit.fetch_ledger(params = {"paginate": True}) # bybit returns a cursor so the pagination will be cursor-based

funding_rates = await binance.fetch_funding_rate_history("BTC/USDT:USDT", params = {"paginate": True, "maxEntriesPerRequest": 50}) # customizes the number of entries per request

```


### Trabalhando com Datas e Timestamps

Todos os timestamps unificados ao longo da biblioteca CCXT são inteiros **em milissegundos**, salvo indicação explícita em contrário.

Abaixo está o conjunto de métodos para trabalhar com datas e timestamps UTC e para converter entre eles:

```javascript
exchange.parse8601 ('2018-01-01T00:00:00Z') == 1514764800000 // integer in milliseconds, Z = UTC
exchange.iso8601 (1514764800000) == '2018-01-01T00:00:00Z'   // from milliseconds to iso8601 string
exchange.seconds ()      // integer UTC timestamp in seconds
exchange.milliseconds () // integer UTC timestamp in milliseconds
```

### Paginação Baseada em Data

Este é o tipo de paginação atualmente utilizado em toda a API Unificada do CCXT. O usuário fornece um timestamp `since` **em milissegundos** (!) e um número para `limit` dos resultados. Para percorrer os objetos de interesse página por página, o usuário executa o seguinte (abaixo está pseudocódigo; pode ser necessário sobrescrever alguns parâmetros específicos da exchange, dependendo da exchange em questão):

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


### Paginação baseada em ID

O utilizador fornece um `from_id` do objeto a partir do qual a consulta deve continuar a devolver resultados, e um número para `limit` os resultados. Este é o comportamento padrão em algumas exchanges; no entanto, este tipo ainda não está unificado. Para paginar objetos com base nos seus ids, o utilizador executaria o seguinte:


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


### Paginação por número de página (Cursor)

O utilizador fornece um número de página ou um valor de *"cursor" inicial*. A exchange devolve uma página de resultados e o valor do *"cursor" seguinte*, para continuar a partir daí. A maioria das exchanges que implementam este tipo de paginação devolve o cursor seguinte dentro da própria resposta ou dentro dos cabeçalhos HTTP da resposta.

Veja um exemplo de implementação aqui: https://github.com/ccxt/ccxt/blob/master/examples/py/coinbasepro-fetch-my-trades-pagination.py

A cada iteração do ciclo, o utilizador deve obter o cursor seguinte e colocá-lo nos parâmetros substituídos para a consulta seguinte (na iteração seguinte):


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

- [Livro de Ordens](#order-book)
- [Tickers de Preço](#price-tickers)
- [Gráficos de Velas OHLCV](#ohlcv-candlestick-charts)
- [Negociações Públicas](#public-trades)
- [Hora da Exchange](#exchange-time)
- [Estado da Exchange](#exchange-status)
- [Taxas de Empréstimo](#borrow-rates)
- [Histórico de Taxas de Empréstimo](#borrow-rate-history)
- [Níveis de Alavancagem](#leverage-tiers)
- [Taxa de Financiamento](#funding-rate)
- [Histórico de Taxas de Financiamento](#funding-rate-history)
- [Histórico de Interesse em Aberto](#open-interest-history)
- [Histórico de Volatilidade](#volatility-history)
- [Ativos Subjacentes](#underlying-assets)
- [Liquidações](#liquidations)
- [Gregas](#greeks)
- [Cadeia de Opções](#option-chain)
- [Desalavancagem Automática](#auto-de-leverage)

## Livro de Ordens

As exchanges expõem informações sobre ordens em aberto com preços de compra (bid) e venda (ask), volumes e outros dados. Normalmente existe um endpoint separado para consultar o estado atual (frame de pilha) do *livro de ordens* de um mercado específico. Um livro de ordens também é frequentemente chamado de *profundidade de mercado*. As informações do livro de ordens são utilizadas no processo de tomada de decisão de negociação.

Para obter dados sobre livros de ordens, pode usar

- `fetchOrderBook ()` // para o livro de ordens de um único mercado
- `fetchOrderBooks ( symbols )` // para livros de ordens de múltiplos mercados
- `fetchOrderBooks ()` // para os livros de ordens de todos os mercados

```javascript
async fetchOrderBook (symbol, limit = undefined, params = {})
```

Parâmetros

- **symbol** (String) *obrigatório* Símbolo CCXT unificado (ex. `"BTC/USDT"`)
- **limit** (Integer) O número de ordens a devolver no livro de ordens (ex. `10`)
- **params** (Dictionary) Parâmetros extra específicos do endpoint da API da exchange (ex. `{"endTime": 1645807945000}`)

Retorna

- Uma [estrutura de livro de ordens](#order-book-structure)

```javascript
async fetchOrderBooks (symbols = undefined, limit = undefined, params = {})
```

Parâmetros

- **symbols** (\[String\]) Símbolos CCXT unificados (ex. `["BTC/USDT", "ETH/USDT"]`)
- **limit** (Integer) O número de ordens a devolver no livro de ordens (ex. `10`)
- **params** (Dictionary) Parâmetros extra específicos do endpoint da API da exchange (ex. `{"endTime": 1645807945000}`)

Retorna

- Um dicionário de [estruturas de livro de ordens](#order-book-structure) indexado por símbolos de mercado

### Exemplos de fetchOrderBook


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


### Estrutura do Livro de Ordens

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

**O timestamp e o datetime podem estar ausentes (`undefined/None/null`) se a exchange em questão não fornecer um valor correspondente na resposta da API.**

Os preços e as quantidades são números de ponto flutuante. O array de bids está ordenado por preço em ordem decrescente. O melhor (mais alto) preço de bid é o primeiro elemento e o pior (mais baixo) preço de bid é o último elemento. O array de asks está ordenado por preço em ordem crescente. O melhor (mais baixo) preço de ask é o primeiro elemento e o pior (mais alto) preço de ask é o último elemento. Os arrays de bid/ask podem estar vazios se não houver ordens correspondentes no livro de ordens de uma exchange.

As exchanges podem devolver a pilha de ordens em vários níveis de detalhe para análise. Pode ser em detalhe completo contendo cada uma das ordens, ou pode ser agregado com um pouco menos de detalhe onde as ordens são agrupadas e fundidas por preço e volume. Ter maior detalhe requer mais tráfego e largura de banda e é geralmente mais lento, mas oferece o benefício de maior precisão. Ter menos detalhe é geralmente mais rápido, mas pode não ser suficiente em alguns casos muito específicos.

### Notas sobre a Estrutura do Livro de Ordens

- O `orderbook['timestamp']` é o momento em que a exchange gerou esta resposta do livro de ordens (antes de a enviar de volta para si). Pode estar ausente (`undefined/None/null`), conforme documentado no Manual; nem todas as exchanges fornecem um timestamp aí. Se estiver definido, é o timestamp UTC **em milissegundos** desde 1 Jan 1970 00:00:00.
- Algumas exchanges podem indexar as ordens no livro de ordens por ids de ordem; nesse caso, o id da ordem pode ser devolvido como o terceiro elemento de bids e asks: `[ price, amount, id ]`. Isto é frequente em livros de ordens L3 sem agregação. O `id` da ordem, se mostrado no livro de ordens, refere-se ao livro de ordens e não corresponde necessariamente ao id de ordem real da base de dados da exchange, tal como visto pelo proprietário ou por outros. O id da ordem é um `id` da linha dentro do livro de ordens, mas não é necessariamente o verdadeiro `id` da ordem (embora possam ser iguais, dependendo da exchange em questão).
- Em alguns casos, as exchanges podem fornecer livros de ordens L2 agregados com contagens de ordens para cada nível agregado; nesse caso, a contagem de ordens pode ser devolvida como o terceiro elemento de bids e asks: `[ price, amount, count ]`. O `count` indica quantas ordens estão agregadas em cada nível de preço em bids e asks.
- Além disso, algumas exchanges podem devolver o timestamp da ordem como o terceiro elemento de bids e asks: `[ price, amount, timestamp ]`. O `timestamp` indica quando a ordem foi colocada no livro de ordens.

### Profundidade de Mercado

Algumas exchanges aceitam um dicionário de parâmetros extra na função `fetchOrderBook () / fetch_order_book ()`. **Todos os `params` extra são específicos da exchange (não unificados)**. Será necessário consultar a documentação das exchanges se quiser substituir um parâmetro específico, como a profundidade do livro de ordens. Pode obter um número limitado de ordens devolvidas ou um nível de agregação desejado (também chamado de *profundidade de mercado*) especificando um argumento de limit e `params` extra específicos da exchange da seguinte forma:


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


Os níveis de detalhe ou níveis de agregação do livro de ordens são frequentemente rotulados com números como L1, L2, L3...

- **L1**: menos detalhe para obter rapidamente informações muito básicas, nomeadamente, apenas o preço de mercado. Parece ser apenas uma ordem no livro de ordens.
- **L2**: o nível de agregação mais comum, onde os volumes de ordens são agrupados por preço. Se duas ordens têm o mesmo preço, aparecem como uma única ordem com um volume igual à sua soma total. Este é provavelmente o nível de agregação necessário para a maioria dos propósitos.
- **L3**: nível mais detalhado sem agregação, onde cada ordem é separada das outras. Este LOD contém naturalmente duplicados na saída. Portanto, se duas ordens têm preços iguais, **não** são fundidas e cabe ao motor de correspondência da exchange decidir a sua prioridade na pilha. De facto, não é necessário o nível L3 para negociar com sucesso. Na verdade, provavelmente não precisa dele de todo. Por isso, algumas exchanges não o suportam e devolvem sempre livros de ordens agregados.

Se quiser obter um livro de ordens L2, independentemente do que a exchange devolve, use o método unificado `fetchL2OrderBook(symbol, limit, params)` ou `fetch_l2_order_book(symbol, limit, params)` para esse fim.

O argumento `limit` não garante que o número de bids ou asks seja sempre igual a `limit`. Designa o limite superior ou o máximo, pelo que em algum momento pode haver menos bids ou asks do que `limit`. Este é o caso quando a exchange não tem ordens suficientes no livro de ordens. No entanto, se a API da exchange subjacente não suportar um parâmetro `limit` para o endpoint do livro de ordens, o argumento `limit` será ignorado. O CCXT não corta `bids` e `asks` se a exchange devolver mais do que o solicitado.

### Preço de Mercado

Para obter o melhor preço atual (consultar o preço de mercado) e calcular o spread bid/ask, retire os primeiros elementos de bid e ask, da seguinte forma:


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


## Tickers de Preço

Um ticker de preço contém estatísticas para um determinado mercado/símbolo durante um período de tempo recente, normalmente as últimas 24 horas. Os métodos para obter tickers são descritos abaixo.

### Um Único Ticker Para Um Símbolo

```javascript
// one ticker
fetchTicker (symbol, params = {})

// example
fetchTicker ('ETH/BTC')
fetchTicker ('BTC/USDT')
```

### Múltiplos Tickers Para Todos ou Vários Símbolos

```javascript
// multiple tickers
fetchTickers (symbols = undefined, params = {})  // for all tickers at once

// for example
fetchTickers () // all symbols
fetchTickers ([ 'ETH/BTC', 'BTC/USDT' ]) // an array of specific symbols
```

Verifique as propriedades `exchange.has['fetchTicker']` e `exchange.has['fetchTickers']` da instância da exchange para determinar se a exchange em questão suporta estes métodos.

**Por favor, note que chamar `fetchTickers ()` sem um símbolo é geralmente estritamente limitado por taxa de chamadas, e uma exchange pode banir o utilizador se este endpoint for consultado com demasiada frequência.**

### Estrutura do Ticker

Um ticker é um cálculo estatístico com as informações calculadas nas últimas 24 horas para um mercado específico.

A estrutura de um ticker é a seguinte:

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

#### Notas sobre a Estrutura do Ticker

- Todos os campos no ticker representam as 24 horas anteriores ao `timestamp`.
- O `bidVolume` é o volume (quantidade) do melhor bid atual no livro de ordens.
- O `askVolume` é o volume (quantidade) do melhor ask atual no livro de ordens.
- O `baseVolume` é a quantidade de moeda base negociada (comprada ou vendida) nas últimas 24 horas.
- O `quoteVolume` é a quantidade de moeda de cotação negociada (comprada ou vendida) nas últimas 24 horas.

**Todos os preços na estrutura do ticker estão na moeda de cotação. Alguns campos numa estrutura de ticker devolvida podem ser undefined/None/null.**

```text
base currency ↓
             BTC / USDT
             ETH / BTC
            DASH / ETH
                    ↑ quote currency
```

O timestamp e o datetime são ambos em Tempo Universal Coordenado (UTC) em milissegundos.

- `ticker['timestamp']` é o momento em que a exchange gerou esta resposta (antes de a enviar de volta para si). Pode estar ausente (`undefined/None/null`), conforme documentado no Manual; nem todas as exchanges fornecem um timestamp aí. Se estiver definido, é um timestamp UTC **em milissegundos** desde 1 Jan 1970 00:00:00.
- `exchange.last_response_headers['Date']` é a string de data e hora da última resposta HTTP recebida (dos cabeçalhos HTTP). O analisador de 'Date' deve respeitar o fuso horário indicado aí. A precisão da data e hora é de 1 segundo, 1000 milissegundos. Esta data deve ser definida pelo servidor da exchange quando a mensagem foi originada, de acordo com as seguintes normas:
    - https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.18
    - https://tools.ietf.org/html/rfc1123#section-5.2.14
    - https://tools.ietf.org/html/rfc822#section-5

Embora algumas exchanges misturem os melhores preços de bid/ask do livro de ordens nos seus tickers (e algumas exchanges até forneçam volumes de topo de bid/ask), não deve tratar um ticker como substituto de `fetchOrderBook`. O principal objetivo de um ticker é fornecer dados estatísticos; como tal, trate-o como "OHLCV ao vivo de 24h". É sabido que as exchanges desencorajam pedidos frequentes de `fetchTicker` impondo limites de taxa mais rigorosos nessas consultas. Se precisar de uma forma unificada de aceder a bids e asks, deve usar a família `fetchL[123]OrderBook` em vez disso.

Para obter preços e volumes históricos, utilize o método unificado [`fetchOHLCV`](#ohlcv-candlestick-charts) quando disponível. Para obter preços históricos de mark, index e premium index, adicione um dos valores `'price': 'mark'`, `'price': 'index'`, `'price': 'premiumIndex'` respectivamente às [substituições de parâmetros](#overriding-unified-api-params) do `fetchOHLCV`. Também existem métodos de conveniência `fetchMarkPriceOHLCV`, `fetchIndexPriceOHLCV` e `fetchPremiumIndexOHLCV` que obtêm os preços e volumes históricos de mark, index e premiumIndex.

Métodos para buscar tickers:

- `fetchTicker (symbol[, params = {}])`, symbol é obrigatório, params são opcionais
- `fetchTickers ([symbols = undefined[, params = {}]])`, ambos os argumentos são opcionais

### Individualmente Por Símbolo

Para obter os dados individuais de ticker de uma exchange para um par de negociação específico ou um símbolo específico – chame o `fetchTicker (symbol)`:


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


### Todos De Uma Vez

Algumas exchanges (não todas) também suportam a busca de todos os tickers de uma só vez. Consulte [a documentação delas](#exchanges) para obter detalhes. Você pode buscar todos os tickers com uma única chamada assim:


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


Buscar todos os tickers requer mais tráfego do que buscar um único ticker. Além disso, note que algumas exchanges impõem limites de taxa mais elevados em buscas subsequentes de todos os tickers (consulte a documentação delas nos endpoints correspondentes para obter detalhes). **O custo da chamada `fetchTickers()` em termos de limite de taxa costuma ser maior que a média**. Se você precisar apenas de um ticker, buscar por um símbolo específico também é mais rápido. Provavelmente você deseja buscar todos os tickers somente se realmente precisar de todos eles e, na maioria das vezes, não convém chamar fetchTickers com frequência maior do que uma vez por minuto aproximadamente.

Além disso, algumas exchanges podem impor requisitos adicionais à chamada `fetchTickers()`, às vezes não é possível buscar os tickers de todos os símbolos por causa das limitações de API da exchange em questão. Algumas exchanges aceitam uma lista de símbolos nos parâmetros de consulta da URL HTTP; no entanto, como o comprimento da URL é limitado e, em casos extremos, as exchanges podem ter milhares de mercados – uma lista com todos os seus símbolos simplesmente não caberia na URL, portanto precisa ser um subconjunto limitado dos seus símbolos. Às vezes, há outras razões para exigir uma lista de símbolos, e pode haver um limite no número de símbolos que você pode buscar de uma só vez; mas seja qual for a limitação, por favor, culpe a exchange. Para passar os símbolos de interesse para a exchange, você pode fornecer uma lista de strings como primeiro argumento para fetchTickers:


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


Observe que a lista de símbolos não é necessária na maioria dos casos, mas você deve adicionar lógica adicional caso queira lidar com todas as possíveis limitações que podem ser impostas pelo lado das exchanges.

Como a maioria dos métodos da API Unificada do CCXT, o último argumento de fetchTickers é o argumento `params` para substituir parâmetros de requisição enviados à exchange.

A estrutura do valor retornado é a seguinte:

```javascript
{
    'info':    { ... }, // the original JSON response from the exchange as is
    'BTC/USD': { ... }, // a single ticker for BTC/USD
    'ETH/BTC': { ... }, // a ticker for ETH/BTC
    ...
}
```

Uma solução geral para buscar todos os tickers de todas as exchanges (mesmo as que não possuem um endpoint de API correspondente) está a caminho; esta seção será atualizada em breve.

```text
UNDER CONSTRUCTION
```

## Gráficos de Velas OHLCV

A maioria das exchanges possui endpoints para buscar dados OHLCV, mas algumas não. A propriedade booleana (verdadeiro/falso) da exchange chamada `has['fetchOHLCV']` indica se a exchange suporta ou não séries de dados de velas.

Para buscar velas/barras OHLCV de uma exchange, o ccxt possui o método `fetchOHLCV`, que é declarado da seguinte forma:

```javascript
fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {})
```

Você pode chamar o método unificado `fetchOHLCV` / `fetch_ohlcv` para obter a lista de velas OHLCV de um símbolo específico assim:


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


Para ver a lista de timeframes disponíveis para sua exchange, consulte a propriedade `timeframes`. Observe que ela só é preenchida quando `has['fetchOHLCV']` também é verdadeiro.

A lista retornada de velas pode ter um ou mais períodos ausentes, caso a exchange não tenha tido nenhuma negociação para o intervalo de tempo e símbolo especificados. Para um usuário, isso apareceria como lacunas em uma lista contínua de velas. Isso é considerado normal. Se a exchange não tiver nenhuma vela naquele momento, a biblioteca CCXT mostrará os resultados conforme retornados pela própria exchange.

**Há um limite de quão longe no passado suas requisições podem ir.** A maioria das exchanges não permite consultar o histórico detalhado de velas (como as de timeframes de 1 minuto e 5 minutos) muito distante no passado. Elas geralmente mantêm uma quantidade razoável das velas mais recentes, como as últimas 1000 velas para qualquer timeframe, o que é mais do que suficiente para a maioria das necessidades. Você pode contornar essa limitação buscando continuamente (também conhecido como *REST polling*) os OHLCVs mais recentes e armazenando-os em um arquivo CSV ou em um banco de dados.

**Observe que as informações da última vela (atual) podem estar incompletas até que a vela seja fechada (até que a próxima vela comece).**

Como acontece com a maioria dos outros métodos unificados e implícitos, o método `fetchOHLCV` aceita como último argumento um array associativo (um dicionário) de `params` extras, que é usado para [substituir valores padrão](#overriding-unified-api-params) enviados nas requisições às exchanges. O conteúdo de `params` é específico de cada exchange; consulte a documentação da API das exchanges para campos e valores suportados.

O argumento `since` é um timestamp UTC inteiro **em milissegundos** (em toda a biblioteca com todos os métodos unificados).

Se `since` não for especificado, o método `fetchOHLCV` retornará o intervalo de tempo conforme o padrão da própria exchange. Isso não é um bug. Algumas exchanges retornarão velas desde o início dos tempos; outras retornarão apenas as velas mais recentes — o comportamento padrão das exchanges é esperado. Portanto, sem especificar `since`, o intervalo de velas retornadas será específico de cada exchange. Deve-se passar o argumento `since` para garantir que se obtenha exatamente o intervalo de histórico necessário.

### Obter resposta OHLCV bruta

Atualmente, a estrutura que o CCXT utiliza não inclui a resposta bruta da exchange. No entanto, os usuários podem substituir o valor de retorno fazendo:


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


### Notas Sobre Latência

Estratégias de negociação requerem informações frescas e atualizadas para análise técnica, indicadores e sinais. Construir uma estratégia de negociação especulativa com base nas velas OHLCV recebidas da exchange pode ter desvantagens críticas. Os desenvolvedores devem levar em conta os detalhes explicados nesta seção para construir bots bem-sucedidos.

Em primeiro lugar, ao usar o CCXT, você está se comunicando diretamente com as exchanges. O CCXT não é um servidor, nem um serviço; é uma biblioteca de software. Todos os dados que você obtém com o CCXT são recebidos diretamente das exchanges em primeira mão.

As exchanges geralmente fornecem duas categorias de dados públicos de mercado:

1. Dados primários de primeira ordem rápidos, que incluem order books em tempo real e negociações ou execuções
2. Dados de segunda ordem lentos, que incluem tickers secundários e velas OHLCV de kline, calculados a partir dos dados de primeira ordem

Os dados primários de primeira ordem são atualizados pelas APIs das exchanges em pseudo tempo real, ou o mais próximo do tempo real possível, o mais rápido possível. Os dados de segunda ordem requerem tempo para que a exchange os calcule. Por exemplo, um ticker nada mais é do que um corte estatístico contínuo de 24 horas de order books e negociações. As velas e volumes OHLCV também são calculados a partir de negociações de primeira ordem e representam cortes estatísticos fixos de períodos específicos. O volume negociado em uma hora é apenas a soma dos volumes negociados das negociações correspondentes que ocorreram nessa hora.

Obviamente, leva algum tempo para a exchange coletar os dados de primeira ordem e calcular os dados estatísticos secundários a partir deles. Isso literalmente significa que **tickers e OHLCVs são sempre mais lentos do que order books e negociações**. Em outras palavras, há sempre alguma latência na API da exchange entre o momento em que uma negociação ocorre e o momento em que uma vela OHLCV correspondente é atualizada ou publicada pela API da exchange.

A latência (ou quanto tempo é necessário para a API da exchange calcular os dados secundários) depende da velocidade do motor da exchange, portanto é específica de cada exchange. Os melhores motores de exchange geralmente retornam e atualizam velas OHLCV e tickers do último minuto a uma taxa muito rápida. Algumas exchanges podem fazê-lo em intervalos regulares, como uma vez por segundo ou uma vez a cada alguns segundos. Motores de exchange mais lentos podem levar minutos para atualizar as informações estatísticas secundárias; suas APIs podem retornar a vela OHLCV atual mais recente com alguns minutos de atraso.

Se sua estratégia depende dos dados mais recentes do último minuto, você não deseja construí-la com base em tickers ou OHLCVs recebidos da exchange. Tickers e OHLCVs das exchanges são adequados apenas para fins de exibição ou para estratégias de negociação simples em timeframes de hora ou dia, que são menos suscetíveis à latência.

Felizmente, os desenvolvedores de estratégias de negociação críticas em tempo não precisam depender de dados secundários das exchanges e podem calcular os OHLCVs e tickers no lado do usuário. Isso pode ser mais rápido e eficiente do que esperar as exchanges atualizarem as informações do lado delas. É possível agregar o histórico público de negociações fazendo polling frequente e calcular velas percorrendo a lista de negociações — veja o arquivo "build-ohlcv-bars" dentro da [pasta de exemplos](https://github.com/ccxt/ccxt/tree/master/examples)

Devido às diferenças em suas implementações internas, as exchanges podem ser mais rápidas para atualizar seus dados de mercado primários e secundários via WebSockets. A latência permanece específica de cada exchange, pois o motor da exchange ainda precisa de tempo para calcular os dados secundários, independentemente de você estar fazendo polling via API RESTful com CCXT ou recebendo atualizações via WebSockets com CCXT Pro. WebSockets podem melhorar a latência de rede, portanto uma exchange rápida funcionará ainda melhor, mas adicionar suporte para assinaturas WS não fará um motor de exchange lento trabalhar muito mais rápido.

Se você quiser se manter atualizado sobre a latência dos dados de segunda ordem, precisará calculá-la do seu lado e superar o motor da exchange em velocidade. Dependendo das necessidades da sua aplicação, isso pode ser complicado, pois você precisará lidar com redundância, "buracos de dados" no histórico, períodos de inatividade das exchanges e outros aspectos da agregação de dados, que constituem um universo inteiro em si mesmo, impossível de cobrir completamente neste Manual.


### Construir barras OHLCV a partir de negociações

Conforme observado no parágrafo acima, os usuários podem construir velas manualmente usando o método `buildOHLCV / build_ohlcv`. Você pode ver um arquivo de exemplo chamado "build-ohlcv-bars" dentro da [pasta de exemplos](https://github.com/ccxt/ccxt/tree/master/examples). 
Notas:
- Este método espera que as negociações fornecidas estejam ordenadas cronologicamente (a negociação mais recente deve ser a última no array)
- Devido a possíveis erros dentro das entradas de negociação (provenientes de `watch_ohlcv` ou outras fontes) dentro do método `build_ohlcv`, pulamos negociações com preço `0`, para evitar valores distorcidos em uma vela. No entanto, se você não quiser pular esses itens de negociação, defina uma opção:

```
exchange.options['buildOHLCV'] = {
    'skipZeroPrices': false
};
```

### Estrutura OHLCV

O método fetchOHLCV mostrado acima retorna uma lista (um array plano) de velas OHLCV representadas pela seguinte estrutura:

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

A lista de velas é retornada ordenada em ordem crescente (histórica/cronológica), com a vela mais antiga primeiro e a vela mais recente por último.

### Gráficos de Velas Mark, Index e PremiumIndex

Para obter velas históricas de Mark, Index Price e Premium Index, passe o parâmetro `'price'` via [substituição de parâmetros unificados](#overriding-unified-api-params) para `fetchOHLCV`. O parâmetro `'price'` aceita um dos seguintes valores:

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

Também existem métodos de conveniência `fetchMarkOHLCV`, `fetchIndexOHLCV` e `fetchPremiumIndexOHLCV`


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


## Negociações Públicas

```diff
- this is under heavy development right now, contributions appreciated
```

Você pode chamar o método unificado `fetchTrades` / `fetch_trades` para obter a lista das negociações mais recentes de um símbolo específico. O método `fetchTrades` é declarado da seguinte forma:

```javascript
async fetchTrades (symbol, since = undefined, limit = undefined, params = {})
```

Por exemplo, se você quiser imprimir as negociações recentes de todos os símbolos, um por um de forma sequencial (atenção ao rateLimit!), você faria assim:


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


O método fetchTrades mostrado acima retorna uma lista ordenada de negociações (um array plano, ordenado por timestamp em ordem crescente, com a negociação mais antiga primeiro e a mais recente por último). Uma lista de negociações é representada pela [estrutura de negociação](#trade-structure).

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

A maioria das exchanges retorna a maior parte dos campos acima para cada negociação, embora existam exchanges que não retornam o tipo, o lado, o id da negociação ou o id da ordem. Na maioria das vezes, é garantido ter o timestamp, o datetime, o símbolo, o preço e a quantidade de cada negociação.

O segundo argumento opcional `since` filtra o array por timestamp; o terceiro argumento `limit` filtra pelo número (quantidade) de itens retornados.

Se o usuário não especificar `since`, o método `fetchTrades` retornará o intervalo padrão de negociações públicas da exchange. O conjunto padrão é específico de cada exchange: algumas exchanges retornam negociações a partir da data de listagem de um par na exchange, outras retornam um conjunto reduzido de negociações (como as últimas 24 horas, as últimas 100 negociações, etc.). Se o usuário quiser controle preciso sobre o período de tempo, é sua responsabilidade especificar o argumento `since`.

A maioria dos métodos unificados retornará um único objeto ou um array simples (uma lista) de objetos (negociações). No entanto, poucas exchanges (se alguma) retornarão todas as negociações de uma vez. Na maioria das vezes, suas APIs `limit` limitam a saída a um determinado número de objetos mais recentes. **VOCÊ NÃO PODE OBTER TODOS OS OBJETOS DESDE O INÍCIO DOS TEMPOS ATÉ O MOMENTO PRESENTE EM UMA ÚNICA CHAMADA**. Na prática, muito poucas exchanges tolerarão ou permitirão isso.

Para buscar negociações históricas, o usuário precisará percorrer os dados em porções ou "páginas" de objetos. A paginação frequentemente implica *"buscar porções de dados uma por uma"* em um loop.

Na maioria dos casos, os usuários são **obrigados a usar algum tipo de paginação** para obter os resultados esperados de forma consistente.

Por outro lado, **algumas exchanges não suportam paginação para negociações públicas**. Em geral, as exchanges fornecerão apenas as negociações mais recentes.

O método `fetchTrades ()` / `fetch_trades()` também aceita um argumento opcional `params` (array associativo/dicionário, vazio por padrão) como seu quarto argumento. Você pode usá-lo para passar parâmetros extras para chamadas de método ou para substituir um valor padrão específico (onde suportado pela exchange). Consulte a documentação da API da sua exchange para mais detalhes.

## Hora da Exchange

O método `fetchTime()` (se disponível) retorna o timestamp inteiro atual em milissegundos do servidor da exchange.

```javascript
fetchTime(params = {})
```

## Status da Exchange

O status da exchange descreve as informações mais recentes conhecidas sobre a disponibilidade da API da exchange. Essas informações são codificadas diretamente na classe da exchange ou buscadas ao vivo diretamente da API da exchange. O método `fetchStatus(params = {})` pode ser usado para obter essas informações. O status retornado por `fetchStatus` é um dos seguintes:

- Codificado diretamente na classe da exchange, por exemplo, se a API foi interrompida ou encerrada.
- Atualizado usando o ping da exchange ou o endpoint `fetchTime` para verificar se está ativo
- Atualizado usando o endpoint de status dedicado da API da exchange.

```javascript
fetchStatus(params = {})
```

### Estrutura de Status da Exchange

O método `fetchStatus()` retornará uma estrutura de status como mostrado abaixo:

```javascript
{
    'status': 'ok', // 'ok', 'shutdown', 'error', 'maintenance'
    'updated': undefined, // integer, last updated timestamp in milliseconds if updated via the API
    'eta': undefined, // when the maintenance or outage is expected to end
    'url': undefined, // a link to a GitHub issue or to an exchange post on the subject
}
```

Os valores possíveis no campo `status` são:

- `'ok'` significa que a API da exchange está totalmente operacional
- `'shutdown`' significa que a exchange foi encerrada, e o campo `updated` deve conter o datetime do encerramento
- `'error'` significa que a API da exchange está com problemas, ou que a implementação da exchange no CCXT está com problemas
- `'maintenance'` significa manutenção regular, e o campo `eta` deve conter o datetime em que se espera que a exchange volte a estar operacional

## Taxas de Empréstimo

*apenas margem*

Ao realizar operações a descoberto ou com alavancagem em um mercado spot, é necessário emprestar moeda. Juros são acumulados sobre a moeda emprestada.

Os dados sobre a taxa de empréstimo de uma moeda podem ser obtidos usando

- `fetchCrossBorrowRate ()` para a taxa de empréstimo de uma única moeda
- `fetchCrossBorrowRates ()` para as taxas de empréstimo de todas as moedas
- `fetchIsolatedBorrowRate ()` para a taxa de empréstimo de um par de negociação
- `fetchIsolatedBorrowRates ()` para as taxas de empréstimo de todos os pares de negociação
- `fetchBorrowRatesPerSymbol ()` para as taxas de empréstimo de moedas em mercados individuais

```javascript
fetchCrossBorrowRate (code, params = {})
```

Parâmetros

- **code** (String) Código de moeda unificado do CCXT, obrigatório (ex.: `"USDT"`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"settle": "USDT"}`)

Retorna

- Uma [estrutura de taxa de empréstimo](#borrow-rate-structure)

```javascript
fetchCrossBorrowRates (params = {})
```

Parâmetros

- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"startTime": 1610248118000}`)

Retorna

- Um dicionário de [estruturas de taxa de empréstimo](#borrow-rate-structure) com códigos de moeda unificados como chaves

```javascript
fetchIsolatedBorrowRate (symbol, params = {})
```

Parâmetros

- **symbol** (String) Símbolo de mercado unificado do CCXT, obrigatório (ex.: `"BTC/USDT"`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"settle": "USDT"}`)

Retorna

- Uma [estrutura de taxa de empréstimo isolada](#isolated-borrow-rate-structure)

```javascript
fetchIsolatedBorrowRates (params = {})
```

Parâmetros

- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"startTime": 1610248118000}`)

Retorna

- Um dicionário de [estruturas de taxa de empréstimo isoladas](#isolated-borrow-rate-structure) com símbolos de mercado unificados como chaves

### Estrutura de Taxa de Empréstimo Isolada

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

### Estrutura de Taxa de Empréstimo

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

## Histórico de Taxas de Empréstimo

*apenas margem*

O método `fetchBorrowRateHistory` recupera um histórico da taxa de juros de empréstimo de uma moeda em intervalos de tempo específicos

```javascript
fetchBorrowRateHistory (code, since = undefined, limit = undefined, params = {})
```

Parâmetros

- **code** (String) *obrigatório* Código de moeda unificado do CCXT (ex.: `"USDT"`)
- **since** (Integer) Timestamp para a taxa de empréstimo mais antiga (ex.: `1645807945000`)
- **limit** (Integer) O número máximo de [estruturas de taxa de empréstimo](#borrow-rate-structure) a recuperar (ex.: `10`)
- **params** (Dictionary) Parâmetros extras específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)

Retorna

- Um array de [estruturas de taxa de empréstimo](#borrow-rate-structure)

## Níveis de Alavancagem

*apenas contratos*

- Os métodos de Nível de Alavancagem são privados na **binance**

O método `fetchLeverageTiers()` pode ser usado para obter a alavancagem máxima para um mercado em tamanhos de posição variados. Também pode ser usado para obter a taxa de margem de manutenção e o valor máximo negociável para um mercado quando essas informações não estão disponíveis no objeto de mercado

Embora você possa obter a alavancagem máxima absoluta para um mercado acessando `market['limits']['leverage']['max']`, para muitos mercados de contratos, a alavancagem máxima dependerá do tamanho da sua posição.

Você pode acessar esses limites usando

- `fetchMarketLeverageTiers()` (símbolo único)
- `fetchLeverageTiers([symbol1, symbol2, ...])` (múltiplos símbolos)
- `fetchLeverageTiers()` (todos os símbolos de mercado)

```javascript
fetchMarketLeverageTiers(symbol, params = {})
```

Parâmetros

- **symbol** (String) *obrigatório* Símbolo unificado do CCXT (ex.: `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"settle": "usdt"}`)

Retorna

- uma [estrutura de níveis de alavancagem](#leverage-tiers-structure)

```javascript
fetchLeverageTiers(symbols = undefined, params = {})
```

Parâmetros

- **symbols** (\[String\]) Símbolo unificado do CCXT (ex.: `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"settle": "usdt"}`)

Retorna

- um array de [estruturas de níveis de alavancagem](#leverage-tiers-structure)

### Estrutura de Níveis de Alavancagem

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

No exemplo acima:

- apostas abaixo de 133,33       = alavancagem máxima de 75
- apostas de 200 + 1000          = alavancagem máxima de 50
- uma aposta de 150              = alavancagem máxima de (10000 / 150)   = 66,66
- apostas entre 133,33-200       = alavancagem máxima de (10000 / aposta) = 50,01 -> 74,99

**Nota para usuários da Huobi:** A Huobi usa tanto a alavancagem quanto o valor para determinar as taxas de margem de manutenção: https://www.huobi.com/support/en-us/detail/900000089903

## Taxa de Financiamento

*apenas contratos*

Os dados sobre as taxas de financiamento atuais, mais recentes e próximas podem ser obtidos usando os métodos

- `fetchFundingRates ()` para todos os símbolos de mercado
- `fetchFundingRates ([ symbol1, symbol2, ... ])` para múltiplos símbolos de mercado
- `fetchFundingRate (symbol)` para um único símbolo de mercado

```javascript
fetchFundingRate (symbol, params = {})
```

Parâmetros

- **symbol** (String) *obrigatório* Símbolo unificado do CCXT (ex.: `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)

Retorna

- uma [estrutura de taxa de financiamento](#funding-rate-structure)

```javascript
fetchFundingRates (symbols = undefined, params = {})
```

Parâmetros

- **symbols** (\[String\]) Um array/lista opcional de símbolos unificados do CCXT (ex.: `["BTC/USDT:USDT", "ETH/USDT:USDT"]`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)

Retorna

- Um array de [estruturas de taxa de financiamento](#funding-rate-structure) indexadas por símbolos de mercado

## Intervalo de Financiamento

*apenas contratos*

Recupere o intervalo de financiamento atual usando os seguintes métodos:

- `fetchFundingInterval (symbol)` para um único símbolo de mercado
- `fetchFundingIntervals ()` para todos os símbolos de mercado
- `fetchFundingIntervals ([ symbol1, symbol2, ... ])` para múltiplos símbolos de mercado

```javascript
fetchFundingInterval (symbol, params = {})
```

Parâmetros

- **symbol** (String) *obrigatório* Símbolo unificado do CCXT (ex.: `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)

Retorna

- Uma [estrutura de taxa de financiamento](#funding-rate-structure)

```javascript
fetchFundingIntervals (symbols = undefined, params = {})
```

Parâmetros

- **symbols** (\[String\]) Um array/lista opcional de símbolos unificados do CCXT (ex.: `["BTC/USDT:USDT", "ETH/USDT:USDT"]`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)

Retorna

- Um array de [estruturas de taxa de financiamento](#funding-rate-structure)

### Estrutura de Taxa de Financiamento

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

## Histórico de Taxas de Financiamento

*apenas contratos*

```javascript
fetchFundingRateHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

Parâmetros

- **symbol** (String) Símbolo unificado do CCXT (ex.: `"BTC/USDT:USDT"`)
- **since** (Integer) Timestamp para a taxa de financiamento mais antiga (ex.: `1645807945000`)
- **limit** (Integer) O número máximo de taxas de financiamento a recuperar (ex.: `10`)
- **params** (Dictionary) Parâmetros extras específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)

Retorna

- Um array de [estruturas de histórico de taxa de financiamento](#funding-rate-history-structure)

### Estrutura do Histórico de Taxa de Financiamento

```javascript
{
    info: { ... },
    symbol: "BTC/USDT:USDT",
    fundingRate: -0.000068,
    timestamp: 1642953600000,
    datetime: "2022-01-23T16:00:00.000Z"
}
```

## Interesse em Aberto

*somente contrato*

Use o método `fetchOpenInterest` para obter o interesse em aberto atual para um símbolo da exchange. Use `fetchOpenInterests` para obter o interesse em aberto atual para múltiplos símbolos

```javascript
fetchOpenInterest (symbol, params = {})
```

Parâmetros

- **symbol** (String) Símbolo de mercado unificado CCXT (ex.: `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parâmetros extras específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)

Retorna

- Uma [estrutura de interesse em aberto](#open-interest-structure)

```js
fetchOpenInterests (symbols = undefined, params = {})
```

- **symbols** ([String]) Um array/lista opcional de símbolos CCXT unificados (ex.: `["BTC/USDT:USDT", "ETH/USDT:USDT"]`). Deixe como `undefined` para todos os símbolos.
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)

Retorna

- Um dicionário de [estruturas de interesse em aberto](#open-interest-structure)

### Histórico de Interesse em Aberto

*somente contrato*

Use o método `fetchOpenInterestHistory` para obter um histórico de interesse em aberto para um símbolo da exchange.

```javascript
fetchOpenInterestHistory (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {})
```

Parâmetros

- **symbol** (String) Símbolo de mercado unificado CCXT (ex.: `"BTC/USDT:USDT"`)
- **timeframe** (String) Verifique exchange.timeframes para os valores disponíveis
- **since** (Integer) Timestamp para o registro de interesse em aberto mais antigo (ex.: `1645807945000`)
- **limit** (Integer) O número máximo de [estruturas de interesse em aberto](#open-interest-structures) a recuperar (ex.: `10`)
- **params** (Dictionary) Parâmetros extras específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)

**Nota para usuários OKX:** em vez de um símbolo unificado, okx.fetchOpenInterestHistory espera um código de moeda unificado CCXT no argumento **symbol** (ex.: `'BTC'`).

Retorna

- Um array de [estruturas de interesse em aberto](#open-interest-structure)

### Estrutura de Interesse em Aberto

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

## Volatilidade Histórica

*somente opção*

Use o método `fetchVolatilityHistory` para obter o histórico de volatilidade do código de um ativo subjacente de opções da exchange.

```javascript
fetchVolatilityHistory (code, params = {})
```

Parâmetros

- **code** (String) *obrigatório* Código de moeda unificado CCXT (ex.: `"BTC"`)
- **params** (Dictionary) Parâmetros extras específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)

Retorna

- Um array de [estruturas de histórico de volatilidade](#volatility-structure)

### Estrutura de Volatilidade

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

## Ativos Subjacentes

*somente contrato*

Use o método `fetchUnderlyingAssets` para obter os IDs de mercado dos ativos subjacentes para um tipo de mercado de contrato da exchange.

```javascript
fetchUnderlyingAssets (params = {})
```

Parâmetros

- **params** (Dictionary) Parâmetros extras específicos do endpoint da API da exchange (ex.: `{"instType": "OPTION"}`)
- **params.type** (String) marketType unificado, o padrão é 'option' (ex.: `"option"`)

Retorna

- Uma [estrutura de ativos subjacentes](#underlying-assets-structure)

### Estrutura de Ativos Subjacentes

```javascript
[ 'BTC_USDT', 'ETH_USDT', 'DOGE_USDT' ]
```

## Histórico de Liquidação

*somente contrato*

Use o método `fetchSettlementHistory` para obter o histórico público de liquidação de um mercado de contrato da exchange. Use `fetchMySettlementHistory` para obter apenas o seu histórico de liquidação

```javascript
fetchMySettlementHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
fetchSettlementHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

Parâmetros

- **symbol** (String) Símbolo CCXT unificado (ex.: `"BTC/USDT:USDT-230728-25500-P"`)
- **since** (Integer) Timestamp para a liquidação mais antiga (ex.: `1694073600000`)
- **limit** (Integer) O número máximo de liquidações a recuperar (ex.: `10`)
- **params** (Dictionary) Parâmetros extras específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)

Retorna

- Um array de [estruturas de histórico de liquidação](#settlement-history-structure)

### Estrutura do Histórico de Liquidação

```javascript
{
    info: { ... },
    symbol: 'BTC/USDT:USDT-230728-25500-P',
    price: 25761.35807869,
    timestamp: 1694073600000,
    datetime: '2023-09-07T08:00:00.000Z',
}
```

## Liquidações Forçadas

*somente margem e contrato*

Use o método `fetchLiquidations` para obter as liquidações forçadas públicas de um par de negociação da exchange. Use `fetchMyLiquidations` para obter apenas o seu histórico de liquidações forçadas

```javascript
fetchMyLiquidations (symbol = undefined, since = undefined, limit = undefined, params = {})
fetchLiquidations (symbol, since = undefined, limit = undefined, params = {})
```

Parâmetros

- **symbol** (String) Símbolo CCXT unificado (ex.: `"BTC/USDT:USDT-231006-25000-P"`)
- **since** (Integer) Timestamp para a liquidação forçada mais antiga (ex.: `1694073600000`)
- **limit** (Integer) O número máximo de liquidações forçadas a recuperar (ex.: `10`)
- **params** (Dictionary) Parâmetros extras específicos do endpoint da API da exchange (ex.: `{"until": 1645807945000}`)

Retorna

- Um array de [estruturas de liquidação forçada](#liquidation-structure)

### Estrutura de Liquidação Forçada

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

## Gregas

*somente opção*

Use o método `fetchGreeks` para obter as gregas públicas e a volatilidade implícita de um par de negociação de opções da exchange. Use `fetchAllGreeks` para obter as gregas de todos os símbolos ou de múltiplos símbolos.
As gregas medem como fatores como o preço do ativo subjacente, o tempo até o vencimento, a volatilidade e as taxas de juros afetam o preço de um contrato de opções.

```javascript
fetchGreeks (symbol, params = {})
```

Parâmetros

- **symbol** (String) Símbolo CCXT unificado (ex.: `"BTC/USD:BTC-240927-40000-C"`)
- **params** (Dictionary) Parâmetros extras específicos do endpoint da API da exchange (ex.: `{"category": "options"}`)

Retorna

- Uma [estrutura de gregas](#greeks-structure)

```javascript
fetchAllGreeks (symbols = undefined, params = {})
```

Parâmetros

- **symbols** (String) Símbolo CCXT unificado (ex.: `"BTC/USD:BTC-240927-40000-C"`)
- **params** (Dictionary) Parâmetros extras específicos do endpoint da API da exchange (ex.: `{"category": "options"}`)

// por exemplo
fetchAllGreeks () // todos os símbolos
fetchAllGreeks ([ 'BTC/USD:BTC-240927-40000-C', 'ETH/USD:ETH-240927-4000-C' ]) // um array de símbolos específicos

Retorna

- Uma lista de [estruturas de gregas](#greeks-structure)

### Estrutura de Gregas

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

## Cadeia de Opções

*somente opção*

Use o método `fetchOption` para obter os detalhes públicos de um único contrato de opção da exchange.

```javascript
fetchOption (symbol, params = {})
```

Parâmetros

- **symbol** (String) Símbolo de mercado unificado CCXT (ex.: `"BTC/USD:BTC-240927-40000-C"`)
- **params** (Dictionary) Parâmetros extras específicos do endpoint da API da exchange (ex.: `{"category": "options"}`)

Retorna

- Uma [estrutura de cadeia de opções](#option-chain-structure)

Use o método `fetchOptionChain` para obter os dados públicos da cadeia de opções de uma moeda subjacente da exchange.

```javascript
fetchOptionChain (code, params = {})
```

Parâmetros

- **code** (String) Código de moeda unificado CCXT (ex.: `"BTC"`)
- **params** (Dictionary) Parâmetros extras específicos do endpoint da API da exchange (ex.: `{"category": "options"}`)

Retorna

- Uma lista de [estruturas de cadeia de opções](#option-chain-structure)

### Estrutura de Cadeia de Opções

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

## Razão Long/Short

*somente contrato*

Use o método `fetchLongShortRatio` para obter a razão long/short atual de um símbolo e use `fetchLongShortRatioHistory` para obter o histórico de razões long/short de um símbolo.

- `fetchLongShortRatio (symbol, period)` para a razão atual de um único símbolo de mercado
- `fetchLongShortRatioHistory (symbol, period, since, limit)` para o histórico de razões de um único símbolo de mercado

```javascript
fetchLongShortRatio (symbol, period = undefined, params = {})
```

Parâmetros

- **symbol** (String) *obrigatório* Símbolo CCXT unificado (ex.: `"BTC/USDT:USDT"`)
- **period** (String) O período para calcular a razão (ex.: `"24h"`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)

Retorna

- uma [estrutura de razão long/short](#long-short-ratio-structure)

```javascript
fetchLongShortRatioHistory (symbol = undefined, period = undefined, since = undefined, limit = undefined, params = {})
```

Parâmetros

- **symbol** (String) Símbolo CCXT unificado (ex.: `"BTC/USDT:USDT"`)
- **period** (String) O período para calcular a razão (ex.: `"24h"`)
- **since** (Integer) Timestamp para a razão mais antiga (ex.: `1645807945000`)
- **limit** (Integer) O número máximo de razões a recuperar (ex.: `10`)
- **params** (Dictionary) Parâmetros extras específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)

Retorna

- um array de [estruturas de razão long/short](#long-short-ratio-structure)

### Estrutura de Razão Long/Short

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

## Desalavancagem Automática

*somente contrato*

Use o método `fetchADLRank` para obter os detalhes públicos da classificação de desalavancagem automática de um símbolo da exchange.

```javascript
fetchADLRank (symbol, params = {})
```

Parâmetros

- **symbol** (String) Símbolo de mercado unificado CCXT (ex.: `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parâmetros extras específicos do endpoint da API da exchange (ex.: `{"category": "futures"}`)

Retorna

- Uma [estrutura de desalavancagem automática](#auto-de-leverage)

### Estrutura de Desalavancagem Automática

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

- [Autenticação](#authentication)
- [Login](#sign-in)
- [Configuração de Chaves de API](#api-keys-setup)
- [Contas](#accounts)
- [Saldo da Conta](#account-balance)
- [Ordens](#orders)
- [Minhas Negociações](#my-trades)
- [Razão](#ledger)
- [Depósito](#deposit)
- [Saque](#withdrawal)
- [Endereços de Depósito](#deposit-addresses)
- [Transferências](#transfers)
- [Taxas](#fees)
- [Juros de Empréstimo](#borrow-interest)
- [Empréstimo e Reembolso de Margem](#borrow-and-repay-margin)
- [Margem](#margin)
- [Modo de Margem](#margin-mode)
- [Alavancagem](#leverage)
- [Posições](#positions)
- [Histórico de Financiamento](#funding-history)
- [Conversão](#conversion)
- [Desalavancagem Automática](#auto-de-leverage)

Para poder acessar sua conta de usuário, realizar negociações algorítmicas colocando ordens de mercado e limitadas, consultar saldos, depositar e sacar fundos e assim por diante, você precisa obter suas chaves de API para autenticação de cada exchange com a qual deseja negociar. Geralmente estão disponíveis em uma aba ou página separada dentro das configurações da sua conta de usuário. As chaves de API são específicas de cada exchange e não podem ser trocadas em nenhuma circunstância.

As APIs privadas das exchanges geralmente permitem os seguintes tipos de interação:

- o estado atual do saldo da conta do usuário pode ser obtido com o método `fetchBalance()` conforme descrito na seção [Saldo da Conta](#account-balance)
- o usuário pode colocar e cancelar ordens com `createOrder()`, `cancelOrder()`, bem como buscar ordens abertas atuais e o histórico de ordens anteriores com métodos como `fetchOrder`, `fetchOrders()`, `fetchOpenOrder()`, `fetchOpenOrders()`, `fetchCanceledOrders`, `fetchClosedOrder`, `fetchClosedOrders`, conforme descrito na seção sobre [Ordens](#orders)
- o usuário pode consultar o histórico de negociações anteriores executadas com sua conta usando `fetchMyTrades`, conforme descrito na seção [Minhas Negociações](#my-trades), veja também [Como as Ordens se Relacionam com as Negociações](#how-orders-are-related-to-trades)
- o usuário pode consultar suas posições com `fetchPositions()` e `fetchPosition()` conforme descrito na seção [Posições](#positions)
- o usuário pode buscar o histórico de suas transações (transações on-chain que são _depósitos_ na conta da exchange ou _saques_ da conta da exchange) com `fetchTransactions()`, ou com `fetchDeposit()`, `fetchDeposits()` `fetchWithdrawal()`, e `fetchWithdrawals()` separadamente, dependendo do que está disponível na API da exchange
- se a API da exchange fornecer um endpoint de razão, o usuário pode buscar um histórico de todos os movimentos de dinheiro que afetaram o saldo de alguma forma, com `fetchLedger` que retornará todas as entradas contábeis do razão, como negociações, depósitos, saques, transferências internas entre contas, reembolsos, bônus, taxas, lucros de staking e assim por diante, conforme descrito na seção [Razão](#ledger).

## Autenticação

A autenticação com todas as exchanges é tratada automaticamente se forem fornecidas as chaves de API corretas. O processo de autenticação geralmente segue o seguinte padrão:

1. Gerar um novo nonce. Um nonce é um inteiro, frequentemente um Unix Timestamp em segundos ou milissegundos (desde a época de 1 de janeiro de 1970). O nonce deve ser único para uma determinada requisição e constantemente crescente, de modo que duas requisições não compartilhem o mesmo nonce. Cada próxima requisição deve ter um nonce maior do que a requisição anterior. **O nonce padrão é um Unix Timestamp de 32 bits em segundos.**
2. Acrescentar a `apiKey` pública e o nonce aos outros parâmetros do endpoint, se houver, e então serializar tudo para assinatura.
3. Assinar os parâmetros serializados usando HMAC-SHA256/384/512 ou MD5 com sua chave secreta.
4. Acrescentar a assinatura em Hex ou Base64 e o nonce aos cabeçalhos HTTP ou ao corpo.

Este processo pode diferir de exchange para exchange. Algumas exchanges podem querer a assinatura em uma codificação diferente, algumas variam nos nomes e formatos de parâmetros de cabeçalho e corpo, mas o padrão geral é o mesmo para todas elas.

**Você não deve compartilhar o mesmo par de chaves de API entre múltiplas instâncias de uma exchange rodando simultaneamente, em scripts separados ou em múltiplas threads. Usar o mesmo par de chaves de instâncias diferentes simultaneamente pode causar todo tipo de comportamento inesperado.**

**NÃO REUTILIZE CHAVES DE API COM SOFTWARES DIFERENTES! O outro software irá bagunçar seu nonce para um valor muito alto. Se você receber erros [InvalidNonce](#invalid-nonce) – certifique-se de gerar um novo par de chaves primeiro e antes de mais nada.**

A autenticação já é tratada para você, portanto não é necessário executar nenhuma dessas etapas manualmente, a menos que você esteja implementando uma nova classe de exchange. A única coisa que você precisa para negociar é o par de chaves de API real.

### Configuração de Chaves de API

#### Credenciais Necessárias

As credenciais de API geralmente incluem o seguinte:

- `apiKey`. Esta é sua Chave de API e/ou Token pública. Esta parte é *não secreta*, está incluída no cabeçalho ou corpo da sua requisição e é enviada via HTTPS em texto aberto para identificar sua requisição. Frequentemente é uma string em codificação Hex ou Base64 ou um identificador UUID.
- `secret`. Esta é sua chave privada. Mantenha-a em segredo, não a conte a ninguém. É usada para assinar suas requisições localmente antes de enviá-las às exchanges. A chave secreta não é enviada pela internet no processo de requisição-resposta e não deve ser publicada ou enviada por e-mail. É usada em conjunto com o nonce para gerar uma assinatura criptograficamente forte. Essa assinatura é enviada com sua chave pública para autenticar sua identidade. Cada requisição tem um nonce único e, portanto, uma assinatura criptográfica única.
- `uid`. Algumas exchanges (não todas) também geram um id de usuário ou *uid* para abreviar. Pode ser uma string ou um literal numérico. Você deve defini-lo, se isso for explicitamente exigido pela sua exchange. Consulte [a documentação delas](#exchanges) para mais detalhes.
- `password`. Algumas exchanges (não todas) também exigem sua senha/frase para negociação. Você deve definir esta string, se isso for explicitamente exigido pela sua exchange. Consulte [a documentação delas](#exchanges) para mais detalhes.

Para criar chaves de API, encontre a aba ou botão de API nas configurações do seu usuário no site da exchange. Em seguida, crie suas chaves e copie-as para o seu arquivo de configuração. As permissões do seu arquivo de configuração devem ser definidas adequadamente, ilegíveis para qualquer pessoa exceto o proprietário.

**Lembre-se de manter sua `apiKey` e chave secreta protegidas contra uso não autorizado, não as envie ou conte a ninguém. Um vazamento da chave secreta ou uma violação de segurança pode custar a perda de fundos.**

#### Validação de Credenciais

Para verificar se o usuário forneceu todas as credenciais necessárias, a classe base `Exchange` possui um método chamado `exchange.checkRequiredCredentials()` ou `exchange.check_required_credentials()`. Chamar esse método lançará um `AuthenticationError`, se alguma das credenciais estiver faltando ou vazia. A classe base `Exchange` também possui a propriedade `exchange.requiredCredentials` que permite ao usuário ver quais credenciais são necessárias para esta ou aquela exchange, como mostrado abaixo:

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


#### Configurando Chaves de API

Para configurar uma exchange para negociação, basta atribuir as credenciais de API a uma instância de exchange existente ou passá-las ao construtor da exchange na instanciação, da seguinte forma:


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


Observe que suas requisições privadas falharão com uma exceção ou erro se você não configurar suas credenciais de API antes de começar a negociar. Para evitar escapes de caracteres **sempre escreva suas credenciais entre aspas simples**, não aspas duplas (`'MUITO_BOM'`, `"MUITO_RUIM"`).

#### Permissões de Chave de API
Quando você receber erros como `"Invalid API-key, IP, or permissions for action."` ou `"API-key format invalid"`, então, muito provavelmente, o problema não está no ccxt; por favor, evite abrir uma nova issue a menos que você garanta que:
1) Você não tem erros de digitação, espaços vazios ou aspas em suas chaves
2) Seu endereço IP atual (verifique [IPv4](https://api.ipify.org/) ou [IPv6](https://api64.ipify.org/)) está adicionado à lista de permissões da API-KEY (se você usar proxy, considere isso também)
3) Você selecionou as opções corretas na lista de permissões para essa api-key
4) Você não está misturando acidentalmente api-keys de "testnet" ou modo "testnet" em seu script
5) Você já verificou as [issues reportadas](https://github.com/ccxt/ccxt/issues?q=is%3Aissue+%22Invalid+Api-Key+ID%22) sobre este erro


#### Entrar

Algumas exchanges exigem que você faça login antes de chamar métodos privados, o que pode ser feito usando o método `signIn`


```javascript tab="JavaScript"
signIn (params = {})
```

Parâmetros

- **params** (Dictionary) Parâmetros específicos para o endpoint da API da exchange (ex.: `{"2fa": "329293"}`)

Retorna

- resposta da exchange

## Substituindo o Nonce

**O nonce padrão é definido pela exchange subjacente. Você pode substituí-lo por um nonce em milissegundos se quiser fazer requisições privadas com mais frequência do que uma vez por segundo! A maioria das exchanges irá limitar suas requisições se você atingir seus limites de taxa; leia [a documentação da API da sua exchange](/docs/exchange-markets) com atenção!**

Caso você precise redefinir o nonce, é muito mais fácil criar outro par de chaves para usar com APIs privadas. Criar novas chaves e configurar um par de chaves novo e não utilizado em sua configuração geralmente é suficiente para isso.

Em alguns casos você não consegue criar novas chaves por falta de permissões ou por qualquer outro motivo. Se isso acontecer, você ainda pode substituir o nonce. A classe base de mercado possui os seguintes métodos por conveniência:

- `seconds ()`: retorna um Unix Timestamp em segundos.
- `milliseconds ()`: o mesmo em milissegundos (ms = 1000 * s, milésimos de segundo).
- `microseconds ()`: o mesmo em microssegundos (μs = 1000 * ms, milionésimos de segundo).

Há exchanges que confundem milissegundos com microssegundos em suas documentações de API; vamos todos perdoá-las por isso. Você pode usar os métodos listados acima para substituir o valor do nonce. Se você precisar usar o mesmo par de chaves de múltiplas instâncias simultaneamente, use closures ou uma função comum para evitar conflitos de nonce. Em JavaScript você pode substituir o nonce fornecendo um parâmetro `nonce` ao construtor da exchange ou definindo-o explicitamente no objeto da exchange:

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

Em Python e PHP você pode fazer o mesmo criando uma subclasse e sobrescrevendo a função nonce de uma classe de exchange específica:

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

## Contas

Você pode obter todas as contas associadas a um perfil usando o método `fetchAccounts()`

```javascript
fetchAccounts (params = {})
```

### Estrutura de Contas

O método `fetchAccounts()` retornará uma estrutura como mostrado abaixo:

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

Os tipos de conta são um dos [tipos de conta unificados](####account-balance) ou `subaccount`

## Saldo da Conta

Para consultar o saldo e obter a quantidade de fundos disponíveis para negociação ou fundos bloqueados em ordens, use o método `fetchBalance`:

```javascript
fetchBalance (params = {})
```

Parâmetros

- **params** (Dictionary) Parâmetros extras específicos para o endpoint da API da exchange (ex.: `{"currency": "usdt"}`)

Retorna

- Uma [estrutura de saldo](#balance-structure)

### Estrutura de Saldo

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

Os valores de `timestamp` e `datetime` podem ser indefinidos ou ausentes se a exchange subjacente não os fornecer.

Algumas exchanges podem não retornar informações completas de saldo. Muitas exchanges não retornam saldos para suas contas vazias ou não utilizadas. Nesse caso, algumas moedas podem estar ausentes na estrutura de saldo retornada.
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


## Ordens

```diff
- this part of the unified API is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

### Consultando Ordens

Na maioria das vezes você pode consultar ordens por um id ou por um símbolo, embora nem todas as exchanges ofereçam um conjunto completo e flexível de endpoints para consultar ordens. Algumas exchanges podem não ter um método para buscar ordens recentemente fechadas; outras podem não ter um método para obter uma ordem por id, etc. A biblioteca ccxt buscará tratar esses casos criando alternativas onde possível.

A lista de métodos para consultar ordens consiste no seguinte:

- `fetchCanceledOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`
- `fetchClosedOrder (id, symbol = undefined, params = {})`
- `fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`
- `fetchOpenOrder (id, symbol = undefined, params = {})`
- `fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`
- `fetchOrder (id, symbol = undefined, params = {})`
- `fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`

Observe que o nome desses métodos indica se o método retorna uma única ordem ou múltiplas ordens (um array/lista de ordens). O método `fetchOrder()` requer um argumento obrigatório de id de ordem (uma string). Algumas exchanges também exigem um símbolo para buscar uma ordem por id, onde ids de ordens podem se cruzar com vários pares de negociação. Além disso, observe que todos os outros métodos acima retornam um array (uma lista) de ordens. A maioria deles também exigirá um argumento de símbolo; no entanto, algumas exchanges permitem consultar sem especificar um símbolo (significando *todos os símbolos*).

A biblioteca lançará uma exceção NotSupported se um usuário chamar um método que não está disponível na exchange ou não está implementado no ccxt.

Para verificar se algum dos métodos acima está disponível, consulte a propriedade `.has` da exchange:


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


Uma estrutura típica da propriedade `.has` geralmente contém os seguintes flags correspondentes aos métodos da API de ordens para consultar ordens:

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

Os significados dos valores booleanos `true` e `false` são óbvios. Um valor de string `emulated` significa que aquele método específico está ausente na API da exchange e o ccxt irá contornar isso onde possível no lado do cliente.

#### Entendendo o Design da API de Ordens

As APIs de gerenciamento de ordens das exchanges diferem em design. O usuário deve entender o propósito de cada método específico e como eles se combinam em uma API de ordens completa:

- `fetchCanceledOrders()` - busca uma lista de ordens canceladas
- `fetchClosedOrder()` - busca uma única ordem fechada por id de ordem
- `fetchClosedOrders()` – busca uma lista de ordens fechadas (ou canceladas).
- `fetchMyTrades()` – embora não seja parte da API de ordens, está intimamente relacionado, pois fornece o histórico de negociações liquidadas.
- `fetchOpenOrder()` - busca uma única ordem aberta por id de ordem
- `fetchOpenOrders()` – busca uma lista de ordens abertas.
- `fetchOrder()` – busca uma única ordem (aberta ou fechada) pelo `id` da ordem.
- `fetchOrders()` – busca uma lista de todas as ordens (abertas ou fechadas/canceladas).
- `createOrder()` – usado para colocar ordens
- `createOrders()` – usado para colocar múltiplas ordens dentro da mesma requisição
- `cancelOrder()` – usado para cancelar uma única ordem
- `cancelOrders()` - usado para cancelar múltiplas ordens
- `cancelAllOrders()` - usado para cancelar todas as ordens
- `cancelAllOrdersAfter()` - usado para cancelar todas as ordens após o timeout fornecido

A maioria das exchanges terá uma forma de buscar ordens atualmente abertas. Assim, o `exchange.has['fetchOpenOrders']`. Se esse método não estiver disponível, então muito provavelmente o `exchange.has['fetchOrders']` fornecerá uma lista de todas as ordens. A exchange retornará uma lista de ordens abertas, seja via `fetchOpenOrders()` ou via `fetchOrders()`. Um dos dois métodos geralmente está disponível em qualquer exchange.

Algumas exchanges fornecerão o histórico de ordens, outras não. Se a exchange subjacente fornecer o histórico de ordens, então o `exchange.has['fetchClosedOrders']` ou o `exchange.has['fetchOrders']`. Se a exchange subjacente não fornecer o histórico de ordens, então `fetchClosedOrders()` e `fetchOrders()` não estarão disponíveis. Neste último caso, o usuário é obrigado a construir um cache local de ordens e rastrear as ordens abertas usando `fetchOpenOrders()` e `fetchOrder()` para os status das ordens e para marcá-las como fechadas localmente no espaço do usuário (quando não estiverem mais abertas).

Se a exchange subjacente não tiver métodos para o histórico de ordens (`fetchClosedOrders()` e `fetchOrders()`), então ela fornecerá `fetchOpenOrders` + o histórico de trades com `fetchMyTrades` (veja [Como as Ordens se Relacionam com os Trades](#how-orders-are-related-to-trades)). Esse conjunto de informações é em muitos casos suficiente para rastreamento em um robô de trading ao vivo. Se não houver histórico de ordens – você precisa rastrear suas ordens ao vivo e restaurar informações históricas a partir das ordens abertas e dos trades históricos.

Em geral, as exchanges subjacentes geralmente fornecerão um ou mais dos seguintes tipos de dados históricos:

- `fetchClosedOrders()`
- `fetchOrders()`
- `fetchMyTrades()`

Qualquer um dos três métodos acima pode estar ausente, mas as APIs das exchanges geralmente fornecerão pelo menos um dos três métodos.

Se a exchange subjacente não fornecer ordens históricas, a biblioteca CCXT não emulará a funcionalidade ausente – ela precisa ser adicionada no lado do usuário quando necessário.

**Por favor, observe que um determinado método pode estar ausente porque a exchange não tem um endpoint de API correspondente, ou porque o CCXT ainda não o implementou (a biblioteca também é um trabalho em andamento). Neste último caso, o método ausente será adicionado assim que possível.**

#### Consultando Múltiplas Ordens e Trades

Todos os métodos que retornam listas de trades e listas de ordens aceitam o segundo argumento `since` e o terceiro argumento `limit`:

- `fetchTrades()` (público)
- `fetchMyTrades()` (privado)
- `fetchOrders()`
- `fetchOpenOrders()`
- `fetchClosedOrders()`
- `fetchCanceledOrders()`

O segundo argumento `since` reduz o array por timestamp, o terceiro argumento `limit` reduz pelo número (contagem) de itens retornados.

Se o usuário não especificar `since`, os métodos `fetchTrades()/fetchOrders()` retornarão o conjunto padrão de resultados da exchange. O conjunto padrão é específico de cada exchange: algumas exchanges retornarão trades ou ordens recentes a partir da data de listagem de um par na exchange, outras exchanges retornarão um conjunto reduzido de trades ou ordens (como, últimas 24 horas, últimos 100 trades, primeiras 100 ordens, etc.). Se o usuário quiser controle preciso sobre o intervalo de tempo, o usuário é responsável por especificar o argumento `since`.

**NOTA: nem todas as exchanges fornecem meios para filtrar as listas de trades e ordens por tempo de início, portanto, o suporte para `since` e `limit` é específico de cada exchange. No entanto, a maioria das exchanges oferece pelo menos alguma alternativa para "paginação" e "rolagem" que pode ser substituída com o argumento extra `params`.**

Algumas exchanges não têm um método para buscar ordens fechadas ou todas as ordens. Elas oferecerão apenas o endpoint `fetchOpenOrders()`, e às vezes também um endpoint `fetchOrder`. Essas exchanges não têm nenhum método para buscar o histórico de ordens. Para manter o histórico de ordens nessas exchanges, o usuário precisa armazenar um dicionário ou banco de dados de ordens no espaço do usuário e atualizar as ordens no banco de dados após chamar métodos como `createOrder()`, `fetchOpenOrders()`, `cancelOrder()`, `cancelAllOrders()`.

#### Por ID de Ordem

Para obter os detalhes de uma ordem específica pelo seu id, use o método `fetchOrder()` / `fetch_order()`. Algumas exchanges também requerem um símbolo mesmo ao buscar uma ordem específica por id.

A assinatura do método fetchOrder/fetch_order é a seguinte:

```javascript
if (exchange.has['fetchOrder']) {
    //  you can use the params argument for custom overrides
    let order = await exchange.fetchOrder (id, symbol = undefined, params = {})
}
```

**Algumas exchanges não têm um endpoint para buscar uma ordem por id, o ccxt emulará isso onde for possível.** Por ora, ainda pode estar ausente aqui e ali, pois isso é um trabalho em andamento.

Você pode passar pares chave-valor personalizados substituídos no argumento de parâmetros adicionais para fornecer um tipo específico de ordem, ou alguma outra configuração, se necessário.

Abaixo estão exemplos de uso do método fetchOrder para obter informações de ordem de uma instância de exchange autenticada:

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


#### Todas as Ordens

```javascript
if (exchange.has['fetchOrders'])
    exchange.fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {})
```

**Algumas exchanges não têm um endpoint para buscar todas as ordens, o ccxt emulará isso onde for possível.** Por ora, ainda pode estar ausente aqui e ali, pois isso é um trabalho em andamento.

#### Ordens Abertas

```javascript
if (exchange.has['fetchOpenOrders'])
    exchange.fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {})
```

#### Ordens Fechadas

Não confunda *ordens fechadas* com *trades* também conhecidos como *fills* (execuções)! Uma ordem pode ser fechada (executada) com múltiplos trades opostos! Portanto, uma *ordem fechada* não é o mesmo que um *trade*. Em geral, a ordem não tem uma `fee` (taxa) de forma alguma, mas cada trade específico do usuário tem `fee`, `cost` e outras propriedades. No entanto, muitas exchanges propagam essas propriedades para as ordens também.

**Algumas exchanges não têm um endpoint para buscar ordens fechadas, o ccxt emulará isso onde for possível.** Por ora, ainda pode estar ausente aqui e ali, pois isso é um trabalho em andamento.

```javascript
if (exchange.has['fetchClosedOrders'])
    exchange.fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {})
```

### Estrutura de Ordem

A maioria dos métodos que retornam ordens dentro da API unificada do ccxt produzirá uma estrutura de ordem conforme descrito abaixo:

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

- O `status` de uma ordem geralmente é `'open'` (não executada ou parcialmente executada), `'closed'` (totalmente executada) ou `'canceled'` (não executada e cancelada, ou parcialmente executada e depois cancelada).
- Algumas exchanges permitem que o usuário especifique um timestamp de expiração ao colocar uma nova ordem. Se a ordem não for executada até esse momento, seu `status` torna-se `'expired'`.
- Use o valor `filled` para determinar se a ordem foi executada, parcialmente executada ou totalmente executada, e em quanto.
- O trabalho sobre informações de `'fee'` ainda está em andamento; as informações de taxa podem estar ausentes parcialmente ou totalmente, dependendo das capacidades da exchange.
- A moeda de `fee` pode ser diferente de ambas as moedas negociadas (por exemplo, uma ordem ETH/BTC com taxas em USD).
- O timestamp `lastTradeTimestamp` pode não ter valor e pode ser `undefined/None/null` quando não suportado pela exchange ou no caso de uma ordem aberta (uma ordem que ainda não foi executada nem parcialmente executada).
- O `lastTradeTimestamp`, se houver, designa o timestamp do último trade, no caso em que a ordem foi executada total ou parcialmente; caso contrário, `lastTradeTimestamp` é `undefined/None/null`.
- O `status` da ordem prevalece ou tem precedência sobre o `lastTradeTimestamp`.
- O `cost` de uma ordem é: `{ filled * price }`
- O `cost` de uma ordem significa o volume total em *quote* da ordem (enquanto o `amount` é o volume em *base*). O valor de `cost` deve ser o mais próximo possível do custo real mais recente conhecido da ordem. O próprio campo `cost` existe principalmente por conveniência e pode ser deduzido de outros campos.
- O campo `clientOrderId` pode ser definido ao colocar ordens pelo usuário com [parâmetros de ordem personalizados](#custom-order-params). Usando o `clientOrderId`, o usuário pode posteriormente distinguir entre as próprias ordens. Isso está disponível apenas para as exchanges que suportam `clientOrderId` no momento.

#### timeInForce

O campo `timeInForce` pode ser `undefined/None/null` se não especificado pela exchange. A unificação de `timeInForce` é um trabalho em andamento.

Valores possíveis para o campo `timeInForce`:

- `'GTC'` = _Good Till Cancel(ed)_ (Válido Até Cancelar), a ordem permanece no livro de ordens até ser correspondida ou cancelada.
- `'IOC'` = _Immediate Or Cancel_ (Imediato Ou Cancelar), a ordem deve ser correspondida imediatamente e executada parcial ou completamente; o restante não executado é cancelado (ou a ordem inteira é cancelada).
- `'FOK'` = _Fill Or Kill_ (Executar Ou Matar), a ordem deve ser totalmente executada e fechada imediatamente; caso contrário, a ordem inteira é cancelada.
- `'PO'` = _Post Only_ (Apenas Postar), a ordem é colocada como uma ordem maker, ou é cancelada. Isso significa que a ordem deve ser colocada no livro de ordens por pelo menos algum tempo em estado não executado. A unificação de `PO` como uma opção de `timeInForce` é um trabalho em andamento com exchanges unificadas tendo `exchange.has['createPostOnlyOrder'] == True`.

### Colocando Ordens

Existem diferentes tipos de ordens que um usuário pode enviar para a exchange; ordens regulares eventualmente chegam ao livro de ordens de um símbolo correspondente, outras ordens podem ser mais avançadas. Aqui está uma lista descrevendo vários tipos de ordens:

- [Ordens Limitadas](#limit-orders) – ordens regulares com um `amount` em moeda base (quanto você quer comprar ou vender) e um `price` em moeda quote (por qual preço você quer comprar ou vender).
- [Ordens de Mercado](#market-orders) – ordens regulares com um `amount` em moeda base (quanto você quer comprar ou vender)
  - [Compras a Mercado](#market-buys) – algumas exchanges requerem ordens de compra a mercado com um `amount` em moeda quote (quanto você quer gastar para comprar)
- [Ordens de Gatilho](#conditional-orders) também conhecidas como *ordens condicionais* – um tipo avançado de ordem usado para aguardar uma determinada condição no mercado e então reagir automaticamente: quando um `triggerPrice` é atingido, a ordem de gatilho é disparada e então uma ordem regular de `price` limitado ou de preço de mercado é colocada, resultando eventualmente na entrada ou saída de uma posição
- [Ordens Stop Loss](#stop-loss-orders) – quase iguais às ordens de gatilho, mas usadas para fechar uma posição e interromper perdas adicionais nessa posição: quando o preço atinge `triggerPrice`, a ordem stop loss é disparada, resultando na colocação de outra ordem regular limitada ou de mercado para fechar uma posição a um `price` limite específico ou ao preço de mercado (uma posição com uma ordem stop loss anexada a ela).
- [Ordens Take Profit](#take-profit-orders) – uma contrapartida às ordens stop loss, esse tipo de ordem é usado para fechar uma posição e capturar os lucros existentes nessa posição: quando o preço atinge `triggerPrice`, a ordem take profit é disparada, resultando na colocação de outra ordem regular limitada ou de mercado para fechar uma posição a um `price` limite específico ou ao preço de mercado (uma posição com uma ordem take profit anexada a ela).
- [Ordens StopLoss e TakeProfit Anexadas a uma Posição](#stoploss-and-takeprofit-orders-attached-to-a-position) – ordens avançadas, consistindo em três ordens dos tipos listados acima: uma ordem regular limitada ou de mercado colocada para entrar em uma posição com ordens stop loss e/ou take profit que serão colocadas ao abrir essa posição e serão usadas para fechar essa posição mais tarde (quando um stop loss é atingido, ele fechará a posição e cancelará sua contrapartida take profit, e vice-versa, quando um take profit é atingido, ele fechará a posição e cancelará sua contrapartida stop loss; essas duas contrapartidas também são conhecidas como "ordens OCO – uma cancela a outra"), além do `amount` (e `price` para a ordem limitada) para abrir uma posição, também será necessário um `triggerPrice` para uma ordem stop loss (com um `price` limite se for uma ordem stop loss limitada) e/ou um `triggerPrice` para uma ordem take profit (com um `price` limite se for uma ordem take profit limitada).
- [Ordens de Trailing](#trailing-orders) – uma ordem ajustada automaticamente em relação a uma posição aberta; `trailingAmount` pode ser definido para seguir um valor quote especificado atrás da posição aberta, ou `trailingPercent` pode ser definido para seguir um percentual especificado atrás da posição aberta; quando o preço de mercado da posição é igual à ordem de trailing, isso resulta na entrada em uma nova posição ou na saída de uma posição, dependendo se a ordem de trailing tem o parâmetro `reduceOnly` definido como verdadeiro ou não.

Colocar uma ordem sempre requer um `symbol` que o utilizador deve especificar (qual mercado pretende negociar).

Para colocar uma ordem utilize o método `createOrder`. Pode usar o `id` da [estrutura de ordem](#order-structure) unificada retornada para consultar o estado da ordem mais tarde. Se precisar de colocar múltiplas ordens simultaneamente, pode verificar a disponibilidade do método `createOrders`.

```javascript
createOrder (symbol, type, side, amount, price = undefined, params = {})
```

```javascript
createOrders (orders, params = {}) // orders is a list in which each element contains a symbol, type, side, amount, price and params
```

Parâmetros

- **symbol** (String) *obrigatório* Símbolo de mercado CCXT unificado
  - Certifique-se de que o símbolo em questão existe na exchange alvo e está disponível para negociação.
- **side** *obrigatório* um literal de string para a direção da sua ordem.
  **Lados unificados:**
  - `buy` fornece moeda de cotação e recebe moeda base; por exemplo, comprar `BTC/USD` significa que receberá bitcoins pelos seus dólares.
  - `sell` fornece moeda base e recebe moeda de cotação; por exemplo, vender `BTC/USD` significa que receberá dólares pelos seus bitcoins.
- **type** um tipo de ordem em literal de string
  **Tipos unificados:**
  - [market](#market-orders) não permitido por algumas exchanges, consulte [a documentação delas](#exchanges) para detalhes
  - [limit](#limit-orders)
  - consulte #custom-order-params e #other-order-types para tipos não unificados
- **amount**, quanto da moeda pretende negociar habitualmente, mas nem sempre, em unidades da moeda base do par de negociação (as unidades em algumas exchanges dependem do lado da ordem: consulte a documentação da API delas para detalhes.)
- **price** o preço ao qual a ordem deve ser executada em unidades da moeda de cotação (ignorado em ordens de mercado)
- **params** (Dictionary) Parâmetros extra específicos do endpoint da API da exchange (ex.: `{"settle": "usdt"}`)

Retorna

- Uma chamada de ordem bem-sucedida retorna uma [estrutura de ordem](#order-structure)

**Notas sobre createOrder**

- Algumas exchanges permitem negociar apenas com ordens limite.

Alguns campos da estrutura de ordem retornada podem ser `undefined / None / null` se essa informação não for retornada pela resposta da API da exchange. O utilizador tem a garantia de que o método `createOrder` retornará uma [estrutura de ordem](#order-structure) unificada que conterá pelo menos o `id` da ordem e o `info` (uma resposta bruta da exchange "tal como está"):

```javascript
{
    'id': 'string',  // order id
    'info': { ... }, // decoded original JSON response from the exchange as is
}
```

##### Erros comuns

- Existe um erro comum que ocorre ao criar ordens para mercados de contratos:

```
"must be greater than minimum amount precision of 1"
```

Este erro ocorre quando a exchange espera um número natural de contratos (1, 2, 3, etc.) no argumento `amount` de `createOrder`. A [estrutura de mercado](#market-structure) tem uma chave chamada `contractSize`. Cada contrato vale uma determinada quantidade do ativo base determinada pelo `contractSize`. O número de contratos multiplicado pelo `contractSize` é igual à quantidade base. `Quantidade base = (contratos * contractSize)`, portanto para derivar o número de contratos que deve introduzir no argumento `amount` pode resolver para contratos: `contratos = (Quantidade base / contractSize)`.

Aqui está um exemplo de como encontrar o `contractSize`:
```python
await exchange.loadMarkets()
symbol = 'BTC/USDT:USDT'
market = exchange.market(symbol)
print(market['contractSize'])

# Let's say you want to convert 0.5 BTC to the number of contracts:
number_contracts = round((0.5 * 1) / market['contractSize'])
```

#### Ordens Limite

As ordens limite são colocadas no livro de ordens da exchange a um preço especificado pelo trader. São executadas (fechadas) quando não existem ordens no mesmo mercado a um preço melhor, e outro trader cria uma [ordem de mercado](#market-orders) ou uma ordem oposta a um preço que corresponde ou supera o preço da ordem limite.

As ordens limite podem não ser totalmente preenchidas. Isto acontece quando a ordem de preenchimento é por um montante inferior ao montante especificado pela ordem limite.

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

#### Ordens de Mercado

*também conhecidas como*

- ordens a preço de mercado
- ordens a preço spot
- ordens instantâneas

As ordens de mercado são executadas imediatamente preenchendo uma ou mais ordens já existentes do lado da oferta do livro de ordens da exchange. As ordens que a sua ordem de mercado preenche são escolhidas do topo da pilha do livro de ordens, o que significa que a sua ordem de mercado é preenchida ao melhor preço disponível. Ao colocar uma ordem de mercado não precisa de especificar o preço da ordem, e se o preço for especificado, será ignorado.

Não tem garantia de que a ordem será executada ao preço que observa antes de colocar a sua ordem. Existem múltiplas razões para isto, incluindo:

- **derrapagem de preço** uma ligeira alteração do preço do mercado negociado enquanto a sua ordem está a ser executada. As razões para a derrapagem de preço incluem, mas não se limitam a

    - latência de ida e volta da rede
    - elevada carga na exchange
    - volatilidade de preço

- **tamanhos de ordem inequívocos** se uma ordem de mercado for por um montante superior ao tamanho da ordem do topo do livro de ordens, então após o preenchimento da ordem do topo, a ordem de mercado prosseguirá para preencher a ordem seguinte no livro de ordens, o que significa que a ordem de mercado é preenchida a múltiplos preços

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

**Note que algumas exchanges não aceitarão ordens de mercado (permitem apenas ordens limite).** Para detetar programaticamente se a exchange em questão suporta ou não ordens de mercado, pode utilizar a propriedade `.has['createMarketOrder']` da exchange:

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


#### Compras a Mercado

Em geral, ao colocar uma ordem de `market buy` ou `market sell`, o utilizador apenas tem de especificar a quantidade da moeda base a comprar ou vender. No entanto, em algumas exchanges as ordens de compra a mercado implementam uma abordagem diferente para calcular o valor da ordem.

Suponha que está a negociar BTC/USD e o preço de mercado atual do BTC é superior a 9000 USD. Para uma compra ou venda a mercado poderia especificar um `amount` de 2 BTC, o que resultaria em _mais ou menos_ 18000 USD (mais ou menos ;)) na sua conta, dependendo do lado da ordem.

**Em compras a mercado, algumas exchanges requerem o custo total da ordem na moeda de cotação!** A lógica por trás disso é simples: em vez de tomar a quantidade de moeda base para comprar ou vender, algumas exchanges operam com _"quanto da moeda de cotação quer gastar na compra no total"_.

Para colocar uma ordem de compra a mercado nessas exchanges, não especificaria um montante de 2 BTC; em vez disso, deveria especificar de alguma forma o custo total da ordem, ou seja, 18000 USD neste exemplo. As exchanges que tratam as ordens de `market buy` desta forma têm uma opção específica da exchange `createMarketBuyOrderRequiresPrice` que permite especificar o custo total de uma ordem de `market buy` de duas formas.

A primeira é a predefinição e se especificar o `price` juntamente com o `amount`, o custo total da ordem será calculado dentro da biblioteca a partir desses dois valores com uma multiplicação simples (`cost = amount * price`). O `cost` resultante seria o montante em moeda de cotação USD que será gasto nesta ordem de compra a mercado específica.

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

A segunda alternativa é útil nos casos em que o utilizador pretende calcular e especificar ele próprio o custo total resultante da ordem. Isso pode ser feito definindo a opção `createMarketBuyOrderRequiresPrice` como `false` para a desativar:

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

Mais informações:

- https://github.com/ccxt/ccxt/issues/564#issuecomment-347458566
- https://github.com/ccxt/ccxt/issues/4914#issuecomment-478199357
- https://github.com/ccxt/ccxt/issues/4799#issuecomment-470966769
- https://github.com/ccxt/ccxt/issues/5197#issuecomment-496270785

#### Emular Ordens de Mercado com Ordens Limite

Também é possível emular uma ordem de `market` com uma ordem de `limit`.

**AVISO: este método pode ser arriscado devido à elevada volatilidade, use-o por sua conta e risco e apenas quando souber muito bem o que está a fazer!**

Na maioria das vezes, uma `market sell` pode ser emulada com uma `limit sell` a um preço muito baixo — a exchange automaticamente transformará numa ordem taker ao preço de mercado (o preço que é atualmente mais favorável para si dentre os disponíveis no livro de ordens). Quando a exchange detetar que está a vender a um preço muito baixo, oferecerá automaticamente o melhor preço de comprador disponível no livro de ordens. Isso é efetivamente o mesmo que colocar uma ordem de venda a mercado. Assim, as ordens de mercado podem ser emuladas com ordens limite (onde estiverem em falta).

O oposto também é verdade — uma `market buy` pode ser emulada com uma `limit buy` a um preço muito elevado. A maioria das exchanges fechará novamente a sua ordem ao melhor preço disponível, ou seja, o preço de mercado.

No entanto, nunca deve depender disso inteiramente, **teste SEMPRE com um pequeno montante primeiro!** Pode experimentar isso na interface web delas primeiro para verificar a lógica. Pode vender o montante mínimo a um preço limite especificado (um montante que possa perder, só por precaução) e depois verificar o preço real de preenchimento no histórico de negociações.

#### Ordens Limite

As ordens a preço limite também são conhecidas como *ordens limite*. Algumas exchanges aceitam apenas ordens limite. As ordens limite requerem que seja submetido um preço (taxa por unidade) com a ordem. A exchange fechará as ordens limite se e somente se o preço de mercado atingir o nível desejado.

```javascript
// camelCaseStyle
exchange.createLimitBuyOrder (symbol, amount, price[, params])
exchange.createLimitSellOrder (symbol, amount, price[, params])

// underscore_style
exchange.create_limit_buy_order (symbol, amount, price[, params])
exchange.create_limit_sell_order (symbol, amount, price[, params])
```


#### Ordens Condicionais

Vindo da negociação tradicional, o termo "ordem Stop" tem sido um pouco ambíguo, por isso, em vez disso, no CCXT utilizamos o termo ordem "Trigger". Quando o preço do símbolo atinge o seu preço de "trigger" ("stop"), a ordem é ativada como ordem de `market` ou `limit`, dependendo de qual tiver escolhido.

Temos diferentes classificações de ordens trigger:
1) [Ordem Trigger](#trigger-order) independente para comprar/vender uma moeda (abrir/fechar posição)
2) [Stop Loss](#stop-loss-orders) ou [Take Profit](#take-profit-orders) independente projetado para fechar posições abertas.
3) Uma ordem de Stop Loss ou Take Profit anexada a uma ordem primária ([Ordem Trigger Condicional](#stoploss-and-takeprofit-orders-attached-to-a-position)).


##### Ordem Trigger

A ordem "stop" tradicional (que pode ver nos websites das exchanges) é agora chamada de ordem "trigger" na biblioteca CCXT. Implementada adicionando um parâmetro `triggerPrice`. São ordens trigger básicas independentes que podem abrir ou fechar uma posição.

* Para garantir que a exchange suporta esta funcionalidade, verifique `exchange.features` ou utilize o método auxiliar `exchange.featureValue('BTC/USDT', 'createOrder', 'triggerPrice')`.
* Tipicamente, é ativada quando o preço do ativo/contrato subjacente cruza o `triggerPrice` em **qualquer direção**. No entanto, a API de algumas exchanges requer também a definição de `triggerDirection`, que aciona a ordem dependendo de se o preço está acima ou abaixo do `triggerPrice`. Por exemplo, se quiser acionar uma ordem limite (comprar 0,1 `ETH` ao preço limite `1500`) quando o preço do par cruzar `1700`:


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


Tipicamente, a exchange determina automaticamente a direção do `triggerPrice` (se está "acima" ou "abaixo" do preço atual), no entanto, algumas exchanges requerem que forneça `triggerDirection` com os valores `ascending` ou `descending`:

```
params = {
    'triggerPrice': 1700,
    'triggerDirection': 'ascending', // order will be triggered when price goes upward and touches 1700
}
```

Note que também pode adicionar o parâmetro `reduceOnly: true` à ordem trigger (com um possível parâmetro `triggerDirection: 'ascending/descending'`), para que atue como ordem de "stop-loss" ou "take-profit". No entanto, para algumas exchanges suportamos tipos de ordem trigger de "stop-loss" e "take-profit", que automaticamente envolvem o tratamento de `reduceOnly` e `triggerDirection` (consulte-os abaixo).

##### Ordens Stop Loss

O mesmo que as Ordens de Gatilho, mas a direção importa. Implementado especificando um parâmetro `stopLossPrice` (para o triggerPrice de stop loss), e também implementa automaticamente `triggerDirection` em nome do usuário, portanto, em vez de uma Ordem de Gatilho regular, você pode usar esta como alternativa.

* Para garantir que a exchange suporte essa funcionalidade, verifique `exchange.features` ou use o método auxiliar `exchange.featureValue('BTC/USDT', 'createOrder', 'stopLossPrice')`.

Suponha que você abriu uma posição comprada (comprou) a 1000 e deseja se proteger de perdas de uma possível queda de preço abaixo de 700. Você colocaria uma ordem de stop loss com triggerPrice em 700. Para essa ordem de stop loss, você especificaria um preço limite ou ela seria executada ao preço de mercado.

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

Suponha que você abriu uma posição vendida (vendeu) a 700 e deseja se proteger de perdas de uma possível alta de preço acima de 1300. Você colocaria uma ordem de stop loss com triggerPrice em 1300. Para essa ordem de stop loss, você especificaria um preço limite ou ela seria executada ao preço de mercado.

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

Ordens de Stop Loss são ativadas quando o preço do ativo/contrato subjacente:

* cai abaixo do `stopLossPrice` vindo de cima, para ordens de venda. (ex: para fechar uma posição comprada e evitar perdas adicionais)
* sobe acima do `stopLossPrice` vindo de baixo, para ordens de compra (ex: para fechar uma posição vendida e evitar perdas adicionais)


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


##### Ordens de Take Profit

O mesmo que as Ordens de Stop Loss, mas a direção importa. Implementado especificando um parâmetro `takeProfitPrice` (para o triggerPrice de take profit).

Suponha que você abriu uma posição comprada (comprou) a 1000 e deseja obter seus lucros de uma possível alta de preço acima de 1300. Você colocaria uma ordem de take profit com triggerPrice em 1300. Para essa ordem de take profit, você especificaria um preço limite ou ela seria executada ao preço de mercado.

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

Suponha que você abriu uma posição vendida (vendeu) a 700 e deseja obter seus lucros de uma possível queda de preço abaixo de 600. Você colocaria uma ordem de take profit com triggerPrice em 600. Para essa ordem de take profit, você especificaria um preço limite ou ela seria executada ao preço de mercado.

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

Ordens de Take Profit são ativadas quando o preço do subjacente:

* sobe acima do `takeProfitPrice` vindo de baixo, para ordens de venda (ex: para fechar uma posição comprada com lucro)
* cai abaixo do `takeProfitPrice` vindo de cima, para ordens de compra (ex: para fechar uma posição vendida com lucro)


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


#### Ordens de StopLoss e TakeProfit Vinculadas a uma Posição

Ordens de **Take Profit** / **Stop Loss** que estão vinculadas a uma ordem primária de abertura de posição. Implementado fornecendo parâmetros de dicionário para `stopLoss` e `takeProfit` descrevendo cada um respectivamente.

* Por padrão, os valores das ordens de stopLoss e takeProfit serão os mesmos que os da ordem primária, mas na direção oposta.
* Ordens de gatilho vinculadas são condicionais à execução da ordem primária.
* Não é suportado por todas as exchanges. Para verificar se stop-loss é suportado, use esta abordagem:
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


Para exchanges onde não é possível usar SL e TP vinculados, após enviar uma ordem de entrada, você pode enviar imediatamente outra ordem (mesmo que a posição ainda não esteja aberta) com `stopLossPrice/takeProfitPrice` em `params`, (ou `triggerPrice` e `reduceOnly: true`), para que ainda possa atuar como uma ordem de stop loss para sua posição futura (observe que essa abordagem pode não funcionar em algumas exchanges).

Exemplo:

```
    symbol = 'ADA/USDT:USDT'
    main_order = await binance.create_order(symbol, 'market', 'buy', 50) # open position
    tp_order = await binance.create_order(symbol, 'limit', 'sell', 50, 1.5, {"takeProfitPrice": 1.6}) # take profit order
    sl_order = await binance.create_order(symbol, 'limit', 'sell', 50, 0.24, {"stopLossPrice": 0.25}) # stop loss order
```

#### Ordens de Trailing

Ordens de **Trailing** acompanham uma posição aberta. Implementado fornecendo parâmetros float para `trailingPercent` ou `trailingAmount`.

* Uma ordem de trailing ajusta continuamente o preço da ordem a uma porcentagem fixa ou a um valor fixo em moeda cotada de distância do preço de mercado atual.
* Uma ordem de trailing acompanha uma posição à medida que ela se move em uma direção, mas não na direção oposta.
* Se o valor da posição subir, a ordem de trailing muda, mas se o valor da posição cair, a ordem de trailing permanece a mesma até que a ordem seja executada.
* Uma ordem de trailing pode ser colocada independentemente após a abertura de uma posição.
* Implementado preenchendo o parâmetro `trailingPercent` ou `trailingAmount` dependendo da exchange.
* O argumento de preço pode ser usado como `trailingTriggerPrice`, e o argumento de tipo pode ser usado para diferenciar entre ordens de trailing limite e de mercado, se necessário.

*Não suportado por todas as exchanges.*

*Nota: Isso ainda está em processo de unificação e é um trabalho em andamento*


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


#### Parâmetros de Ordem Personalizados

Algumas exchanges permitem que você especifique parâmetros opcionais para sua ordem. Você pode passar seus parâmetros opcionais e substituir sua consulta com um array associativo usando o argumento `params` em sua chamada de API unificada. Todos os parâmetros personalizados são específicos de cada exchange, é claro, e não são intercambiáveis; não espere que parâmetros personalizados de uma exchange funcionem com outra.


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


##### `clientOrderId` definido pelo usuário

```text
- this part of the unified API is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

O usuário pode especificar um campo `clientOrderId` personalizado que pode ser definido ao colocar ordens com os `params`. Usando o `clientOrderId`, é possível posteriormente distinguir entre as próprias ordens. Isso só está disponível para as exchanges que suportam `clientOrderId` no momento. Para as exchanges que não suportam, ou lançarão um erro ao fornecer o `clientOrderId`, ou o ignorarão definindo o `clientOrderId` como `undefined/None/null`.


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


##### Modo hedge para ordem

Se a exchange suporta o [recurso](#features) para ordens `hedged`, o usuário pode passar `params['hedged'] = true` em `createOrder` para abrir uma posição `hedged` em vez da ordem padrão no modo `one-way`. No entanto, se a exchange suporta `.has['setPositionMode']`, então essas exchanges podem não suportar o parâmetro `hedged` diretamente pelo `createOrder`; em vez disso, nessas exchanges, é necessário primeiro alterar o modo da conta usando [setPositionMode()](#set-position-mode) e depois executar `createOrder` (sem o parâmetro `hedged`), e ele colocará a ordem hedged por padrão.


### Editando Ordens

Para editar uma ordem, você pode usar o método `editOrder`

```javascript
editOrder (id, symbol, type, side, amount, price = undefined, params = {})
```

Parâmetros

- **id** (String) *obrigatório* Id da ordem (ex: `1645807945000`)
- **symbol** (String) *obrigatório* Símbolo de mercado unificado CCXT
- **side** (String) *obrigatório* a direção da sua ordem.
  **Lados unificados:**
  - `buy` fornece moeda de cotação e recebe moeda base; por exemplo, comprar `BTC/USD` significa que você receberá bitcoins pelos seus dólares.
  - `sell` fornece moeda base e recebe moeda de cotação; por exemplo, vender `BTC/USD` significa que você receberá dólares pelos seus bitcoins.
- **type** (String) *obrigatório* tipo de ordem
  **Tipos unificados:**
  - [`market`](#market-orders) não permitido por algumas exchanges, veja [a documentação delas](#exchanges) para detalhes
  - [`limit`](#limit-orders)
  - veja #custom-order-params e #other-order-types para tipos não unificados
- **amount** (Number) *obrigatório* quanto da moeda você deseja negociar, geralmente, mas nem sempre, em unidades da moeda base do par de negociação (as unidades para algumas exchanges dependem do lado da ordem: veja a documentação da API delas para detalhes.)
- **price** (Float) o preço pelo qual a ordem deve ser cumprida em unidades da moeda de cotação (ignorado em ordens de mercado)
- **params** (Dictionary) Parâmetros extras específicos do endpoint da API da exchange (ex: `{"settle": "usdt"}`)

Retorna

- Uma [estrutura de ordem](#order-structure)

### Cancelando Ordens

Para cancelar uma ordem existente use

- `cancelOrder ()` para uma única ordem
- `cancelOrders ()` para múltiplas ordens
- `cancelAllOrders ()` para todas as ordens abertas
- `cancelAllOrdersAfter ()` para todas as ordens abertas após o tempo limite fornecido

```javascript
cancelOrder (id, symbol = undefined, params = {})
```

Parâmetros

- **id** (String) *obrigatório* Id da ordem (ex: `1645807945000`)
- **symbol** (String) Símbolo de mercado unificado CCXT **obrigatório** em algumas exchanges (ex: `"BTC/USDT"`)
- **params** (Dictionary) Parâmetros extras específicos do endpoint da API da exchange (ex: `{"settle": "usdt"}`)

Retorna

- Uma [estrutura de ordem](#order-structure)

```javascript
cancelOrders (ids, symbol = undefined, params = {})
```

Parâmetros

- **ids** (\[String\]) *obrigatório* Ids de ordens (ex: `1645807945000`)
- **symbol** (String) Símbolo de mercado unificado CCXT **obrigatório** em algumas exchanges (ex: `"BTC/USDT"`)
- **params** (Dictionary) Parâmetros extras específicos do endpoint da API da exchange (ex: `{"settle": "usdt"}`)

Retorna

- Um array de [estruturas de ordem](#order-structure)

```javascript
async cancelAllOrders (symbol = undefined, params = {})
```

Parâmetros

- **symbol** (String) Símbolo de mercado unificado CCXT **obrigatório** em algumas exchanges (ex: `"BTC/USDT"`)
- **params** (Dictionary) Parâmetros extras específicos do endpoint da API da exchange (ex: `{"settle": "usdt"}`)

Retorna

- Um array de [estruturas de ordem](#order-structure)

```javascript
async cancelAllOrdersAfter (timeout, params = {})
```

Parâmetros

- **timeout** (number) tempo de contagem regressiva em milissegundos **obrigatório** em algumas exchanges, 0 representa cancelar o temporizador (ex: ``10``\ )
- **params** (Dictionary) Parâmetros extras específicos do endpoint da API da exchange (ex: ``{"type": "spot"}``\ )

Retorna

- Um objeto

#### Exceções ao Cancelar Ordens

O `cancelOrder()` é geralmente usado apenas em ordens abertas. No entanto, pode acontecer que sua ordem seja executada (preenchida e fechada)
antes que sua solicitação de cancelamento chegue, portanto, uma solicitação de cancelamento pode atingir uma ordem já fechada.

Uma solicitação de cancelamento também pode lançar um `OperationFailed` indicando que a ordem pode ou não ter sido cancelada com sucesso e se você precisa tentar novamente ou não. Chamadas consecutivas a `cancelOrder()` também podem atingir uma ordem já cancelada.

Sendo assim, `cancelOrder()` pode lançar uma exceção `OrderNotFound` nestes casos:
- cancelar uma ordem já fechada
- cancelar uma ordem já cancelada

## Minhas Negociações

```text
- this part of the unified API is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

### Como as Ordens se Relacionam com as Negociações

Uma negociação também é frequentemente chamada de `a fill` (preenchimento). Cada negociação é resultado da execução de uma ordem. Observe que ordens e negociações têm um relacionamento um-para-muitos: a execução de uma ordem pode resultar em várias negociações. No entanto, quando uma ordem combina com outra ordem oposta, o par de duas ordens correspondentes gera uma negociação. Assim, quando uma ordem combina com múltiplas ordens opostas, isso gera múltiplas negociações, uma negociação por cada par de ordens correspondentes.

Em resumo, uma ordem pode conter *uma ou mais* negociações. Ou, em outras palavras, uma ordem pode ser *preenchida* com uma ou mais negociações.

Por exemplo, um livro de ordens pode ter as seguintes ordens (qualquer que seja o símbolo ou par de negociação):

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

Todos os números específicos acima não são reais; isso é apenas para ilustrar a maneira como ordens e negociações se relacionam em geral.

Um vendedor decide colocar uma ordem limite de venda no lado de oferta por um preço de 0,700 e um valor de 150.

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

Como o preço e o valor da ordem de venda (oferta) recebida cobrem mais de uma ordem de compra (ordens `b` e `i`), a seguinte sequência de eventos geralmente ocorre dentro do mecanismo da exchange muito rapidamente, mas não instantaneamente:

1. A ordem `b` é combinada com a venda recebida porque seus preços se cruzam. Seus volumes se *"aniquilam mutuamente"*, de modo que o comprador recebe 100 por um preço de 0,800. O vendedor (ofertante) terá sua ordem de venda parcialmente preenchida pelo volume de compra de 100 a um preço de 0,800. Observe que para a parte preenchida da ordem, o vendedor obtém um preço melhor do que o pedido inicialmente. Ele pediu pelo menos 0,7, mas obteve 0,8, o que é ainda melhor para o vendedor. A maioria das exchanges convencionais preenche ordens pelo melhor preço disponível.

2. Uma negociação é gerada para a ordem `b` contra a ordem de venda recebida. Essa negociação *"preenche"* completamente a ordem `b` e a maior parte da ordem de venda. Uma negociação é gerada por cada par de ordens correspondentes, independentemente de o valor ter sido preenchido total ou parcialmente. Neste exemplo, o valor do vendedor (100) preenche a ordem `b` completamente (fecha a ordem `b`) e também preenche parcialmente a ordem de venda (deixando-a aberta no livro de ordens).

3. A ordem `b` agora tem um status `closed` e um volume preenchido de 100. Ela contém uma negociação contra a ordem de venda. A ordem de venda tem um status `open` e um volume preenchido de 100. Ela contém uma negociação contra a ordem `b`. Assim, cada ordem tem apenas uma negociação de preenchimento até agora.

4. A ordem de venda recebida tem um valor preenchido de 100 e ainda precisa preencher o valor restante de 50 do seu valor inicial total de 150.

O estado intermediário do livro de ordens é agora (a ordem `b` está `closed` e não está mais no livro de ordens):

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

5. A ordem `i` é correspondida contra a parte restante da venda recebida, porque seus preços se intersectam. O valor da ordem de compra `i`, que é 200, aniquila completamente o valor restante de venda de 50. A ordem `i` é preenchida parcialmente em 50, mas o restante do seu volume, ou seja, o valor restante de 150, permanecerá no livro de ordens. A ordem de venda, no entanto, é cumprida completamente por esta segunda correspondência.

6. Uma negociação é gerada para a ordem `i` contra a ordem de venda recebida. Essa negociação preenche parcialmente a ordem `i` e completa o preenchimento da ordem de venda. Novamente, esta é apenas uma negociação para um par de ordens correspondentes.

7. A ordem `i` agora tem um status `open`, um valor preenchido de 50 e um valor restante de 150. Ela contém uma negociação de preenchimento contra a ordem de venda. A ordem de venda agora tem um status `closed` e preencheu completamente o seu valor inicial total de 150. No entanto, ela contém duas negociações, a primeira contra a ordem `b` e a segunda contra a ordem `i`. Assim, cada ordem pode ter uma ou mais negociações de preenchimento, dependendo de como seus volumes foram correspondidos pelo mecanismo da exchange.

Após a sequência acima ocorrer, o livro de ordens atualizado terá a seguinte aparência.

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

Observe que a ordem `b` desapareceu, e a ordem de venda também não está mais lá. Todas as ordens fechadas e totalmente preenchidas desaparecem do livro de ordens. A ordem `i`, que foi preenchida parcialmente e ainda tem um volume restante e um status `open`, ainda está presente.

### Negociações Pessoais

A maioria dos métodos unificados retornará um único objeto ou um array simples (uma lista) de objetos (negociações). No entanto, muito poucas exchanges (se alguma) retornarão todas as negociações de uma vez. Na maioria das vezes, suas APIs `limit` a saída a um certo número dos objetos mais recentes. **NÃO É POSSÍVEL OBTER TODOS OS OBJETOS DESDE O INÍCIO DOS TEMPOS ATÉ O MOMENTO PRESENTE EM UMA ÚNICA CHAMADA**. Na prática, muito poucas exchanges tolerarão ou permitirão isso.

Assim como todos os outros métodos unificados para buscar dados históricos, o método `fetchMyTrades` aceita um argumento `since` para [paginação baseada em data](#date-based-pagination). Assim como todos os outros métodos unificados em toda a biblioteca CCXT, o argumento `since` para `fetchMyTrades` deve ser um **timestamp inteiro em milissegundos**.

Para buscar negociações históricas, o usuário precisará percorrer os dados em porções ou "páginas" de objetos. A paginação frequentemente implica *"buscar porções de dados uma a uma"* em um loop.

Em muitos casos, um argumento `symbol` é exigido pelas APIs das exchanges, portanto, você precisa percorrer todos os símbolos para obter todas as suas negociações. Se o `symbol` estiver ausente e a exchange exigir, o CCXT lançará uma exceção `ArgumentsRequired` para sinalizar o requisito ao usuário. Em seguida, o `symbol` deverá ser especificado. Uma das abordagens é filtrar os símbolos relevantes da lista de todos os símbolos verificando saldos não nulos, bem como transações (saques e depósitos). Além disso, as exchanges terão um limite de quanto tempo atrás você pode ir.

Na maioria dos casos, os usuários são **obrigados a usar pelo menos algum tipo de [paginação](#pagination)** para obter os resultados esperados de forma consistente.


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


Retorna um array ordenado `[]` de negociações (negociação mais recente por último).

#### Estrutura de Negociação

As negociações denotam a troca de uma moeda por outra, ao contrário das [transações](#transaction-structure), que denotam uma transferência de uma determinada moeda.

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

- O trabalho nas informações de `'fee'` e `'fees'` ainda está em andamento; as informações de taxa podem estar ausentes parcial ou totalmente, dependendo das capacidades da exchange.
- A moeda de `fee` pode ser diferente de ambas as moedas negociadas (por exemplo, uma ordem ETH/BTC com taxas em USD).
- O `cost` da negociação significa `amount * price`. É o volume total em *cotação* da negociação (enquanto `amount` é o volume em *base*). O campo de custo em si existe principalmente por conveniência e pode ser deduzido de outros campos.
- O `cost` da negociação é um valor _"bruto"_. Ou seja, o valor antes da taxa, e a taxa deve ser aplicada posteriormente.

### Negociações por Id de Ordem

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


## Razão

A razão é simplesmente o histórico de alterações, ações realizadas pelo usuário ou operações que alteraram o saldo do usuário de qualquer forma, ou seja, o histórico de movimentações de todos os fundos de/para todas as contas do usuário, o que inclui

- depósitos e saques (financiamento)
- valores recebidos e enviados como resultado de uma negociação ou ordem
- taxas de negociação
- transferências entre contas
- reembolsos, cashbacks e outros tipos de eventos sujeitos a contabilidade.

Os dados sobre entradas na razão podem ser recuperados usando

- `fetchLedgerEntry ()` para uma entrada na razão
- `fetchLedger ( code )` para múltiplas entradas na razão da mesma moeda
- `fetchLedger ()` para todas as entradas na razão

```javascript
fetchLedgerEntry (id, code = undefined, params = {})
```

Parâmetros

- **id** (String) *obrigatório* Id da entrada na razão
- **code** (String) Código de moeda unificado CCXT, obrigatório (ex.: `"USDT"`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"type": "deposit"}`)

Retorna

- Uma [estrutura de entrada na razão](#ledger-entry-structure)

```javascript
async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {})
```

Parâmetros

- **code** (String) Código de moeda unificado CCXT; *obrigatório* se a busca de todas as entradas na razão para todos os ativos de uma vez não for suportada (ex.: `"USDT"`)
- **since** (Integer) Timestamp (ms) do momento mais antigo para recuperar saques (ex.: `1646940314000`)
- **limit** (Integer) O número de [estruturas de entrada na razão](#ledger-entry-structure) a recuperar (ex.: `5`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)

Retorna

- Um array de [estruturas de entrada na razão](#ledger-entry-structure)

### Estrutura de Entrada na Razão

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

#### Notas Sobre a Estrutura de Entrada na Razão

O tipo da entrada na razão é o tipo da operação associada a ela. Se o valor chegar devido a uma ordem de venda, então estará associado a uma entrada na razão do tipo negociação correspondente, e o referenceId conterá o id da negociação associada (se a exchange em questão o fornecer). Se o valor sair devido a um saque, então estará associado a uma transação correspondente.

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

O campo `referenceId` contém o id do evento correspondente que foi registrado ao adicionar um novo item à razão.

O campo `status` existe para suportar exchanges que incluem alterações pendentes e canceladas na razão. A razão naturalmente representa as alterações reais que ocorreram; portanto, o status é `'ok'` na maioria dos casos.

O tipo de entrada na razão pode ser associado a uma negociação regular ou a uma transação de financiamento (depósito ou saque) ou a uma `transfer` interna entre duas contas do mesmo usuário. Se a entrada na razão estiver associada a uma transferência interna, o campo `account` conterá o id da conta que está sendo alterada com a entrada na razão em questão. O campo `referenceAccount` conterá o id da conta oposta para/da qual os fundos são transferidos, dependendo da `direction` (`'in'` ou `'out'`).

## Depósito

Para depositar fundos em criptomoeda em uma exchange, você deve obter um endereço da exchange para a moeda que deseja depositar usando `fetchDepositAddress`. Você pode então chamar o método `withdraw` com a moeda e o endereço especificados.

Para depositar moeda fiduciária em uma exchange, você pode usar o método `deposit` com dados recuperados do método `fetchDepositMethodId`.
*este recurso de depósito atualmente é suportado apenas na coinbase; sinta-se à vontade para relatar quaisquer problemas encontrados*

- `deposit ()`

```javascript
deposit (id, code = undefined, params = {})
```

Parâmetros

- **id** (String) *obrigatório* Id do depósito
- **code** (String) Código de moeda fiduciária, obrigatório (ex.: `"USD"`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"account": "fiat"}`)

Retorna

- Uma [estrutura de transação](#transaction-structure)

- `fetchDepositMethodId ()`

```javascript
fetchDepositMethodId (id, params = {})
```

Parâmetros

- **id** (String) *obrigatório* Id do depósito
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"account": "fiat"}`)

Retorna

- Uma [estrutura de id de depósito](#deposit-id-structure)

- `fetchDepositMethodIds ()`

```javascript
fetchDepositMethodIds (params = {})
```

Parâmetros

- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"account": "fiat"}`)

Retorna

- Um array de [estruturas de id de depósito](#deposit-id-structure)

### Estrutura de Id de Depósito

A estrutura de id de depósito retornada de `fetchDepositMethodId`, `fetchDepositMethodIds` tem a seguinte aparência:

```javascript
{
    'info': {},                 // raw unparsed data as returned from the exchange
    'id': '75ab52ff-f25t',      // the deposit id
    'currency': 'USD',          // fiat currency
    'verified': true,           // whether funding through this id is verified or not
    'tag': 'from credit card',  // tag / memo / name of funding source
}
```

Os dados sobre depósitos feitos em uma conta podem ser recuperados usando

- `fetchDeposit ()` para um único depósito
- `fetchDeposits ( code )` para múltiplos depósitos da mesma moeda
- `fetchDeposits ()` para todos os depósitos em uma conta

```javascript
fetchDeposit (id, code = undefined, params = {})
```

Parâmetros

- **id** (String) *obrigatório* Id do depósito
- **code** (String) Código de moeda unificado CCXT, obrigatório (ex.: `"USDT"`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"network": "TRX"}`)

Retorna

- Uma [estrutura de transação](#transaction-structure)

```javascript
fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {})
```

Parâmetros

- **code** (String) Código de moeda unificado CCXT (ex.: `"USDT"`)
- **since** (Integer) Timestamp (ms) do momento mais antigo para recuperar depósitos (ex.: `1646940314000`)
- **limit** (Integer) O número de [estruturas de transação](#transaction-structure) a recuperar (ex.: `5`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)

Retorna

- Um array de [estruturas de transação](#transaction-structure)

## Saque

O método `withdraw` pode ser usado para sacar fundos de uma conta

Algumas exchanges exigem uma aprovação manual de cada saque por meio de 2FA (autenticação de dois fatores). Para aprovar seu saque, você geralmente precisa clicar no link secreto na sua caixa de entrada de e-mail ou inserir um código do Google Authenticator ou um código do Authy no site deles para verificar que a transação de saque foi solicitada intencionalmente.

Em alguns casos, você também pode usar o id de saque para verificar o status do saque posteriormente (se foi bem-sucedido ou não) e para enviar códigos de confirmação 2FA, onde isso é suportado pela exchange. Consulte [a documentação deles](#exchanges) para obter detalhes.

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


Parâmetros

- **code** (String) *obrigatório* Código de moeda CCXT unificado (ex.: `"USDT"`)
- **amount** (Float) *obrigatório* A quantidade de moeda a sacar (ex.: `20`)
- **address** (String) *obrigatório* O endereço do destinatário do saque (ex.: `"TEY6qjnKDyyq5jDc3DJizWLCdUySrpQ4yp"`)
- **tag** (String) Obrigatório para algumas redes (ex.: `"52055"`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"network": "TRX"}`)

Retorna

- Uma [estrutura de transação](#transaction-structure)

---

Os dados sobre saques realizados em uma conta podem ser recuperados usando

- `fetchWithdrawal ()` para um único saque
- `fetchWithdrawals ( code )` para múltiplos saques da mesma moeda
- `fetchWithdrawals ()` para todos os saques de uma conta

```javascript
fetchWithdrawal (id, code = undefined, params = {})
```

Parâmetros

- **id** (String) *obrigatório* Id do saque
- **code** (String) Código de moeda CCXT unificado (ex.: `"USDT"`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"network": "TRX"}`)

```javascript
fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {})
```

Parâmetros

- **code** (String) Código de moeda CCXT unificado (ex.: `"USDT"`)
- **since** (Integer) Timestamp (ms) do momento mais antigo para recuperar saques (ex.: `1646940314000`)
- **limit** (Integer) O número de [estruturas de transação](#transaction-structure) a recuperar (ex.: `5`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)

Retorna

- Um array de [estruturas de transação](#transaction-structure)

### Redes de Depósito e Saque

Também é possível passar os parâmetros como quarto argumento, com ou sem uma tag especificada

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


Os seguintes aliases de `network` permitem sacar criptomoedas em múltiplas redes

| Moeda | Rede |
|:---:|:---:|
| ETH  | ERC20 |
| TRX  | TRC20 |
| BSC  | BEP20 |
| BNB  | BEP2  |
| HT   | HECO  |
| OMNI | OMNI  |

Você pode definir o valor de `exchange.withdraw ('USDT', 100, 'TVJ1fwyJ1a8JbtUxZ8Km95sDFN9jhLxJ2D', { 'network': 'TRX' })` para sacar USDT na rede TRON, ou 'BSC' para sacar USDT na Binance Smart Chain. Na tabela acima, BSC e BEP20 são aliases equivalentes, portanto não importa qual você use, pois ambos produzirão o mesmo efeito.

### Estrutura de Transação

Transações denotam uma transferência de uma determinada moeda, ao contrário das [negociações](#trade-structure), que denotam a troca de uma moeda por outra.

- *estrutura de depósito*
- *estrutura de saque*

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

#### Notas Sobre a Estrutura de Transação

- `addressFrom` ou `addressTo` podem ser `undefined/None/null`, se a exchange em questão não especificar todos os lados da transação
- A semântica do campo `address` é específica da exchange. Em alguns casos pode conter o endereço do remetente, em outros pode conter o endereço do destinatário. O valor real depende da exchange.
- O campo `updated` é o timestamp UTC em milissegundos da mudança de status mais recente dessa operação de financiamento, seja `withdrawal` ou `deposit`. É necessário se você quiser acompanhar suas alterações ao longo do tempo, além de um snapshot estático. Por exemplo, se a exchange em questão reportar `created_at` e `confirmed_at` para uma transação, então o campo `updated` assumirá o valor de `Math.max (created_at, confirmed_at)`, ou seja, o timestamp da mudança de status mais recente.
- O campo `updated` pode ser `undefined/None/null` em certos casos específicos de cada exchange.
- A subestrutura `fee` pode estar ausente, se não for fornecida na resposta da exchange.
- O campo `comment` pode ser `undefined/None/null`; caso contrário, conterá uma mensagem ou nota definida pelo usuário ao criar a transação.
- Tenha cuidado ao lidar com `tag` e `address`. A `tag` **NÃO é uma string arbitrária definida pelo usuário** à sua escolha! Você não pode enviar mensagens de usuário e comentários na `tag`. O propósito do campo `tag` é endereçar sua carteira corretamente, portanto deve estar correto. Você deve usar apenas a `tag` recebida da exchange com a qual está trabalhando, caso contrário sua transação pode nunca chegar ao destino.
- O campo `type` pode ser `deposit/withdrawal` ou, em alguns casos (quando o endpoint da exchange retorna tanto transferências internas quanto transações em blockchain, ex.: `ccxt.coinlist`), pode ser `transfer`.

### Exemplos de fetchDeposits

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


### Exemplos de fetchWithdrawals


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


### Exemplos de fetchTransactions


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


## Endereços de Depósito

O endereço para depósito pode ser um endereço já existente que foi criado anteriormente na exchange, ou pode ser criado mediante solicitação. Para verificar quais dos dois métodos são suportados, consulte as propriedades `exchange.has['fetchDepositAddress']` e `exchange.has['createDepositAddress']`.

```javascript
fetchDepositAddress (code, params = {})
createDepositAddress (code, params = {})
```

Parâmetros

- **code** (String) *obrigatório* Código de moeda CCXT unificado (ex.: `"USDT"`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)

Retorna

- uma [estrutura de endereço](#address-structure)

---

Algumas exchanges também podem ter um método para buscar múltiplos endereços de depósito de uma vez ou todos eles de uma vez.

```javascript
fetchDepositAddresses (codes = undefined, params = {})
```

Parâmetros

- **code** (\[String\]) Array de códigos de moeda CCXT unificados. Pode ou não ser obrigatório dependendo da exchange (ex.: `["USDT", "BTC"]`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)

Retorna

- um array de [estruturas de endereço](#address-structure)

```javascript
fetchDepositAddressesByNetwork (code, params = {})
```

Parâmetros

- **code** (String) *obrigatório* Código de moeda CCXT unificado (ex.: `"USDT"`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)

Retorna

- um array de [estruturas de endereço](#address-structure)

### Estrutura de Endereço

As estruturas de endereço retornadas por `fetchDepositAddress`, `fetchDepositAddresses`, `fetchDepositAddressesByNetwork` e `createDepositAddress` têm a seguinte forma:

```javascript
{
    'info': response,       // raw unparsed data as returned from the exchange
    'currency': 'USDC',     // currency code
    'network': 'ERC20',     // a deposit/withdraw networks, ERC20, TRC20, BSC20 (see below)
    'address': '0x',        // blockchain address in terms of the requested currency and network
    'tag': undefined,       // tag / memo / paymentId for particular currencies (XRP, XMR, ...)
}
```

Com certas moedas, como AEON, BTS, GXS, NXT, SBD, STEEM, STR, XEM, XLM, XMR, XRP, um argumento adicional `tag` geralmente é exigido pelas exchanges. Outras moedas terão a `tag` definida como `undefined / None / null`. A tag é um memo, uma mensagem ou um id de pagamento que é anexado a uma transação de saque. A tag é obrigatória para essas moedas e identifica a conta do usuário destinatário.

Tenha cuidado ao especificar a `tag` e o `address`. A `tag` **NÃO é uma string arbitrária definida pelo usuário** à sua escolha! Você não pode enviar mensagens de usuário e comentários na `tag`. O propósito do campo `tag` é endereçar sua carteira corretamente, portanto deve estar correto. Você deve usar apenas a `tag` recebida da exchange com a qual está trabalhando, caso contrário sua transação pode nunca chegar ao destino.

**O campo `network` é relativamente novo; pode ser `undefined / None / null` ou estar completamente ausente em certos casos (com algumas exchanges), mas será adicionado em todos os lugares eventualmente. Ainda está em processo de unificação.**

## Transferências

O método `transfer` realiza transferências internas de fundos entre contas na mesma exchange. Isso pode incluir subcontas ou contas de diferentes tipos (`spot`, `margin`, `future`, ...). Se uma exchange estiver separada no CCXT em uma classe spot e futures (ex.: `binanceusdm`, `kucoinfutures`, ...), então o método `transferIn` pode estar disponível para transferir fundos para a conta de futuros, e o método `transferOut` pode estar disponível para transferir fundos para fora da conta de futuros

```javascript
transfer (code, amount, fromAccount, toAccount, params = {})
```

Parâmetros

- **code** (String) Código de moeda CCXT unificado (ex.: `"USDT"`)
- **amount** (Float) A quantidade de moeda a transferir (ex.: `10.5`)
- **fromAccount** (String) A conta da qual transferir os fundos.
- **toAccount** (String) A conta para a qual transferir os fundos.
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)
- **params.symbol** (String) Símbolo de mercado ao transferir de ou para uma conta de margem (ex.: `'BTC/USDT'`)

### Tipos de Conta

`fromAccount` e `toAccount` podem aceitar o id de conta da exchange ou um dos seguintes valores unificados:

- `funding` *para algumas exchanges `funding` e `spot` são a mesma conta*
- `main` *para algumas exchanges que permitem subcontas*
- `spot`
- `margin`
- `future`
- `swap`
- `lending`

Você pode recuperar todos os tipos de conta selecionando as chaves de `exchange.options['accountsByType']`

Algumas exchanges permitem transferências para endereços de e-mail, números de telefone ou para outros usuários pelo id do usuário.

Retorna

- Uma [estrutura de transferência](#transfer-structure)

```javascript
transferIn (code, amount, params = {})
transferOut (code, amount, params = {})
```

Parâmetros

- **code** (String) Código de moeda CCXT unificado (ex.: `"USDT"`)
- **amount** (Float) A quantidade de moeda a transferir (ex.: `10.5`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)

Retorna

- Uma [estrutura de transferência](#transfer-structure)

```javascript
fetchTransfers (code = undefined, since = undefined, limit = undefined, params = {})
```

Parâmetros

- **code** (String) Código de moeda CCXT unificado (ex.: `"USDT"`)
- **since** (Integer) Timestamp (ms) do momento mais antigo para recuperar transferências (ex.: `1646940314000`)
- **limit** (Integer) O número de [estruturas de transferência](#transfer-structure) a recuperar (ex.: `5`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)

Retorna

- Um array de [estruturas de transferência](#transfer-structure)

```javascript
fetchTransfer (id, since = undefined, limit = undefined, params = {})
```

Parâmetros

- **id** (String) id da transferência (ex.: `"12345"`)
- **since** (Integer) Timestamp (ms) do momento mais antigo para recuperar transferências (ex.: `1646940314000`)
- **limit** (Integer) O número de [estruturas de transferência](#transfer-structure) a recuperar (ex.: `5`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)

Retorna

- Uma [estrutura de transferência](#transfer-structure)

### Estrutura de Transferência

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
## Taxas

**Esta seção da API CCXT Unificada está em desenvolvimento.**

As taxas geralmente são agrupadas em duas categorias:

- Taxas de negociação. A taxa de negociação é o valor a pagar à exchange, geralmente uma porcentagem do volume negociado (preenchido).
- Taxas de transação. O valor a pagar à exchange ao depositar e sacar, bem como as taxas de transação de criptomoedas subjacentes (taxas de tx).

Como a estrutura de taxas pode depender do volume real de moedas negociadas pelo usuário, as taxas podem ser específicas da conta. Métodos para trabalhar com taxas específicas de conta:

```javascript
fetchTradingFee (symbol, params = {})
fetchTradingFees (params = {})
fetchDepositWithdrawFees (codes = undefined, params = {})
fetchDepositWithdrawFee (code, params = {})
```


Os métodos de taxa retornarão uma estrutura de taxa unificada, que frequentemente está presente também em ordens e negociações. A estrutura de taxa é um formato comum para representar as informações de taxa em toda a biblioteca. As estruturas de taxa geralmente são indexadas por mercado ou moeda.

Como isso ainda é um trabalho em andamento, alguns ou todos os métodos e informações descritos nesta seção podem estar ausentes nesta ou naquela exchange.

**NÃO use a propriedade `.fees` da instância da exchange, pois na maioria das vezes ela contém informações predefinidas/codificadas. As taxas reais devem ser acessadas apenas a partir de mercados e moedas.**

**NOTA: Anteriormente usávamos fetchTransactionFee(s) para obter as taxas de transação, que estão agora OBSOLETAS e essas funções foram substituídas por fetchDepositWithdrawFee(s)**

Você chama `fetchTradingFee` / `fetchTradingFees` para obter as taxas de negociação, e `fetchDepositWithdrawFee` / `fetchDepositWithdrawFees` para obter as taxas de depósito e saque.

### Estrutura de Taxas

Ordens, negociações privadas, transações e entradas do livro-razão podem definir as seguintes informações no campo `fee`:

```javascript
{
    'currency': 'BTC', // the unified fee currency code
    'rate': percentage, // the fee rate, 0.05% = 0.0005, 1% = 0.01, ...
    'cost': feePaid, // the fee cost (amount * fee rate)
}
```

### Tabela de Taxas

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

### Taxas de Negociação

As taxas de negociação são propriedades dos mercados. Na maioria das vezes, as taxas de negociação são carregadas nos mercados pela chamada `fetchMarkets`. Às vezes, no entanto, as exchanges fornecem taxas por meio de endpoints diferentes.

O método `calculateFee` pode ser usado para pré-calcular as taxas de negociação que serão pagas (use `calculateFeeWithRate` se você tiver uma taxa de negociação personalizada / nível, como VIP-X, em vez da taxa padrão do usuário). **ATENÇÃO! Este método é experimental, instável e pode produzir resultados incorretos em certos casos.** Você deve usá-lo com cautela. As taxas reais podem ser diferentes dos valores retornados por `calculateFee`; isto é apenas para pré-cálculo. Não confie em valores pré-calculados, pois as condições de mercado mudam frequentemente. É difícil saber de antemão se sua ordem será tomadora ou formadora de mercado.

```javascript
    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {})
    calculateFeeWithRate (symbol, type, side, amount, price, takerOrMaker = 'taker', customRate, params = {})
```

O método `calculateFee` retornará uma estrutura de taxa unificada com taxas pré-calculadas para uma ordem com os parâmetros especificados.

O acesso às taxas de negociação deve ser feito via [`fetchTradingFees`](#fee-schedule), que é a abordagem recomendada. Se esse método não for suportado pela exchange, então via a propriedade `.markets`, da seguinte forma:

```javascript
exchange.markets['ETH/BTC']['taker'] // taker fee rate for ETH/BTC
exchange.markets['BTC/USD']['maker'] // maker fee rate for BTC/USD
```

Os mercados armazenados na propriedade `.markets` podem conter informações adicionais relacionadas a taxas:

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

**ATENÇÃO! As informações relacionadas a taxas são experimentais, instáveis e podem estar apenas parcialmente disponíveis ou não disponíveis.**

As taxas de formador são pagas quando você fornece liquidez à exchange, ou seja, você *cria* uma ordem e outra pessoa a preenche. As taxas de formador geralmente são menores do que as taxas de tomador. Da mesma forma, as taxas de tomador são pagas quando você *retira* liquidez da exchange e preenche a ordem de outra pessoa.

As taxas podem ser negativas, o que é muito comum entre as exchanges de derivativos. Uma taxa negativa significa que a exchange pagará um reembolso (recompensa) ao usuário pela negociação.

Além disso, algumas exchanges podem não especificar taxas como porcentagem do volume; verifique o campo `percentage` do mercado para ter certeza.

#### Tabela de Taxas de Negociação

Algumas exchanges possuem um endpoint para buscar a tabela de taxas de negociação; isso é mapeado para os métodos unificados `fetchTradingFees` e `fetchTradingFee`

```javascript
fetchTradingFee (symbol, params = {})
```

Parâmetros

- **symbol** (String) *obrigatório* Símbolo de mercado unificado (ex.: `"BTC/USDT"`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"currency": "quote"}`)

Retorna

- Uma [estrutura de taxa de negociação](#trading-fee-structure)

```javascript
fetchTradingFees (params = {})
```

Parâmetros

- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"currency": "quote"}`)

Retorna

- Um array de [estruturas de taxa de negociação](#trading-fee-structure)

#### Estrutura de Taxa de Negociação

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

### Taxas de Transação

As taxas de transação são propriedades das moedas (saldo da conta).

O acesso às taxas de transação deve ser feito via a propriedade `.currencies`. Este aspecto ainda não está unificado e está sujeito a alterações.

```javascript
exchange.currencies['ETH']['fee'] // tx/withdrawal fee rate for ETH
exchange.currencies['BTC']['fee'] // tx/withdrawal fee rate for BTC
```

#### Tabela de Taxas de Transação

Algumas exchanges possuem um endpoint para buscar a tabela de taxas de transação; isso é mapeado para os métodos unificados

- `fetchTransactionFee ()` para uma única tabela de taxa de transação
- `fetchTransactionFees ()` para todas as tabelas de taxas de transação

```javascript
fetchTransactionFee (code, params = {})
```

Parâmetros

- **code** (String) *obrigatório* Código de moeda unificado do CCXT, obrigatório (ex.: `"USDT"`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"type": "deposit"}`)
- **params.network** (String) Especifica a rede unificada do CCXT (ex.: `{"network": "TRC20"}`)

Retorna

- Uma [estrutura de taxa de transação](#transaction-fee-structure)

```javascript
fetchTransactionFees (codes = undefined, params = {})
```

Parâmetros

- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"type": "deposit"}`)

Retorna

- Um array de [estruturas de taxa de transação](#transaction-fee-structure)

#### Estrutura de Taxa de Transação

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

## Juros sobre Empréstimo

* somente margem

Para negociar com alavancagem em mercados spot ou de margem, a moeda deve ser emprestada como um empréstimo. Esse valor emprestado deve ser devolvido com juros. Para obter o valor dos juros acumulados, você pode usar o método `fetchBorrowInterest`

```javascript
fetchBorrowInterest (code = undefined, symbol = undefined, since = undefined, limit = undefined, params = {})
```

Parâmetros

- **code** (String) O código de moeda unificado para a moeda dos juros (ex.: `"USDT"`)
- **symbol** (String) O símbolo de mercado de um mercado de margem isolada; se indefinido, os juros para mercados de margem cruzada são retornados (ex.: `"BTC/USDT:USDT"`)
- **since** (Integer) Timestamp (ms) do momento mais antigo para receber registros de juros (ex.: `1646940314000`)
- **limit** (Integer) O número de [estruturas de juros sobre empréstimo](#borrow-interest-structure) a serem recuperadas (ex.: `5`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"endTime": 1645807945000}`)

Retorna

- Um array de [estruturas de juros sobre empréstimo](#borrow-interest-structure)

### Estrutura de Juros sobre Empréstimo

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

## Tomar Emprestado e Reembolsar Margem

*somente margem*

Para tomar emprestado e reembolsar moeda como um empréstimo de margem, use `borrowCrossMargin`, `borrowIsolatedMargin`, `repayCrossMargin` e `repayIsolatedMargin`.

```javascript
borrowCrossMargin (code, amount, params = {})
repayCrossMargin (code, amount, params = {})
```
Parâmetros

- **code** (String) *obrigatório* O código de moeda unificado para a moeda a ser tomada emprestada ou reembolsada (ex.: `"USDT"`)
- **amount** (Float) *obrigatório* O valor da margem a ser tomada emprestada ou reembolsada (ex.: `20.92`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"rate": 0.002}`)

Retorna

- Uma [estrutura de empréstimo de margem](#margin-loan-structure)

```javascript
borrowIsolatedMargin (symbol, code, amount, params = {})
repayIsolatedMargin (symbol, code, amount, params = {})
```
Parâmetros

- **symbol** (String) *obrigatório* O símbolo de mercado unificado do CCXT de um mercado de margem isolada (ex.: `"BTC/USDT"`)
- **code** (String) *obrigatório* O código de moeda unificado para a moeda a ser tomada emprestada ou reembolsada (ex.: `"USDT"`)
- **amount** (Float) *obrigatório* O valor da margem a ser tomada emprestada ou reembolsada (ex.: `20.92`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"rate": 0.002}`)

Retorna

- Uma [estrutura de empréstimo de margem](#margin-loan-structure)

### Estrutura de Empréstimo de Margem

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

## Margem

*somente margem e contrato*

Nota: ao longo do manual usamos o termo "colateral" que significa o saldo de margem atual, mas não confunda com "margem inicial" ou "margem de manutenção":
- `colateral (saldo de margem atual) = margem inicial + lucro realizado e não realizado`.

Por exemplo, quando você abriu uma posição isolada com margem inicial de **50$** e a posição tem lucro não realizado de **-15$**, então o **colateral** da sua posição será de **35$**. No entanto, se considerarmos que o requisito de Margem de Manutenção (para manter a posição aberta) indicado pela exchange é de **$25** para essa posição, então seu colateral não deve cair abaixo disso, caso contrário a posição será liquidada.

Para aumentar, reduzir ou definir o saldo de margem (colateral) em uma posição alavancada aberta, use `addMargin`, `reduceMargin` e `setMargin`, respectivamente. Isso é como ajustar o nível de alavancagem que você está usando em uma posição já aberta.

Alguns cenários para usar esses métodos incluem:
- se a negociação estiver indo contra você, pode adicionar margem para reduzir o risco de liquidação
- se sua negociação estiver indo bem, você pode reduzir o saldo de margem da sua posição e realizar lucros

```javascript
addMargin (symbol, amount, params = {})
reduceMargin (symbol, amount, params = {})
setMargin (symbol, amount, params = {})
```


Parâmetros

- **symbol** (String) *obrigatório* Símbolo de mercado unificado do CCXT (ex.: `"BTC/USDT:USDT"`)
- **amount** (String) *obrigatório* Valor da margem a adicionar ou reduzir (ex.: `20`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"leverage": 5}`)

Retorna

- uma [estrutura de margem](#margin-structure)

Você pode buscar o histórico de ajustes de margem feitos usando os métodos acima ou automaticamente pela exchange usando o seguinte método

```javascript
fetchMarginAdjustmentHistory (symbol = undefined, type = undefined, since = undefined, limit = undefined, params = {})
```

Parâmetros

- **symbol** (String) Símbolo de mercado unificado do CCXT (ex.: `"BTC/USDT:USDT"`)
- **type** (String) "add" ou "reduce"
- **since** (Integer) Timestamp (ms) do momento mais antigo para recuperar ajustes de margem (ex.: `1646940314000`)
- **limit** (Integer) O número de [estruturas de margem](#margin-structure) a serem recuperadas (ex.: `5`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"auto": true}`)

Retorna

- uma [estrutura de margem](#margin-structure)

### Estrutura de Margem

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

## Definir Modo de Margem

*somente contrato*

Atualiza o tipo de margem utilizado para:

- `cross` Uma conta é usada para compartilhar colateral entre mercados. A margem é retirada do saldo total da conta para evitar liquidação quando necessário.
- `isolated` Cada mercado mantém o colateral em uma conta separada

```javascript
setMarginMode (marginMode, symbol = undefined, params = {})
```

Parâmetros

- **marginMode** (String) *obrigatório* o tipo de margem utilizado
    **Tipos de margem unificados:**
    - `"cross"`
    - `"isolated"`
- **symbol** (String) Símbolo de mercado unificado do CCXT (ex.: `"BTC/USDT:USDT"`) *obrigatório* na maioria das exchanges. Não é obrigatório quando o modo de margem não é específico de um mercado
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"leverage": 5}`)

Retorna

- resposta da exchange

### Exchanges Sem setMarginMode

Razões comuns pelas quais uma exchange pode não ter

```javascript
exchange.has['setMarginMode'] == false
```

incluem

- a exchange não oferece negociação alavancada
- a exchange oferece apenas um dos modos de margem `cross` ou `isolated`, mas não ambos
- o modo de margem deve ser definido usando um parâmetro específico da exchange dentro de `params` ao usar `createOrder`

### Notas Sobre Erros Suprimidos para setMarginMode

Algumas APIs de exchange retornam uma resposta de erro quando uma solicitação é enviada para definir o modo de margem para o modo que já está definido (ex.: enviar uma solicitação para definir o modo de margem para `cross` no mercado `BTC/USDT:USDT` quando a conta já tem `BTC/USDT:USDT` configurado para usar margem cruzada). O CCXT não considera isso um erro porque o resultado final é o que o usuário queria, portanto o erro é suprimido e o resultado do erro é retornado como um objeto.

Ex.:

```javascript
{ code: -4046, msg: 'No need to change margin type.' }
```

### Notas Sobre o Parâmetro marginMode

Alguns métodos permitem o uso de um parâmetro `marginMode` que pode ser definido como `cross` ou `isolated`. Isso pode ser útil para especificar o `marginMode` diretamente nos parâmetros dos métodos, para uso em mercados de margem spot ou de contrato. Para especificar um mercado de margem spot, você precisa usar um símbolo spot unificado ou definir o tipo de mercado como spot, enquanto define o parâmetro marginMode como `cross` ou `isolated`.

Criar uma Ordem de Margem Spot:

*Use um símbolo spot unificado, enquanto define o parâmetro marginMode.*


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


## Buscar Modo de Margem

*somente margem e contrato*

O método `fetchMarginMode()` pode ser usado para obter o modo de margem definido para um mercado. O método `fetchMarginModes()` pode ser usado para obter o modo de margem definido para múltiplos mercados de uma vez.

Você pode acessar o modo de margem definido usando:

- `fetchMarginMode()` (símbolo único)
- `fetchMarginModes([symbol1, symbol2, ...])` (múltiplos símbolos)
- `fetchMarginModes()` (todos os símbolos de mercado)

```javascript
fetchMarginMode(symbol, params = {})
```

Parâmetros

- **symbol** (String) *obrigatório* Um símbolo CCXT unificado (ex.: `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da corretora (ex.: `{"subType": "linear"}`)

Retorna

- uma [margin-mode-structure](#margin-mode-structure)

```javascript
fetchMarginModes(symbols = undefined, params = {})
```

Parâmetros

- **symbols** (\[String\]) Uma lista de símbolos CCXT unificados (ex.: `[ "BTC/USDT:USDT" ]`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da corretora (ex.: `{"subType": "linear"}`)

Retorna

- um array de [margin-mode-structures](#margin-mode-structure)

### Estrutura do Modo de Margem

```javascript
{
    "info": { ... }             // response from the exchange
    "symbol": "BTC/USDT:USDT",  // unified market symbol
    "marginMode": "cross",      // the margin mode either cross or isolated
}
```

## Definir Alavancagem

*somente margem e contrato*

```javascript
setLeverage (leverage, symbol = undefined, params = {})
```

Parâmetros

- **leverage** (Integer) *obrigatório* A alavancagem desejada
- **symbol** (String) Símbolo de mercado CCXT unificado (ex.: `"BTC/USDT:USDT"`) *obrigatório* na maioria das corretoras. Não é obrigatório quando a alavancagem não é específica de um mercado (ex.: se a alavancagem é definida para a conta e não por mercado)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da corretora (ex.: `{"marginMode": "cross"}`)

Retorna

- resposta da corretora

## Alavancagem

*somente margem e contrato*

O método `fetchLeverage()` pode ser utilizado para obter a alavancagem definida para um mercado. O método `fetchLeverages()` pode ser utilizado para obter a alavancagem definida para múltiplos mercados de uma só vez.

Você pode acessar a alavancagem definida utilizando:

- `fetchLeverage()` (símbolo único)
- `fetchLeverages([symbol1, symbol2, ...])` (múltiplos símbolos)
- `fetchLeverages()` (todos os símbolos de mercado)

```javascript
fetchLeverage(symbol, params = {})
```

Parâmetros

- **symbol** (String) *obrigatório* Um símbolo CCXT unificado (ex.: `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da corretora (ex.: `{"marginMode": "cross"}`)

Retorna

- uma [leverage-structure](#leverage-structure)

```javascript
fetchLeverages(symbols = undefined, params = {})
```

Parâmetros

- **symbols** (\[String\]) Uma lista de símbolos CCXT unificados (ex.: `[ "BTC/USDT:USDT" ]`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da corretora (ex.: `{"marginMode": "cross"}`)

Retorna

- um array de [leverage-structures](#leverage-structure)

### Estrutura de Alavancagem

```javascript
{
    "info": { ... }             // response from the exchange
    "symbol": "BTC/USDT:USDT",  // unified market symbol
    "marginMode": "cross",      // the margin mode either cross or isolated
    "longLeverage": 100,        // the set leverage for a long position
    "shortLeverage": 75,        // the set leverage for a short position
}
```

## Negociação de Contratos

Isso pode incluir futuros com data de vencimento definida, swaps perpétuos com pagamentos de financiamento e futuros ou swaps inversos.
As informações sobre as posições podem ser fornecidas por diferentes endpoints dependendo da corretora.
No caso de haver múltiplos endpoints servindo diferentes tipos de derivativos, o CCXT irá padrão para carregar apenas os contratos "linear" (em oposição ao "inverso") ou os contratos "swap" (em oposição ao "futuro").

### Posições

*somente contrato*

Para obter informações sobre posições atualmente mantidas em mercados de contratos, utilize

- fetchPosition ()            // para um único mercado
- fetchPositions ()           // para todas as posições
- fetchAccountPositions ()    // TODO
- fetchPositionHistory ()     // para uma única posição histórica
- fetchPositionsHistory ()     // para posições históricas

```javascript
fetchPosition (symbol, params = {})                         // for a single market
```

Parâmetros

- **symbol** (String) *obrigatório* Símbolo de mercado CCXT unificado (ex.: `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da corretora (ex.: `{"endTime": 1645807945000}`)

Retorna

- Uma [position structure](#position-structure)

```javascript
fetchPositions (symbols = undefined, params = {})
fetchAccountPositions (symbols = undefined, params = {})
```

Parâmetros

- **symbols** (\[String\]) Símbolos de mercado CCXT unificados; não defina para recuperar todas as posições (ex.: `["BTC/USDT:USDT"]`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da corretora (ex.: `{"endTime": 1645807945000}`)

Retorna

- Um array de [position structures](#position-structure)

```javascript
fetchPositionHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

Parâmetros

- **symbol** (\[String\]) Símbolos de mercado CCXT unificados; não defina para recuperar todas as posições (ex.: `["BTC/USDT:USDT"]`)
- **since** (Integer) Timestamp (ms) do momento mais antigo para recuperar posições (ex.: `1646940314000`)
- **limit** (Integer) O número de [position structures](#position-structure) a recuperar (ex.: `5`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da corretora (ex.: `{"endTime": 1645807945000}`)

Retorna

- Um array de [position structures](#position-structure)

#### Estrutura de Posição

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
As posições permitem que você tome dinheiro emprestado de uma corretora para operar comprado ou vendido em um mercado. Algumas corretoras exigem que você pague uma taxa de financiamento para manter a posição aberta.

Quando você opera comprado em uma posição, está apostando que o preço será maior no futuro e que o preço nunca ficará abaixo do `liquidationPrice`.

À medida que o preço do índice subjacente muda, o unrealisedPnl também muda e, consequentemente, a quantidade de garantia que você tem restante na posição (já que você só pode fechá-la ao preço de mercado ou pior). Em algum preço você terá zero de garantia restante, isso é chamado de preço "bust" ou "zero". Além desse ponto, se o preço for na direção oposta o suficiente, a garantia da posição cairá abaixo do `maintenanceMargin`. O maintenanceMargin atua como um buffer de segurança entre sua posição e garantia negativa, um cenário em que a corretora incorre em perdas em seu nome. Para se proteger, a corretora liquidará rapidamente sua posição se e quando isso acontecer. Mesmo que o preço retorne acima do liquidationPrice, você não receberá seu dinheiro de volta, pois a corretora vendeu todos os `contracts` que você comprou a preço de mercado. Em outras palavras, o maintenanceMargin é uma taxa oculta para tomar dinheiro emprestado.

É recomendado usar o `maintenanceMargin` e `initialMargin` em vez do `maintenanceMarginPercentage` e `initialMarginPercentage`, pois estes tendem a ser mais precisos. O maintenanceMargin pode ser calculado a partir de outros fatores além do maintenanceMarginPercentage, incluindo a taxa de financiamento e taxas de taker, por exemplo em [kucoin](https://futures.kucoin.com/contract/detail).

Um contrato inverso permitirá que você opere comprado ou vendido em BTC/USD colocando BTC como garantia. Nossa API para contratos inversos é a mesma que para contratos lineares. Os valores em um contrato inverso são cotados como se fossem negociados em USD/BTC, no entanto o preço ainda é cotado em termos de BTC/USD. A fórmula para o lucro e perda de um contrato inverso é `(1/markPrice - 1/price) * contracts`. O lucro e perda e a garantia agora serão cotados em BTC, e o número de contratos é cotado em USD.

#### Fechamento de Posições

*somente contrato*

Para fechar rapidamente posições abertas com uma ordem a mercado, utilize

- closePosition (symbol)               // para um único mercado
- closeAllPositions (symbol)           // para todas as posições

```typescript
closePosition (symbol: string, side: OrderSide = undefined, params = {}): Promise<Order>
```

Parâmetros

- **symbol** (String) *obrigatório* Símbolo de mercado CCXT unificado (ex.: `"BTC/USDT:USDT"`)
- **side** *opcional* um literal de string para a direção da sua ordem. Algumas corretoras exigem isso.
  **Lados unificados:**
  - `buy` entrega moeda de cotação e recebe moeda base; por exemplo, comprar `BTC/USD` significa que você receberá bitcoins pelos seus dólares.
  - `sell` entrega moeda base e recebe moeda de cotação; por exemplo, vender `BTC/USD` significa que você receberá dólares pelos seus bitcoins.
- **params** (Dictionary) Parâmetros específicos do endpoint da API da corretora (ex.: `{"endTime": 1645807945000}`)

Retorna

- Uma [order structure](#order-structure)

```typescript
closeAllPositions (params = {}): Promise<Position[]>
```

Parâmetros
- **params** (Dictionary) Parâmetros específicos do endpoint da API da corretora (ex.: `{"endTime": 1645807945000}`)

Retorna

- Uma lista de [order structures](#order-structure)


### Modo de Posição

*somente margem e contrato*

Método utilizado para definir o modo de posição:

```javascript
setPositionMode (hedged, symbol = undefined, params = {})
```

Parâmetros

- **hedged** (String) *obrigatório* valor do modo hedged:
    - `true` - define para o modo **hedged**
    - `false` - define para o modo **one-way**
- **symbol** (String) Símbolo de mercado CCXT unificado (ex.: `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da corretora

Método utilizado para buscar o modo de posição:

```javascript
fetchPositionMode (symbol = undefined, params = {}) {
```

Parâmetros

- **symbol** (String) Símbolo de mercado CCXT unificado (ex.: `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da corretora

Retorna

```javascript
{
    'info': { ... },
    'hedged': true,
}
```


#### Preço de Liquidação

É o preço no qual `initialMargin + unrealized = collateral = maintenanceMargin`. O preço foi na direção oposta à sua posição ao ponto em que só resta a garantia de maintenanceMargin e, se for ainda mais longe, a posição terá garantia negativa.

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

### Histórico de Financiamento

*somente contrato*

Os contratos de swap perpétuo (também conhecidos como futuro perpétuo) mantêm um preço de mercado que espelha o preço do ativo em que se baseiam porque taxas de financiamento são trocadas entre traders que mantêm posições em mercados de swap perpétuo.

Se o contrato está sendo negociado a um preço superior ao preço do ativo que representa, então os traders em posições compradas pagam uma taxa de financiamento aos traders em posições vendidas em horários específicos do dia, o que incentiva mais traders a entrarem em posições vendidas antes desses horários.

Se o contrato está sendo negociado a um preço inferior ao preço do ativo que representa, então os traders em posições vendidas pagam uma taxa de financiamento aos traders em posições compradas em horários específicos do dia, o que incentiva mais traders a entrarem em posições compradas antes desses horários.

Essas taxas geralmente são trocadas entre traders sem comissão para a corretora

O método `fetchFundingHistory` pode ser utilizado para recuperar o histórico de taxas de financiamento pagas ou recebidas de uma conta

```javascript
fetchFundingHistory (symbol = undefined, since = undefined, limit = undefined, params = {})
```

Parâmetros

- **symbol** (String) Símbolo de mercado CCXT unificado (ex.: `"BTC/USDT:USDT"`)
- **since** (Integer) Timestamp (ms) do momento mais antigo para recuperar o histórico de financiamento (ex.: `1646940314000`)
- **limit** (Integer) O número de [funding history structures](#funding-history-structure) a recuperar (ex.: `5`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da corretora (ex.: `{"endTime": 1645807945000}`)

Retorna

- Um array de [funding history structures](#funding-history-structure)

#### Estrutura do Histórico de Financiamento

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


### Conversão

O método `fetchConvertQuote` pode ser utilizado para recuperar uma cotação que pode ser usada para uma operação de conversão.
A cotação geralmente precisa ser utilizada dentro de um determinado período de tempo especificado pela corretora para que a operação de conversão seja executada com sucesso.

```javascript
fetchConvertQuote (fromCode, toCode, amount = undefined, params = {})
```

Parâmetros

- **fromCode** (String) *obrigatório* O código de moeda CCXT unificado para a moeda a ser convertida (ex.: `"USDT"`)
- **toCode** (String) *obrigatório* O código de moeda CCXT unificado para a moeda a ser convertida (ex.: `"USDC"`)
- **amount** (Float) Valor a converter em unidades da moeda de origem (ex.: `20.0`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da corretora (ex.: `{"toAmount": 2.9722}`)

Retorna

- Uma [conversion structure](#conversion-structure)

O método `createConvertTrade` pode ser utilizado para criar uma ordem de conversão usando o id recuperado de fetchConvertQuote.
A cotação geralmente precisa ser utilizada dentro de um determinado período de tempo especificado pela corretora para que a operação de conversão seja executada com sucesso.

```javascript
createConvertTrade (id, fromCode, toCode, amount = undefined, params = {})
```

Parâmetros

- **id** (String) *obrigatório* Id da cotação de conversão (ex.: `1645807945000`)
- **fromCode** (String) *obrigatório* O código de moeda CCXT unificado para a moeda a ser convertida (ex.: `"USDT"`)
- **toCode** (String) *obrigatório* O código de moeda CCXT unificado para a moeda a ser convertida (ex.: `"USDC"`)
- **amount** (Float) Valor a converter em unidades da moeda de origem (ex.: `20.0`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da corretora (ex.: `{"toAmount": 2.9722}`)

Retorna

- Uma [estrutura de conversão](#conversion-structure)

O método `fetchConvertTrade` pode ser usado para buscar uma operação de conversão específica usando o id da operação.

```javascript
fetchConvertTrade (id, code = undefined, params = {})
```

Parâmetros

- **id** (String) *obrigatório* Id da operação de conversão (ex.: `"80794187SDHJ25"`)
- **code** (String) O código de moeda unificado da operação de conversão (ex.: `"USDT"`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"toAmount": 2.9722}`)

Retorna

- Uma [estrutura de conversão](#conversion-structure)

O método `fetchConvertTradeHistory` pode ser usado para buscar o histórico de conversões para um código de moeda especificado.

```javascript
fetchConvertTradeHistory (code = undefined, since = undefined, limit = undefined, params = {})
```

Parâmetros

- **code** (String) O código de moeda unificado para buscar o histórico de operações de conversão (ex.: `"USDT"`)
- **since** (Integer) Timestamp da conversão mais antiga (ex.: `1645807945000`)
- **limit** (Integer) O número máximo de estruturas de conversão a serem recuperadas (ex.: `10`)
- **params** (Dictionary) Parâmetros específicos do endpoint da API da exchange (ex.: `{"toAmount": 2.9722}`)

Retorna

- Um array de [estruturas de conversão](#conversion-structure)

#### Estrutura de Conversão

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

*somente contratos*

Use os métodos `fetchPositionADLRank` ou `fetchPositionsADLRank` para obter os detalhes privados do ranking de auto de leverage de uma posição na exchange.

```javascript
fetchPositionADLRank (symbol, params = {})
```

Parâmetros

- **symbol** (String) Símbolo de mercado unificado CCXT (ex.: `"BTC/USDT:USDT"`)
- **params** (Dictionary) Parâmetros extras específicos do endpoint da API da exchange (ex.: `{"category": "futures"}`)

Retorna

- Uma [estrutura de auto de leverage](#auto-de-leverage)

```javascript
fetchPositionsADLRank (symbols, params = {})
```

Parâmetros

- **symbols** (\[String\]) Uma lista de símbolos CCXT unificados (ex.: `[ "BTC/USDT:USDT" ]`)
- **params** (Dictionary) Parâmetros extras específicos do endpoint da API da exchange (ex.: `{"category": "futures"}`)

Retorna

- Uma lista de [estruturas de auto de leverage](#auto-de-leverage)

### Estrutura de Auto De Leverage

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

Em alguns casos específicos você pode querer um proxy, quando:
- A exchange não está disponível na sua localização
- Seu IP está bloqueado pela exchange
- Você experimenta restrições aleatórias pela exchange, como [proteção DDoS pelo Cloudflare](#ddos-protection-by-cloudflare-incapsula)

No entanto, esteja ciente de que cada intermediário adicionado pode adicionar alguma latência às requisições.

**Nota para usuários Go:** Após definir qualquer propriedade de proxy, você deve chamar `UpdateProxySettings()` para aplicar as alterações:
```go
exchange := ccxt.NewBinance(nil)
exchange.ProxyUrl = "http://your-proxy-url:8080"
exchange.UpdateProxySettings()  // Required in Go to apply proxy settings
```
Mas esteja ciente de que cada intermediário adicionado pode adicionar alguma latência às requisições.

### Tipos de proxy suportados
CCXT suporta os seguintes tipos de proxy (observe que cada um deles também possui [suporte a callbacks](#using-proxy-callbacks)):

#### proxyUrl

Esta propriedade adiciona uma url antes das requisições à API. Pode ser útil para redirecionamento simples ou [para contornar restrições CORS do navegador](#cors-access-control-allow-origin).
```
ex = ccxt.binance();
ex.proxyUrl = 'YOUR_PROXY_URL';
```
enquanto 'YOUR_PROXY_URL' pode ser como (use a barra conforme apropriado):
- `https://cors-anywhere.herokuapp.com/`
- `http://127.0.0.1:8080/`
- `http://your-website.com/sample-script.php?url=`
- etc

Portanto, as requisições serão feitas para, ex.: `https://cors-anywhere.herokuapp.com/https://exchange.xyz/api/endpoint`. (Você também pode ter um pequeno script de proxy rodando no seu dispositivo/servidor web para usá-lo em `.proxyUrl` - "sample-local-proxy-server" na [pasta de exemplos](https://github.com/ccxt/ccxt/tree/master/examples)). Para personalizar a url de destino, você também pode sobrescrever o método `urlEncoderForProxyUrl` da instância.

Esta abordagem funciona **somente para requisições REST**, mas não para conexões WebSocket. ((_Como testar se seu proxy funciona_))[#test-if-your-proxy-works]

#### httpProxy e httpsProxy
Para definir um proxy http(s) real para seus scripts, você precisa ter acesso a um [proxy http ou https](https://stackoverflow.com/q/10440690/2377343) remoto, para que as chamadas sejam feitas diretamente à exchange de destino, tuneladas através do seu servidor proxy:
```
ex.httpProxy = 'http://1.2.3.4:8080/';
// or
ex.httpsProxy = 'http://1.2.3.4:8080/';
```
Esta abordagem afeta apenas requisições **não-websocket** do ccxt. Para rotear conexões WebSocket do CCXT através de proxy, você precisa definir especificamente a propriedade `wsProxy` (ou `wssProxy`), além de `httpProxy` (ou `httpsProxy`), portanto seu script deve ser assim:
```
ex.httpProxy = 'http://1.2.3.4:8080/';
ex.wsProxy   = 'http://1.2.3.4:8080/';
```
Assim, ambas as conexões (HTTP & WS) passarão pelos proxies.
((_Como testar se seu proxy funciona_))[#test-if-your-proxy-works]


#### socksProxy
Você também pode usar [proxy socks](https://www.google.com/search?q=what+is+socks+proxy) com o seguinte formato:
```
// from protocols: socks, socks5, socks5h
ex.socksProxy = 'socks5://1.2.3.4:8080/';
ex.wsSocksProxy = 'socks://1.2.3.4:8080/';
```
((_Como testar se seu proxy funciona_))[#test-if-your-proxy-works]

#### Teste se seu proxy funciona
Após definir qualquer uma das propriedades de proxy listadas acima no seu trecho de código ccxt, você pode testar se funciona fazendo ping em alguns sites de eco de IP - verifique um arquivo "proxy-usage" nos [exemplos](https://github.com/ccxt/ccxt/blob/master/examples/).

#### usando callbacks de proxy
**Em vez de definir uma propriedade, você também pode usar os callbacks `proxyUrlCallback, http(s)ProxyCallback, socksProxyCallback`:
```
myEx.proxyUrlCallback = function (url, method, headers, body) { ... return 'http://1.2.3.4/'; }
```

### detalhes extras relacionados a proxy

#### userAgent

Se você precisar para casos especiais, pode sobrescrever a propriedade `userAgent` assim:
```
exchange.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'
```

#### agentes de proxy personalizados

Dependendo da sua linguagem de programação, você pode definir agentes de proxy personalizados.
 - Para JS, veja [este exemplo](
https://github.com/ccxt/ccxt/blob/master/examples/js/custom-proxy-agent-for-js.js)
 - Para Python, veja os seguintes exemplos: [proxies-for-synchronous-python](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxies-for-synchronous-python.py), [proxy-asyncio-aiohttp-python-3](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxy-asyncio-aiohttp-python-3.py), [proxy-asyncio-aiohttp-socks](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxy-asyncio-aiohttp-socks.py), [proxy-sync-python-requests-2-and-3](
https://github.com/ccxt/ccxt/blob/master/examples/py/proxy-sync-python-requests-2-and-3.py)

#### CORS (Access-Control-Allow-Origin)

CORS (conhecido como [Compartilhamento de Recursos de Origem Cruzada](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)) afeta principalmente navegadores e é a causa do conhecido aviso `No 'Access-Control-Allow-Origin' header is present on the requested resource`. Isso acontece quando um script (rodando em um navegador) faz uma requisição para um domínio de terceiros (por padrão tais requisições são bloqueadas, a menos que o domínio de destino permita explicitamente).
Portanto, nesses casos você precisará se comunicar com um proxy "CORS", que redirecionará as requisições (em oposição às requisições diretas do lado do navegador) para a exchange de destino. Para definir um proxy CORS, você pode executar o arquivo de exemplo [sample-local-proxy-server-with-cors](https://github.com/ccxt/ccxt/blob/master/examples/) e no ccxt definir a propriedade [`.proxyUrl`](#proxyurl) para rotear as requisições através do servidor cors/proxy.

## Matemática com Strings

Alguns usuários podem querer controlar como o CCXT lida com operações aritméticas. Embora use tipos numéricos por padrão, os usuários podem alternar para matemática de ponto fixo usando tipos string. Isso pode ser feito por:


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


# Tratamento de Erros

- [Mecanismo de Tentativa Novamente](#retry-mechanism)
- [Hierarquia de Exceções](#exception-hierarchy)
- [ExchangeError](#exchangeerror)
- [OperationFailed](#operationfailed)
- [DDoSProtection](#ddosprotection)
- [RateLimitExceeded](#ratelimitexceeded)
- [RequestTimeout](#requesttimeout)
- [RequestTimeout](#requesttimeout)
- [ExchangeNotAvailable](#exchangenotavailable)
- [InvalidNonce](#invalidnonce)

O tratamento de erros com CCXT é feito com o mecanismo de exceções disponível nativamente em todas as linguagens.

Para tratar os erros, você deve adicionar um bloco `try` em torno da chamada a um método unificado e capturar as exceções como você normalmente faria na sua linguagem:

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

Para pipelines assíncronos (`fetchTickerAsync`, etc.), `CompletableFuture` encapsula
erros lançados em `CompletionException`. Use `Helpers.unwrap()` dentro de
`.exceptionally(...)` para remover o encapsulamento e corresponder o erro ccxt subjacente:

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


## Mecanismo de Tentativa Novamente
Ao lidar com requisições HTTP, é importante entender que as requisições podem falhar por vários motivos. Causas comuns dessas falhas incluem servidor indisponível, instabilidade de rede ou problemas temporários do servidor. Para lidar com esses cenários de forma elegante, o CCXT oferece uma opção para repetir automaticamente as requisições com falha. Você pode definir o valor de `maxRetriesOnFailure` e `maxRetriesOnFailureDelay` para configurar o número de tentativas e o atraso entre elas, exemplo:

```python
exchange.options['maxRetriesOnFailure'] = 3 # if we get an error like the ones mentioned above we will retry up to three times per request
exchange.options['maxRetriesOnFailureDelay'] = 1000 # we will wait 1000ms (1s) between retries
```

É importante destacar que apenas problemas relacionados ao servidor/rede farão parte do mecanismo de tentativa; se o usuário receber um erro por `InsufficientFunds` ou `InvalidOrder`, a requisição não será repetida.

## Hierarquia de Exceções

Todas as exceções derivam da exceção base BaseError, que, por sua vez, é definida na biblioteca ccxt da seguinte forma:


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


A hierarquia de herança de exceções está neste arquivo: https://github.com/ccxt/ccxt/blob/master/ts/src/base/errorHierarchy.ts , e visualmente pode ser esquematizada conforme mostrado abaixo:

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

A classe `BaseError` é uma classe de erro raiz genérica para todo tipo de erros, incluindo acessibilidade e incompatibilidade de requisição/resposta. Se você não precisar capturar nenhuma subclasse específica de exceções, pode usar apenas `BaseError`, onde todos os tipos de exceção são capturados.

De `BaseError` derivam duas famílias diferentes de erros: `OperationFailed` e `ExchangeError` (eles também têm seus subtipos específicos, conforme explicado abaixo).

### OperationFailed


Um `OperationFailed` pode ocorrer quando o usuário envia uma **requisição corretamente construída e válida** à exchange, mas ocorreu um problema não determinístico:
- manutenção em andamento
- problemas de conectividade com a internet/rede
- proteções DDoS
- "Servidor ocupado, tente novamente"...

Tais exceções são temporárias e tentar a requisição novamente pode ser suficiente. No entanto, se o erro ainda ocorrer, pode indicar algum problema persistente com a exchange ou com sua conexão.

`OperationFailed` tem os seguintes subtipos: `RequestTimeout`, `DDoSProtection` (inclui o subtipo `RateLimitExceeded`), `ExchangeNotAvailable`, `InvalidNonce`.


#### DDoSProtection

Esta exceção é lançada em casos em que serviços de nuvem/hospedagem (Cloudflare, Incapsula ou outros) limitam requisições de usuário/região/localização ou quando a API da exchange restringe o usuário por fazer requisições anormais. Esta exceção também contém a exceção de subtipo específico `RateLimitExceeded`, que significa diretamente que o usuário está fazendo requisições muito mais frequentes do que o tolerado pelo mecanismo da API da exchange.

#### RequestTimeout

Esta exceção é lançada quando a conexão com a exchange falha ou os dados não são totalmente recebidos em um período de tempo especificado. Isso é controlado pela propriedade `.timeout` da exchange. Quando um `RequestTimeout` é lançado, o usuário não sabe o resultado de uma requisição (se foi aceita pelo servidor da exchange ou não).

Portanto, é aconselhável tratar este tipo de exceção da seguinte forma:

- para requisições de busca, é seguro repetir a chamada
- para uma requisição a `cancelOrder()`, o usuário deve repetir a mesma chamada uma segunda vez. Uma nova tentativa subsequente a `cancelOrder()` retornará um dos seguintes resultados possíveis:
  - a requisição é concluída com sucesso, o que significa que a ordem foi cancelada corretamente agora
  - uma exceção `OrderNotFound` é lançada, o que significa que a ordem já foi cancelada na primeira tentativa ou foi executada (preenchida e fechada) enquanto isso entre as duas tentativas.
- se uma requisição a `createOrder()` falhar com um `RequestTimeout`, o usuário deve:
  - chamar `fetchOrders()`, `fetchOpenOrders()`, `fetchClosedOrders()` para verificar se a requisição de criação da ordem foi bem-sucedida e se a ordem está agora aberta
  - se a ordem não estiver `'open'`, o usuário deve chamar `fetchBalance()` para verificar se o saldo mudou desde que a ordem foi criada na primeira execução e então foi preenchida e fechada no momento da segunda verificação.

#### ExchangeNotAvailable

Este tipo de exceção é lançado quando a exchange subjacente está inacessível. A biblioteca ccxt também lança este erro se detectar qualquer uma das seguintes palavras-chave na resposta:

  - `offline`
  - `unavailable`
  - `busy`
  - `retry`
  - `wait`
  - `maintain`
  - `maintenance`
  - `maintenancing`

#### InvalidNonce

Lançado quando o seu nonce é menor que o nonce anterior utilizado com o seu par de chaves, conforme descrito na secção [Authentication](#authentication). Este tipo de exceção é lançado nestes casos (por ordem de precedência de verificação):

  - Você não está a limitar a taxa das suas requisições ou está a enviar demasiadas com muita frequência.
  - As suas chaves de API não são novas e recentes (já foram usadas com outro software ou script; crie sempre um novo par de chaves ao adicionar esta ou aquela exchange).
  - O mesmo par de chaves é partilhado por múltiplas instâncias da classe exchange (por exemplo, num ambiente multithread ou em processos separados).
  - O relógio do seu sistema está dessincronizado. A hora do sistema deve ser sincronizada com UTC num fuso horário sem horário de verão, pelo menos a cada dez minutos ou com ainda mais frequência, devido ao desvio do relógio. **Activar a sincronização de hora no Windows geralmente não é suficiente!** É necessário configurá-lo através do Registo do SO (pesquise *"time synch frequency"* para o seu SO).


### ExchangeError

Em contraste com `OperationFailed`, o `ExchangeError` ocorre maioritariamente quando a requisição é impossível de ter sucesso (por causa dos factores listados abaixo), pelo que mesmo que repita a mesma requisição centenas de vezes, continuará a falhar, pois a requisição está a ser feita de forma incorrecta.

Possíveis razões para esta exceção:

  - o endpoint foi desactivado pela exchange
  - símbolo não encontrado na exchange
  - parâmetro obrigatório em falta
  - o formato dos parâmetros está incorrecto
  - algum problema do lado do utilizador que precisa de ser corrigido

`ExchangeError` tem as seguintes sub-exceções:

  - `NotSupported`: quando o endpoint/operação não é oferecido ou suportado pela API da exchange.
  - `BadRequest`: o utilizador envia uma requisição/parâmetro/acção **incorrectamente** construída, inválida/não permitida (ex.: "número inválido", "símbolo proibido", "tamanho além dos limites mín/máx", "precisão incorrecta", etc). Repetir a requisição não ajudaria neste caso; a requisição precisa de ser corrigida/ajustada primeiro.
  - `OperationRejected` - o utilizador envia uma requisição **correctamente** construída (que deveria ser aceite pela exchange num caso típico), mas algum factor determinístico impede que a sua requisição tenha sucesso. Por exemplo, o estado actual da sua conta pode não o permitir (ex.: "feche as posições existentes antes de alterar a alavancagem", "demasiadas ordens pendentes", "a sua conta está no modo de posição/margem errado") ou no momento dado o símbolo não está disponível para negociação (ex.: "MarketClosed") ou existem factores explicados onde precisa de tomar uma acção específica (ex.: alterar alguma configuração primeiro, ou aguardar até um momento específico). Portanto, mais uma vez: o [**OperationFailed**](#operationfailed) pode ser repetido cegamente e deve ter sucesso, enquanto que `OperationRejected` é uma falha que depende de factores específicos exactos que precisam de ser considerados antes de a requisição poder ser repetida.
  - `AuthenticationError`: quando uma exchange requer uma das credenciais de API que não especificou, ou quando há um erro no par de chaves ou um nonce desactualizado. Na maioria das vezes precisa de `apiKey` e `secret`, às vezes também precisa de `uid` e/ou `password` se a API da exchange o exigir.
  - `PermissionDenied`: quando não há acesso para a acção especificada ou permissões insuficientes na `apiKey` especificada.
  - `InsufficientFunds`: quando não tem moeda suficiente no saldo da sua conta para colocar uma ordem.
  - `InvalidAddress`: quando se encontra um endereço de financiamento inválido ou um endereço de financiamento mais curto do que `.minFundingAddressLength` (10 caracteres por defeito) numa chamada a `fetchDepositAddress`, `createDepositAddress` ou `withdraw`.
  - `InvalidOrder`: a classe base para todas as exceções relacionadas com a API unificada de ordens.
  - `OrderNotFound`: quando está a tentar obter ou cancelar uma ordem inexistente.

### Tratamento de erros de timestamp

Os utilizadores podem ocasionalmente encontrar erros como:

> "Timestamp for this request is outside of the recvWindow."
> "Invalid request, please check your server timestamp or recv_window param."
> "Timestamp for this request was 1000ms ahead of the server's time."

Estes problemas podem surgir por vários motivos:

#### 1. Dessincronização do Relógio do Sistema
O relógio do sistema do seu dispositivo pode não estar devidamente sincronizado com os padrões de hora globais, levando a discrepâncias de timestamp.
Para resolver isto, certifique-se de que o relógio do seu sistema é preciso ao milissegundo. Isto não deve ser um ajuste pontual — configure o seu sistema operativo para sincronizar a hora periodicamente (ex.: a cada hora) para manter a precisão.

#### 2. Latência de Rede ou Requisições Atrasadas
Se o relógio do seu dispositivo estiver correctamente sincronizado, mas os atrasos de rede fazem com que as requisições demorem mais do que a janela aceite pela exchange (normalmente cerca de `5` segundos, embora isso varie por exchange), a sua requisição pode ser rejeitada.


Se o problema persistir, pode comparar o seu timestamp local com a hora do servidor da exchange para diagnosticar discrepâncias:

```
for i in range(0, 20):
    local_time = exchange.milliseconds()
    exchange_time = await exchange.fetch_time()
    print(exchange_time - local_time)
```

####  Ajustar as Opções da Exchange

Se continuar a ter erros de timestamp após verificar a sincronização, pode modificar certas opções da exchange para ajudar a mitigar o problema.

A) `exchange.options['adjustForTimeDifference'] = True`
ou aumentar a janela para, por ex., 10 segundos (apenas se a exchange o suportar, pesquise esta palavra-chave no [ficheiro da exchange](https://github.com/ccxt/ccxt/tree/master/ts/src) alvo):
B) `exchange.options['recvWindow'] = 10000`


Para passos adicionais de resolução de problemas, discussões da comunidade e problemas relacionados com timestamp/`recvWindow`, consulte os seguintes tópicos do GitHub:

- [CCXT Issue #773](https://github.com/ccxt/ccxt/issues/773)
- [CCXT Issue #850](https://github.com/ccxt/ccxt/issues/850)
- [CCXT Issue #936](https://github.com/ccxt/ccxt/issues/936)

# Resolução de Problemas

Caso tenha dificuldades em ligar-se a uma exchange específica, faça o seguinte por ordem de precedência:

- Certifique-se de que tem a versão mais recente do ccxt.
  Nunca confie no seu gestor de pacotes (seja `npm`, `pip` ou `composer`); em vez disso, verifique sempre o **número de versão real do seu ambiente de execução** executando este código no seu ambiente:
  ```javascript
  console.log (ccxt.version) // JavaScript
  ```
  ```python
  print('CCXT version:', ccxt.__version__)  # Python
  ```
  ```php
  echo "CCXT v." . \ccxt\Exchange::VERSION . "\n"; // PHP
  ```
- Verifique os [Issues](https://github.com/ccxt/ccxt/issues) ou os [Announcements](#announcements) para actualizações recentes.
- Certifique-se de que não desactivou o [rate-limiter com `enableRateLimit: false`](#rate-limit) (Se alguém tiver uma solução personalizada de rate-limit implementada, certifique-se de que não se comporta de forma incorrecta).
- Se usar a funcionalidade de proxy do ccxt, certifique-se de que não se comporta de forma incorrecta.
- Active `verbose = true` para obter mais detalhes sobre o problema!
  ```
  exchange = ccxt.binance()
  exchange.load_markets()
  exchange.verbose = True  # for less noise, you can set that after `load_markets`, but if the error happens during `load_markets` then place this line before it
  # ... your codes here ...
  ```
  O seu [código para reproduzir o problema + saída verbose é necessário](/docs/faq#what-is-required-to-get-help) para obter ajuda.
- Os utilizadores de Python podem activar o nível de registo DEBUG com um logger pythónico padrão, adicionando estas duas linhas ao início do seu código:
  ```python
  import logging
  logging.basicConfig(level=logging.DEBUG)
  ```
- Use o modo verbose para se certificar de que as credenciais de API utilizadas correspondem às chaves que pretende usar. Certifique-se de que não há confusão de pares de chaves.
- **Experimente um par de chaves novo e recente, se possível.**
- Leia as respostas às Perguntas Frequentes: /docs/faq
- Verifique as permissões do par de chaves no site da exchange!
- Verifique o seu nonce. Se utilizou as suas chaves de API com outro software, provavelmente deverá [substituir a sua função nonce](#overriding-the-nonce) para corresponder ao valor do nonce anterior. Um nonce normalmente pode ser facilmente reiniciado gerando um novo par de chaves não utilizado. Se estiver a obter erros de nonce com uma chave existente, experimente com uma nova chave de API que ainda não foi utilizada.
- Verifique a taxa das suas requisições se estiver a obter erros de nonce. As suas requisições privadas não devem seguir-se umas às outras rapidamente. Não deve enviá-las uma após outra em fracção de segundo ou em pouco tempo. A exchange provavelmente irá banir-te se não fizer um atraso antes de enviar cada nova requisição. Por outras palavras, não deve atingir o limite de taxa deles enviando requisições privadas ilimitadas com demasiada frequência. Adicione um atraso às suas requisições subsequentes ou active o rate-limiter incorporado, como mostrado nos exemplos de long-polling [examples](https://github.com/ccxt/ccxt/tree/master/examples), também [aqui](#order-book--market-depth).
- Leia a [documentação da sua exchange](/docs/exchange-markets) e compare a sua saída verbose com a documentação.
- Verifique a sua conectividade com a exchange acedendo-a através do seu browser.
- Verifique a sua ligação com a exchange através de um [proxy](#proxy).
- Tente aceder à exchange a partir de um computador diferente ou de um servidor remoto, para verificar se este é um problema local ou global com a exchange.
- Verifique se houve recentemente alguma notícia da exchange sobre paragens para manutenção. Algumas exchanges ficam offline para actualizações regularmente (como uma vez por semana).
- Certifique-se de que a hora do seu sistema está sincronizada com os relógios do resto do mundo, caso contrário poderá obter erros de nonce inválido.

**Notas Adicionais:**

- Use a opção `verbose = true` ou instancie a sua exchange problemática com `new ccxt.exchange ({ 'verbose': true })` para ver os pedidos e respostas HTTP em detalhe. A saída verbose também será útil para nós depurar o problema se submeter um issue no GitHub.
- Use o registo DEBUG em Python!
- Algumas exchanges não estão disponíveis em certos países; usar um [proxy](#proxy) pode ser a solução nesses casos.
- Se estiver a obter erros de autenticação ou erros de *'invalid keys'*, estes devem-se muito provavelmente a um problema de nonce.
- Algumas exchanges não indicam claramente quando falham em autenticar o seu pedido. Nessas circunstâncias podem responder com um código de erro exótico, como HTTP 502 Bad Gateway Error ou algo ainda menos relacionado com a causa real do erro.
