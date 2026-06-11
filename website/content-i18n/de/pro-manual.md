---
title: "CCXT Pro Handbuch"
description: "CCXT Pro ist ein kostenloser Teil von CCXT, der Unterstützung für WebSocket-Streaming hinzufügt: https://github.com/ccxt/ccxt/issues/15171"
---

# Handbuch

CCXT Pro ist ein kostenloser Teil von CCXT, der Unterstützung für WebSocket-Streaming hinzufügt: https://github.com/ccxt/ccxt/issues/15171

Der CCXT Pro-Stack basiert auf [CCXT](https://ccxt.com) und erweitert die CCXT-Kernklassen mithilfe von:

- JavaScript Prototype-Level-Mixins
- Python-Mehrfachvererbung
- PHP Traits
- Java-Klassenvererbung (Pro-Exchange-Klassen erweitern Basis-Exchange-Klassen)

CCXT Pro stützt sich stark auf den Transpiler von CCXT für die [Mehrsprachenunterstützung](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support).

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

## Börsen
<!--- init list -->Die CCXT Pro-Bibliothek unterstützt derzeit die folgenden 74 Kryptowährungs-Börsenmärkte und WebSocket-Handels-APIs:

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
Dies ist die Liste der Börsen in CCXT Pro mit Unterstützung für WebSockets-APIs. Diese Liste wird regelmäßig mit neuen Börsen aktualisiert.

Vollständige Liste der über REST in CCXT verfügbaren Börsen: [Unterstützte Kryptowährungs-Handelsmärkte](https://github.com/ccxt/ccxt/#supported-cryptocurrency-exchange-markets).

## Verwendung

```diff
- this part of the doc is under heavy development right now
- there may be some typos, mistakes and missing info here and there
- contributions, pull requests and feedback appreciated
```

## Voraussetzungen

Der beste Weg, CCXT Pro zu verstehen, besteht darin, sicherzustellen, dass Sie das gesamte CCXT-Handbuch verstehen und zunächst Standard-CCXT praktisch anwenden. CCXT Pro baut auf CCXT auf. Die beiden Bibliotheken teilen viele Gemeinsamkeiten, darunter:

- die Konzepte der öffentlichen API und der privaten authentifizierten API
- Märkte, Symbole, Währungscodes und IDs
- einheitliche Datenstrukturen und -formate, Orderbücher, Trades, Orders, Kerzen, Zeitrahmen, ...
- Ausnahmen und Fehlerzuordnungen
- Authentifizierung und API-Schlüssel (für private Feeds und Aufrufe)
- Konfigurationsoptionen

Das Zielpublikum von CCXT Pro besteht hauptsächlich aus professionellen algorithmischen Händlern und Entwicklern. Um effizient mit dieser Bibliothek arbeiten zu können, muss der Benutzer mit den Konzepten des Streamings vertraut sein. Man muss die grundlegenden Unterschiede zwischen verbindungsbasierten Streaming-APIs ([WebSocket](https://en.wikipedia.org/wiki/WebSocket), CCXT Pro) und anfrage-/antwortbasierten APIs ([REST](https://en.wikipedia.org/wiki/Representational_state_transfer), CCXT) verstehen.

Der allgemeine asynchrone Ablauf für eine CCXT-Anwendung ist wie folgt:

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

In CCXT Pro hat jede öffentliche und private einheitliche RESTful-Methode mit dem Präfix `fetch*` auch eine entsprechende streambasierte Gegenstückmethode mit dem Präfix `watch*`, wie folgt:

- Öffentliche API
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
- Private API
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
- REST-Alternativen
  - `fetchTrades` → `fetchTradesWs`
  - `createOrder` → `createOrderWs`
  - `editOrder` → `editOrderWs`
  - `cancelOrder` → `cancelOrderWs`
  - `cancelOrders` → `cancelOrdersWs`
  - `cancelAllOrders` → `cancelAllOrdersWs`
  - usw. ...
- unWatch (beendet Hintergrund-Abonnements für `watch`-Methoden)
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

Die einheitliche CCXT Pro Streaming-API übernimmt CCXT-Verwendungsmuster, um die Migration zu erleichtern.

Der allgemeine asynchrone Ablauf für eine CCXT Pro-Anwendung (im Gegensatz zu einer CCXT-Anwendung oben) ist unten dargestellt:

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

Dieses Verwendungsmuster wird üblicherweise in eine zentrale Geschäftslogik-Methode namens _„eine `tick()`-Funktion"_ eingebettet, da sie eine Reaktion auf eingehende Ereignisse (auch _Ticks_ genannt) wiederholt. Aus den beiden obigen Beispielen wird deutlich, dass das generische Verwendungsmuster in CCXT Pro und CCXT identisch ist.

Viele der CCXT-Regeln und -Konzepte gelten auch für CCXT Pro:

- CCXT Pro lädt Märkte und speichert diese beim ersten Aufruf einer einheitlichen API-Methode im Cache
- CCXT Pro ruft bei Bedarf intern CCXT RESTful-Methoden auf
- CCXT Pro wirft bei Bedarf Standard-CCXT-Ausnahmen
- ...

## Streaming-Besonderheiten

Trotz der zahlreichen Gemeinsamkeiten haben streamingbasierte APIs aufgrund ihrer verbindungsbasierten Natur eigene Besonderheiten.

Ein verbindungsbasiertes Interface erfordert Mechanismen zur Verbindungsverwaltung. Verbindungen werden von CCXT Pro transparent für den Benutzer verwaltet. Jede Börseninstanz verwaltet ihre eigene Gruppe von Verbindungen.

Beim ersten Aufruf einer `watch*()`-Methode stellt die Bibliothek eine Verbindung zu einem bestimmten Stream/einer bestimmten Ressource der Börse her und hält diese aufrecht. Wenn die Verbindung bereits besteht, wird sie wiederverwendet. Die Bibliothek verarbeitet die Abonnement-Anfrage-/Antwort-Nachrichtensequenzen sowie die Authentifizierung/Signierung, sofern der angeforderte Stream privat ist.

Die Bibliothek überwacht auch den Status der Uplink-Verbindung und hält die Verbindung aufrecht. Bei einer kritischen Ausnahme, einer Trennung oder einem Verbindungstimeout/-fehler ruft die nächste Iteration der Tick-Funktion die `watch`-Methode auf, die eine Neuverbindung auslöst. Auf diese Weise behandelt die Bibliothek Trennungen und Neuverbindungen transparent für den Benutzer. CCXT Pro wendet die erforderliche Ratenbegrenzung und exponentiell ansteigende Wartezeiten bei der Neuverbindung an. All diese Funktionalität ist standardmäßig aktiviert und kann über Börseneigenschaften konfiguriert werden, wie gewohnt.

Die meisten Börsen haben nur eine einzige Basis-URL für Streaming-APIs (in der Regel WebSocket, beginnend mit `ws://` oder `wss://`). Einige können mehr als eine URL pro Stream haben, je nach dem betreffenden Feed.

Streaming-APIs von Börsen lassen sich in zwei verschiedene Kategorien einteilen:

- *sub* oder *subscribe* erlaubt nur Empfang
- *pub* oder *publish* erlaubt Senden und Empfangen

### Sub

Ein *sub*-Interface erlaubt es in der Regel, einen Datenstrom zu abonnieren und auf diesen zu hören. Die meisten Börsen, die WebSockets unterstützen, bieten nur einen *sub*-API-Typ an. Der *sub*-Typ umfasst das Streamen öffentlicher Marktdaten. Manchmal erlauben Börsen auch das Abonnieren privater Benutzerdaten. Nachdem der Benutzer einen Datenfeed abonniert hat, beginnt der Kanal effektiv einseitig zu arbeiten und sendet kontinuierlich Updates von der Börse an den Benutzer.

Häufig vorkommende Arten öffentlicher Datenströme:

- Orderbuch (am häufigsten) – Updates zu hinzugefügten, bearbeiteten und gelöschten Orders (auch *Change-Deltas* genannt)
- Ticker-Updates bei Änderung der 24-Stunden-Statistiken
- Fills-Feed (ebenfalls häufig) – ein Live-Stream öffentlicher Trades
- OHLCV-Kerzenfeed
- Heartbeat
- Börsen-Chat/Trollbox

Weniger häufige Arten privater Benutzerdatenströme:

- der Stream privater Trades des Benutzers
- Live-Order-Updates
- Kontostand-Updates
- benutzerdefinierte Streams
- börsenspezifische und andere Streams

### Pub

Ein *pub*-Interface erlaubt es Benutzern in der Regel, Datenanfragen an den Server zu senden. Dies umfasst üblicherweise gängige Benutzeraktionen wie:

- Orders aufgeben
- Orders stornieren
- Auszahlungsanfragen stellen
- Chat-/Trollbox-Nachrichten posten
- usw.

**Einige Börsen bieten keine *pub* WS-API an, sondern nur eine *sub* WS-API.** Es gibt jedoch Börsen, die auch eine vollständige Streaming-API anbieten. In den meisten Fällen kann ein Benutzer nicht effektiv operieren, wenn nur die Streaming-API vorhanden ist. Börsen streamen öffentliche Marktdaten über *sub*, und die REST-API wird weiterhin für den *pub*-Teil benötigt, wo dieser fehlt.

### unWatch

Jede `watchX`-Methode richtet ein Abonnement mit einem Stream ein und erhält kontinuierlich Updates von der Börse. Auch wenn Sie aufhören, den Rückgabewert der `watchX`-Methode abzurufen, sendet der Stream weiterhin Daten, die im Hintergrund verarbeitet und gespeichert werden. Um diese Hintergrund-Abonnements zu beenden, sollten Sie die `unWatch`-Methode verwenden (z. B. `watchTrades` -> `unWatchTrades`).

### Inkrementelle Datenstrukturen

In vielen Fällen muss die auf der Client-Seite lauschende Anwendung aufgrund der unidirektionalen Natur der zugrundeliegenden Datenfeeds einen lokalen Snapshot der Daten im Speicher halten und die von der Börse empfangenen Updates in den lokalen Snapshot einarbeiten. Die von der Börse eingehenden Updates werden auch häufig als _Deltas_ bezeichnet, da diese Updates in den meisten Fällen nur die Änderungen zwischen zwei Datenzuständen enthalten und keine unveränderten Daten beinhalten, was das lokale Caching des aktuellen Zustands S aller relevanten Datenobjekte erforderlich macht.

All diese Funktionalität wird von CCXT Pro für den Benutzer übernommen. Um mit CCXT Pro zu arbeiten, muss der Benutzer keine Abonnements und zugehörigen Daten verfolgen oder verwalten. CCXT Pro hält einen Cache von Strukturen im Speicher, um den zugrundeliegenden Aufwand zu bewältigen.

Jedes eingehende Update gibt an, welche Teile der Daten sich geändert haben, und die Empfängerseite „inkrementiert" den lokalen Zustand S, indem sie das Update auf den aktuellen Zustand S anwendet und zum nächsten lokalen Zustand S' übergeht. Im Sinne von CCXT Pro wird dies als _„inkrementeller Zustand"_ bezeichnet, und die Strukturen, die am Prozess des Speicherns und Aktualisierens des gecachten Zustands beteiligt sind, werden als _„inkrementelle Strukturen"_ bezeichnet. CCXT Pro führt mehrere neue Basisklassen ein, um den inkrementellen Zustand bei Bedarf zu behandeln.

Die inkrementellen Strukturen, die von den einheitlichen Methoden von CCXT Pro zurückgegeben werden, sind häufig einer von zwei Typen:

1. JSON-dekodiertes Objekt (`object` in JavaScript, `dict` in Python, `array()` in PHP). Dieser Typ kann von öffentlichen und privaten Methoden wie `watchOrderBook`, `watchTicker`, `watchBalance`, `watchOrder` usw. zurückgegeben werden.
2. Ein Array/eine Liste von Objekten (üblicherweise in chronologischer Reihenfolge sortiert). Dieser Typ kann von Methoden wie `watchOHLCV`, `watchTrades`, `watchMyTrades`, `watchOrders` usw. zurückgegeben werden.

Die einheitlichen Methoden, die Arrays zurückgeben, wie `watchOHLCV`, `watchTrades`, `watchMyTrades`, `watchOrders`, basieren auf der Caching-Schicht. Der Benutzer muss die innere Funktionsweise der Caching-Schicht verstehen, um effizient damit arbeiten zu können.

Der Cache ist eine Deque (Double-Ended Queue) mit fester Größe, also ein Array/eine Liste mit zwei Enden. Die CCXT Pro-Bibliothek hat ein vernünftiges Limit für die Anzahl der im Speicher gespeicherten Objekte. Standardmäßig speichern die Caching-Array-Strukturen bis zu 1000 Einträge jedes Typs (1000 neueste Trades, 1000 neueste Kerzen, 1000 neueste Orders). Die zulässige Höchstanzahl kann vom Benutzer bei der Instanziierung oder später konfiguriert werden:

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

Die Cache-Limits müssen vor dem Aufruf von Watch-Methoden gesetzt werden und können während eines Programmlaufs nicht geändert werden.

Wenn noch Platz im Cache vorhanden ist, werden neue Elemente einfach an dessen Ende angehängt. Wenn nicht genügend Platz für ein neues Element vorhanden ist, wird das älteste Element vom Anfang des Caches gelöscht, um Platz zu schaffen. So wächst der Cache beispielsweise von 0 auf 1000 neueste Trades und verbleibt dann bei maximal 1000 neuesten Trades, wobei die gespeicherten Daten mit jedem neuen Update von der Börse kontinuierlich erneuert werden. Es erinnert an ein gleitendes Rahmenfenster oder eine Schiebetür, die wie unten dargestellt aussieht:

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

Der Benutzer kann die Cache-Limits über `exchange.options` konfigurieren, wie oben gezeigt. Verwechseln Sie die Cache-Limits nicht mit dem Paginierungslimit.

**Beachten Sie, dass die Parameter `since` und `limit` der [datumsbasierten Paginierung](/docs/manual#date-based-pagination) eine andere Bedeutung haben und immer innerhalb des gecachten Fensters angewendet werden!** Wenn der Benutzer ein `since`-Argument beim Aufruf von `watchTrades()` angibt, gibt CCXT Pro alle gecachten Trades mit `timestamp >= since` zurück. Wenn der Benutzer kein `since`-Argument angibt, gibt CCXT Pro gecachte Trades ab dem Anfang des gleitenden Fensters zurück. Wenn der Benutzer ein `limit`-Argument angibt, gibt die Bibliothek bis zu `limit` Kerzen ab `since` oder ab dem Anfang des Caches zurück. Aus diesem Grund kann der Benutzer aufgrund der WebSocket-Echtzeitspezifika nicht über den gecachten Rahmen hinaus paginieren.

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

#### newUpdates-Modus

Wenn Sie immer nur den aktuellsten Trade erhalten möchten, **sollten Sie die Exchange mit dem auf true gesetzten newUpdates-Flag instanziieren**.

```python
exchange = ccxtpro.binance({'newUpdates': True})
while True:
    trades = await exchange.watchTrades (symbol)
    print(trades)
```

Der newUpdates-Modus nutzt im Hintergrund weiterhin den gleitenden Cache, jedoch werden dem Benutzer nur die neuen Aktualisierungen geliefert. Dies liegt daran, dass einige Exchanges inkrementelle Strukturen verwenden, weshalb wir einen Cache von Objekten vorhalten müssen, da die Exchange möglicherweise nur Teilinformationen wie Statusaktualisierungen liefert.

Das Ergebnis aus dem newUpdates-Modus enthält eine oder mehrere Aktualisierungen, die seit dem letzten Auflösen von `exchange.watchMethod` aufgetreten sind. CCXT Pro kann eine oder mehrere Orders zurückgeben, die seit dem vorherigen Aufruf aktualisiert wurden. Das Ergebnis des Aufrufs von `exchange.watchOrders` sieht wie folgt aus:

```javascript
[
    order, // see /docs/manual#order-structure
    order,
    order,
    ...
]
```

*Hinweis zur Veraltung*: In Zukunft wird `newUpdates: true` der Standardmodus sein, und Sie müssen newUpdates auf false setzen, um den gleitenden Cache zu erhalten.

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


Das importierte CCXT Pro-Modul kapselt CCXT in sich selbst – jede über CCXT Pro instanziierte Exchange verfügt über alle CCXT-Methoden sowie die zusätzliche Funktionalität.

## Instanziierung

CCXT Pro ist für die async/await-Syntax ausgelegt und stützt sich stark auf asynchrone Primitiven wie *Promises* und *Futures*.

Das Erstellen einer CCXT Pro Exchange-Instanz ist nahezu identisch mit dem Erstellen einer CCXT Exchange-Instanz.


```javascript tab="JavaScript"
const ccxt = require ('ccxt').pro
const exchange = new ccxtpro.binance ({ newUpdates: false })
```

#### **Python**

Die Python-Implementierung von CCXT Pro basiert auf dem eingebauten [asyncio](https://docs.python.org/3/library/asyncio.html) und insbesondere auf der [Event Loop](https://docs.python.org/3/library/asyncio-eventloop.html). In Python ist es möglich, eine asyncio Event-Loop-Instanz als Konstruktorargument zu übergeben, wie unten gezeigt (identisch mit `ccxt.async support`):

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

In PHP werden die asynchronen Primitiven von [ReactPHP](https://reactphp.org) übernommen. Die PHP-Implementierung von CCXT Pro basiert insbesondere auf [Promise](https://github.com/reactphp/promise) und [EventLoop](https://github.com/reactphp/event-loop). In PHP muss der Benutzer eine ReactPHP Event-Loop-Instanz als Konstruktorargument übergeben, wie unten gezeigt:

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


## Exchange-Eigenschaften

Jede CCXT Pro-Instanz enthält alle Eigenschaften der zugrundeliegenden CCXT-Instanz. Neben den Standard-CCXT-Eigenschaften enthält die CCXT Pro-Instanz folgende zusätzliche Eigenschaften:

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

## Unified API

Die Unified CCXT Pro API fördert direkten Kontrollfluss für besseren Codestil, besser lesbaren und architektonisch überlegenen Code im Vergleich zur Verwendung von EventEmittern und Callbacks. Letzteres gilt heute als veralteter Ansatz, da es eine Umkehrung der Kontrolle erfordert (Menschen sind an umgekehrtes Denken nicht gewöhnt).

CCXT Pro verfolgt den modernen Ansatz und ist für die async-Syntax konzipiert. Intern muss CCXT Pro aufgrund der Abhängigkeiten und WebSocket-Bibliotheken, die keine andere Möglichkeit haben, manchmal noch auf umgekehrten Kontrollfluss zurückgreifen.

Das gilt nicht nur für JS/ES6, sondern auch für asynchronen Python-3-Code. In PHP werden die asynchronen Primitiven von [ReactPHP](https://reactphp.org/) übernommen.

Moderne async-Syntax erlaubt es, die Ausführung in parallele Pfade aufzuteilen und anschließend zusammenzuführen, zu gruppieren, zu priorisieren und vieles mehr. Mit Promises lässt sich problemlos zwischen direktem async-Kontrollfluss und invertiertem Callback-Kontrollfluss hin und her wechseln.

### Echtzeit- vs. Drosselungsmodus

CCXT Pro unterstützt zwei Modi für Tick-Funktionsschleifen – den Echtzeitmodus und den Drosselungsmodus. Beide werden unten in Pseudocode dargestellt:

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

Im **Echtzeitmodus** gibt CCXT Pro das Ergebnis zurück, sobald jedes neue Delta von der Exchange eintrifft. Die allgemeine Logik eines einheitlichen Aufrufs in einer Echtzeit-Schleife besteht darin, auf das nächste Delta zu warten und das einheitliche Ergebnis sofort und immer wieder an den Benutzer zurückzugeben. Dies ist nützlich, wenn die Reaktionszeit entscheidend ist oder so schnell wie möglich sein muss.

Der Echtzeitmodus erfordert jedoch Programmiererfahrung mit asynchronen Abläufen, wenn es darum geht, mehrere parallele Tick-Schleifen zu synchronisieren. Darüber hinaus können Exchanges in Phasen hoher Aktivität oder hoher Volatilität eine sehr große Anzahl von Aktualisierungen streamen. Der Entwickler eines Echtzeit-Algorithmus muss daher sicherstellen, dass der Userland-Code in der Lage ist, diese Daten so schnell zu verarbeiten. Das Arbeiten im Echtzeitmodus kann manchmal ressourcenintensiver sein.

Im **Drosselungsmodus** empfängt und verwaltet CCXT Pro die Daten im Hintergrund. Der Benutzer ist dafür verantwortlich, die Ergebnisse bei Bedarf gelegentlich abzurufen. Die allgemeine Logik der Drosselungsschleife besteht darin, die meiste Zeit zu schlafen und gelegentlich aufzuwachen, um die Ergebnisse zu überprüfen. Dies geschieht in der Regel mit einer festen Frequenz oder _„Bildrate"_. Der Code innerhalb einer Drosselungsschleife lässt sich oft leichter über mehrere Exchanges hinweg synchronisieren. Die Rationierung der in einer gedrosselten Schleife verbrachten Zeit trägt auch dazu bei, den Ressourcenverbrauch auf ein Minimum zu reduzieren. Dies ist praktisch, wenn Ihr Algorithmus aufwändig ist und Sie die Ausführung präzise steuern möchten, um eine zu häufige Ausführung zu vermeiden.

Der offensichtliche Nachteil des Drosselungsmodus ist eine geringere Reaktionsfähigkeit auf Aktualisierungen. Wenn ein Handelsalgorithmus eine bestimmte Anzahl von Millisekunden warten muss, bevor er ausgeführt wird, können ein oder zwei Aktualisierungen früher eintreffen, als diese Zeit abläuft. Im Drosselungsmodus prüft der Benutzer diese Aktualisierungen erst beim nächsten Aufwachen (Schleifeniteration), sodass die Reaktionsverzögerung im Laufe der Zeit innerhalb einer bestimmten Anzahl von Millisekunden variieren kann.

## Öffentliche Methoden

### watchOrderBook

Die Schnittstelle von `watchOrderBook` ist identisch mit [fetchOrderBook](/docs/manual#order-book). Sie akzeptiert drei Argumente:

- `symbol` – String, ein einheitliches CCXT-Symbol, erforderlich
- `limit` – Integer, die maximale Anzahl zurückgegebener Geld-/Briefkurse, optional
- `params` – assoziatives Dictionary, optionale Überschreibungen wie unter [Overriding Unified API Params](/docs/manual#overriding-unified-api-params) beschrieben

Im Allgemeinen lassen sich Exchanges in zwei Kategorien einteilen:

1. Exchanges, die begrenzte Orderbücher unterstützen (nur den oberen Teil des Orderstapels streamen)
2. Exchanges, die ausschließlich vollständige Orderbücher streamen

Wenn die Exchange ein Begrenzungsargument akzeptiert, wird das `limit`-Argument beim Abonnieren des Orderbuch-Streams über eine WebSocket-Verbindung an die Exchange gesendet. Die Exchange sendet dann nur die angegebene Anzahl von Orders, was dazu beiträgt, den Datenverkehr zu reduzieren. Einige Exchanges akzeptieren möglicherweise nur bestimmte Werte für `limit`, wie 10, 25, 50, 100 usw.

Wenn die zugrundeliegende Exchange kein Begrenzungsargument akzeptiert, erfolgt die Begrenzung auf der Client-Seite.

Das `limit`-Argument garantiert nicht, dass die Anzahl der Geld- oder Briefkurse immer gleich `limit` ist. Es bezeichnet die Obergrenze oder das Maximum, sodass zu einem bestimmten Zeitpunkt weniger als `limit` Geld- oder Briefkurse vorhanden sein können, jedoch niemals mehr als `limit`. Dies ist der Fall, wenn die Exchange nicht genügend Orders im Orderbuch hat oder wenn eine der obersten Orders im Orderbuch gehandelt und aus dem Orderbuch entfernt wird, wodurch auf der Geld- oder Briefkursseite weniger als `limit` Einträge verbleiben. Der freie Platz im Orderbuch wird in der Regel schnell mit neuen Daten gefüllt.

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

Ähnlich wie `watchOrderBook`, akzeptiert jedoch ein Array von Symbolen, sodass Sie mehrere Orderbücher in einer einzigen Nachricht abonnieren können.


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
Einige Exchanges erlauben verschiedene Topics zum Beobachten von Tickern (z. B.: bookTicker). Dies kann in `exchange.options['watchTicker']['name']` eingestellt werden.
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

Ein weit verbreitetes Missverständnis über WebSockets ist, dass WS-OHLCV-Streams eine Handelsstrategie irgendwie beschleunigen können.
Wenn der Zweck Ihrer Anwendung darin besteht, OHLCV-Handel oder eine spekulative algorithmische Strategie zu implementieren, **beachten Sie Folgendes sorgfältig**.

Im Allgemeinen gibt es zwei Arten von Handelsdaten, die in Algorithmen verwendet werden:

- Erstrangige Echtzeit-Daten wie Orderbücher und Trades
- Zweitrangige nicht-Echtzeit-Daten wie Ticker, OHLCVs usw.

Wenn Entwickler von _„Echtzeit"_ sprechen, meinen sie damit in der Regel Pseudo-Echtzeit oder, einfach ausgedrückt, _„so schnell und so nah an Echtzeit wie möglich"_.

Die zweitrangigen Daten werden **immer** aus den erstrangigen Daten berechnet. OHLCVs werden aus aggregierten Trades berechnet. Ticker werden aus Trades und Orderbüchern berechnet.

Einige Exchanges berechnen OHLCVs (zweitrangige Daten) für Sie auf der Exchange-Seite und senden Ihnen Aktualisierungen über WS (Binance). Andere Exchanges halten das aus gutem Grund nicht für notwendig.

Offensichtlich braucht die Berechnung zweitrangiger OHLCV-Kerzen aus Trades Zeit. Darüber hinaus braucht auch das Zurücksenden der berechneten Kerze an alle verbundenen Benutzer Zeit. Zusätzliche Verzögerungen können in Phasen hoher Volatilität auftreten, wenn eine Exchange bei hoher Last sehr aktiv gehandelt wird.

Es gibt keine strikte Garantie dafür, wie lange es dauert, bis die Exchange die zweitrangigen Daten berechnet und über WS an Sie überträgt. Die Verzögerungen bei OHLCV-Kerzen können von Exchange zu Exchange erheblich variieren. Beispielsweise kann eine Exchange eine OHLCV-Aktualisierung ~30 Sekunden nach dem tatsächlichen Schließen eines entsprechenden Zeitraums senden. Andere Exchanges können die aktuellen OHLCV-Aktualisierungen in regelmäßigen Abständen senden (z. B. einmal alle 100 ms), während Trades in der Realität viel häufiger stattfinden können.

Die meisten Menschen nutzen WS, um jegliche Art von Verzögerungen zu vermeiden und Echtzeit-Daten zu haben. In den meisten Fällen ist es daher viel besser, nicht auf die Exchange zu warten. Die eigene Neuberechnung der zweitrangigen Daten aus den erstrangigen Daten kann viel schneller sein und unnötige Verzögerungen reduzieren. Deshalb macht es wenig Sinn, WS nur zum Beobachten von OHLCV-Kerzen von der Exchange zu verwenden. Entwickler würden eher `watch_trades()` verwenden und die OHLCV-Kerzen mit den eingebauten CCXT-Methoden wie `build_ohlcvc()` neu berechnen.

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

Das erklärt, warum einige Exchanges vernünftigerweise der Meinung sind, dass OHLCVs im WS-Kontext nicht notwendig sind, da Benutzer diese Informationen im Userland viel schneller berechnen können, wenn sie nur einen WS-Stream von Echtzeit-erstrangigen Trades haben.

Wenn Ihre Anwendung nicht sehr zeitkritisch ist, können Sie sich dennoch für charttechnische Zwecke bei OHLCV-Streams anmelden. Wenn die zugrundeliegende `exchange.has['watchOHLCV']` gesetzt ist, können Sie `watchOHLCV()/watch_ohlcv()` wie folgt verwenden:


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

Ähnlich wie `watchOHLCV`, ermöglicht jedoch mehrere Abonnements von Symbolen und Zeitrahmen

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

Ähnlich wie `watchTrades`, ermöglicht jedoch das Abonnieren mehrerer Symbole in einem einzigen Aufruf.


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


## Private Methoden

In den meisten Fällen wird die Authentifizierungslogik von CCXT übernommen, da die Exchanges dieselben Schlüsselpaare und Signaturalgorithmen für REST-APIs und WebSocket-APIs verwenden. Weitere Details finden Sie unter [API Keys Setup](/docs/manual#api-keys-setup).

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
Beobachtet alle offenen Positionen und gibt eine Liste von [Positions-Strukturen](/docs/manual#position-structure) zurück


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

### Benutzerdefinierter Handler

Wenn Sie Zugriff auf eingehende Rohnachrichten haben und eigene Handler verwenden möchten, können Sie die `handleMessage/handle_message`-Methode der Börse überschreiben, zum Beispiel:

A) Durch Vererbung:


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


B) Durch Überschreiben der Methode:


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


### Fehlerbehandlung

Im Fehlerfall wirft CCXT Pro eine Standard-CCXT-Ausnahme. Weitere Details finden Sie unter [Fehlerbehandlung](/docs/index#error-handling).
