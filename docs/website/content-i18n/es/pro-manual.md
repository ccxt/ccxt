---
title: "Manual de CCXT Pro"
description: "CCXT Pro es una parte gratuita de CCXT que añade soporte para streaming WebSocket: https://github.com/ccxt/ccxt/issues/15171"
---

# Manual

CCXT Pro es una parte gratuita de CCXT que añade soporte para streaming WebSocket: https://github.com/ccxt/ccxt/issues/15171

La pila de CCXT Pro está construida sobre [CCXT](https://ccxt.com) y extiende las clases principales de CCXT, utilizando:

- Mixins a nivel de prototipo en JavaScript
- Herencia múltiple en Python
- Traits en PHP
- Herencia de clases en Java (las clases de exchange pro extienden las clases base de exchange)

CCXT Pro depende en gran medida del transpilador de CCXT para el [soporte multilenguaje](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support).

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

## Exchanges
<!--- init list -->La biblioteca CCXT Pro actualmente soporta los siguientes 74 mercados de criptomonedas y APIs de trading WebSocket:

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
Esta es la lista de exchanges en CCXT Pro con soporte para APIs WebSockets. Esta lista se actualizará con nuevos exchanges de forma periódica.

Lista completa de exchanges disponibles en CCXT vía REST: [Mercados de intercambio de criptomonedas compatibles](https://github.com/ccxt/ccxt/#supported-cryptocurrency-exchange-markets).

## Uso

```diff
- this part of the doc is under heavy development right now
- there may be some typos, mistakes and missing info here and there
- contributions, pull requests and feedback appreciated
```

## Requisitos previos

La mejor manera de entender CCXT Pro es asegurarse de comprender todo el Manual de CCXT y practicar primero con CCXT estándar. CCXT Pro toma prestado de CCXT. Ambas bibliotecas comparten muchos puntos en común, entre ellos:

- los conceptos de API pública y API privada autenticada
- mercados, símbolos, códigos e identificadores de divisas
- estructuras y formatos de datos unificados, libros de órdenes, operaciones, órdenes, velas, marcos temporales, ...
- excepciones y mapeos de errores
- autenticación y claves de API (para feeds y llamadas privadas)
- opciones de configuración

El público objetivo de CCXT Pro está compuesto principalmente por traders algorítmicos profesionales y desarrolladores. Para trabajar de manera eficiente con esta biblioteca, el usuario debe estar bien familiarizado con los conceptos de streaming. Es necesario comprender las diferencias subyacentes entre las APIs de streaming basadas en conexión ([WebSocket](https://en.wikipedia.org/wiki/WebSocket), CCXT Pro) y las APIs basadas en solicitud-respuesta ([REST](https://en.wikipedia.org/wiki/Representational_state_transfer), CCXT).

El flujo general de estilo asíncrono para una aplicación CCXT es el siguiente:

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

En CCXT Pro, cada método RESTful unificado público y privado que tiene un prefijo `fetch*` también tiene un método homólogo basado en streams con el prefijo `watch*`, como se muestra a continuación:

- API pública
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
- API privada
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
- Alternativas REST
  - `fetchTrades` → `fetchTradesWs`
  - `createOrder` → `createOrderWs`
  - `editOrder` → `editOrderWs`
  - `cancelOrder` → `cancelOrderWs`
  - `cancelOrders` → `cancelOrdersWs`
  - `cancelAllOrders` → `cancelAllOrdersWs`
  - etc ...
- unWatch (detiene la suscripción en segundo plano para los métodos con `watch`)
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

La API de Streaming Unificada de CCXT Pro hereda los patrones de uso de CCXT para facilitar la migración.

El flujo general de estilo asíncrono para una aplicación CCXT Pro (en contraposición a una aplicación CCXT descrita anteriormente) se muestra a continuación:

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

Ese patrón de uso generalmente se encapsula en un método de lógica de negocio central llamado _"función `tick()`"_, ya que reitera una reacción a los eventos entrantes (también conocidos como _ticks_). De los dos ejemplos anteriores es evidente que el patrón de uso genérico en CCXT Pro y CCXT es idéntico.

Muchas de las reglas y conceptos de CCXT también se aplican a CCXT Pro:

- CCXT Pro cargará los mercados y los almacenará en caché en la primera llamada a un método de API unificado
- CCXT Pro llamará a los métodos RESTful de CCXT de forma interna cuando sea necesario
- CCXT Pro lanzará las excepciones estándar de CCXT cuando sea necesario
- ...

## Especificidades del Streaming

A pesar de las numerosas similitudes, las APIs basadas en streaming tienen sus propias particularidades debido a su naturaleza orientada a conexiones.

Contar con una interfaz basada en conexión implica mecanismos de gestión de conexiones. CCXT Pro gestiona las conexiones de forma transparente para el usuario. Cada instancia de exchange gestiona su propio conjunto de conexiones.

En la primera llamada a cualquier método `watch*()`, la biblioteca establecerá una conexión a un stream/recurso específico del exchange y la mantendrá. Si la conexión ya existe, se reutiliza. La biblioteca gestionará las secuencias de mensajes de solicitud/respuesta de suscripción, así como la autenticación/firma si el stream solicitado es privado.

La biblioteca también monitorizará el estado del enlace y mantendrá la conexión activa. Ante una excepción crítica, una desconexión o un tiempo de espera/fallo de conexión, la siguiente iteración de la función tick llamará al método `watch`, que activará una reconexión. De este modo, la biblioteca gestiona las desconexiones y reconexiones para el usuario de forma transparente. CCXT Pro aplica la limitación de velocidad necesaria y los retrasos de reconexión con retroceso exponencial. Toda esa funcionalidad está habilitada por defecto y puede configurarse a través de las propiedades del exchange, como de costumbre.

La mayoría de los exchanges solo tienen una URL base única para las APIs de streaming (habitualmente WebSocket, que comienza con `ws://` o `wss://`). Algunos pueden tener más de una URL por cada stream, dependiendo del feed en cuestión.

Las APIs de Streaming de los exchanges pueden clasificarse en dos categorías diferentes:

- *sub* o *subscribe* permite solo recibir datos
- *pub* o *publish* permite enviar y recibir datos

### Sub

Una interfaz *sub* generalmente permite suscribirse a un flujo de datos y escucharlo. La mayoría de los exchanges que soportan WebSockets solo ofrecerán una API de tipo *sub*. El tipo *sub* incluye el streaming de datos públicos de mercado. A veces los exchanges también permiten suscribirse a datos privados del usuario. Una vez que el usuario se suscribe a un feed de datos, el canal comienza a funcionar de forma unidireccional, enviando actualizaciones del exchange al usuario de manera continua.

Tipos de streams de datos públicos más habituales:

- libro de órdenes (el más común) - actualizaciones sobre órdenes añadidas, editadas y eliminadas (también conocidas como *deltas de cambio*)
- actualizaciones del ticker al cambiar las estadísticas de 24 horas
- feed de ejecuciones (también común) - un stream en tiempo real de operaciones públicas
- feed de velas ohlcv
- heartbeat
- chat/trollbox del exchange

Tipos menos comunes de streams de datos privados del usuario:

- el stream de operaciones privadas del usuario
- actualizaciones de órdenes en tiempo real
- actualizaciones de saldo
- streams personalizados
- streams específicos del exchange y otros

### Pub

Una interfaz *pub* generalmente permite a los usuarios enviar solicitudes de datos al servidor. Esto normalmente incluye acciones comunes del usuario, como:

- colocar órdenes
- cancelar órdenes
- realizar solicitudes de retiro
- publicar mensajes en el chat/trollbox
- etc

**Algunos exchanges no ofrecen una API WS de tipo *pub*, solo ofrecerán una API WS de tipo *sub*.** Sin embargo, existen exchanges que también disponen de una API de Streaming completa. En la mayoría de los casos, un usuario no puede operar de forma efectiva disponiendo únicamente de la API de Streaming. Los exchanges transmitirán datos públicos de mercado mediante *sub*, y la API REST sigue siendo necesaria para la parte *pub* cuando esta falta.

### unWatch

Cada método `watchX` establece una suscripción con un stream y recibirá actualizaciones continuas del exchange. Aunque dejes de obtener el valor de retorno del método `watchX`, el stream seguirá enviando datos, los cuales son gestionados y almacenados en segundo plano. Para detener esas suscripciones en segundo plano, debes usar el método `unWatch` (p. ej. `watchTrades` -> `unWatchTrades`).

### Estructuras de Datos Incrementales

En muchos casos, debido a la naturaleza unidireccional de los feeds de datos subyacentes, la aplicación que escucha en el lado del cliente debe mantener una instantánea local de los datos en memoria y combinar las actualizaciones recibidas del servidor del exchange con la instantánea local. Las actualizaciones que provienen del exchange también se denominan frecuentemente _deltas_, porque en la mayoría de los casos solo contendrán los cambios entre dos estados de los datos y no incluirán los datos que no han cambiado, lo que hace necesario almacenar el estado actual S en caché localmente de todos los objetos de datos relevantes.

Toda esa funcionalidad es gestionada por CCXT Pro para el usuario. Para trabajar con CCXT Pro, el usuario no tiene que rastrear ni gestionar suscripciones ni los datos relacionados. CCXT Pro mantendrá una caché de estructuras en memoria para gestionar la complejidad subyacente.

Cada actualización entrante indica qué partes de los datos han cambiado y el lado receptor "incrementa" el estado local S combinando la actualización sobre el estado actual S y pasando al siguiente estado local S'. En términos de CCXT Pro, esto se denomina _"estado incremental"_ y las estructuras involucradas en el proceso de almacenamiento y actualización del estado en caché se denominan _"estructuras incrementales"_. CCXT Pro introduce varias nuevas clases base para gestionar el estado incremental cuando es necesario.

Las estructuras incrementales devueltas por los métodos unificados de CCXT Pro son generalmente de uno de dos tipos:

1. Objeto decodificado en JSON (`object` en JavaScript, `dict` en Python, `array()` en PHP). Este tipo puede devolverse desde métodos públicos y privados como `watchOrderBook`, `watchTicker`, `watchBalance`, `watchOrder`, etc.
2. Un array/lista de objetos (generalmente ordenados cronológicamente). Este tipo puede devolverse desde métodos como `watchOHLCV`, `watchTrades`, `watchMyTrades`, `watchOrders`, etc.

Los métodos unificados que devuelven arrays como `watchOHLCV`, `watchTrades`, `watchMyTrades`, `watchOrders`, se basan en la capa de caché. El usuario debe comprender el funcionamiento interno de la capa de caché para trabajar con ella de manera eficiente.

La caché es una cola de doble extremo de tamaño fijo, también conocida como array/lista. La biblioteca CCXT Pro tiene un límite razonable en el número de objetos almacenados en memoria. Por defecto, las estructuras de array en caché almacenarán hasta 1000 entradas de cada tipo (las 1000 operaciones más recientes, las 1000 velas más recientes, las 1000 órdenes más recientes). El número máximo permitido puede ser configurado por el usuario en el momento de la instanciación o posteriormente:

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

Los límites de caché deben establecerse antes de llamar a cualquier método watch y no pueden cambiar durante la ejecución del programa.

Cuando hay espacio disponible en la caché, los nuevos elementos se añaden simplemente al final. Si no hay suficiente espacio para un nuevo elemento, el elemento más antiguo se elimina del principio de la caché para liberar espacio. Así, por ejemplo, la caché crece de 0 a 1000 operaciones más recientes y luego se mantiene en un máximo de 1000 operaciones más recientes, renovando constantemente los datos almacenados con cada nueva actualización que llega del exchange. Se asemeja a una ventana deslizante o una puerta corredera, que se muestra a continuación:

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

El usuario puede configurar los límites de caché usando `exchange.options` como se mostró anteriormente. No confundas los límites de caché con el límite de paginación.

**Ten en cuenta que los parámetros `since` y `limit` de [paginación basada en fechas](/docs/manual#date-based-pagination) tienen un significado diferente y siempre se aplican dentro de la ventana en caché.** Si el usuario especifica un argumento `since` en la llamada a `watchTrades()`, CCXT Pro devolverá todas las operaciones en caché con `timestamp >= since`. Si el usuario no especifica un argumento `since`, CCXT Pro devolverá las operaciones en caché desde el principio de la ventana deslizante. Si el usuario especifica un argumento `limit`, la biblioteca devolverá hasta `limit` velas comenzando desde `since` o desde el inicio de la caché. Por ese motivo, el usuario no puede paginar más allá del marco en caché debido a las especificidades en tiempo real de WebSocket.

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

#### Modo newUpdates

Si desea obtener siempre solo la operación más reciente, **debe instanciar el exchange con la bandera newUpdates establecida en true**.

```python
exchange = ccxtpro.binance({'newUpdates': True})
while True:
    trades = await exchange.watchTrades (symbol)
    print(trades)
```

El modo newUpdates sigue utilizando la caché deslizante en segundo plano, pero el usuario solo recibirá las nuevas actualizaciones. Esto se debe a que algunos exchanges utilizan estructuras incrementales, por lo que necesitamos mantener una caché de objetos ya que el exchange puede proporcionar únicamente información parcial, como actualizaciones de estado.

El resultado del modo newUpdates será una o más actualizaciones que hayan ocurrido desde la última vez que `exchange.watchMethod` se resolvió. CCXT Pro puede devolver una o más órdenes que se actualizaron desde la llamada anterior. El resultado de llamar a `exchange.watchOrders` tendrá el aspecto que se muestra a continuación:

```javascript
[
    order, // see /docs/manual#order-structure
    order,
    order,
    ...
]
```

*Aviso de obsolescencia*: en el futuro `newUpdates: true` será el modo predeterminado y tendrá que establecer newUpdates en false para obtener la caché deslizante.

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


El módulo CCXT Pro importado envuelve a CCXT dentro de sí mismo: cada exchange instanciado a través de CCXT Pro tiene todos los métodos de CCXT además de la funcionalidad adicional.

## Instanciación

CCXT Pro está diseñado para la sintaxis async/await y depende en gran medida de primitivas asíncronas como las *promesas* y los *futuros*.

Crear una instancia de exchange de CCXT Pro es prácticamente idéntico a crear una instancia de exchange de CCXT.


```javascript tab="JavaScript"
const ccxt = require ('ccxt').pro
const exchange = new ccxtpro.binance ({ newUpdates: false })
```

#### **Python**

La implementación en Python de CCXT Pro se basa en el módulo integrado [asyncio](https://docs.python.org/3/library/asyncio.html) y en particular en el [Event Loop](https://docs.python.org/3/library/asyncio-eventloop.html). En Python es posible suministrar una instancia del bucle de eventos de asyncio en los argumentos del constructor como se muestra a continuación (idéntico a `ccxt.async support`):

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

En PHP las primitivas asíncronas se toman prestadas de [ReactPHP](https://reactphp.org). La implementación en PHP de CCXT Pro se basa en [Promise](https://github.com/reactphp/promise) y en [EventLoop](https://github.com/reactphp/event-loop) en particular. En PHP el usuario debe suministrar una instancia del bucle de eventos de ReactPHP en los argumentos del constructor como se muestra a continuación:

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


## Propiedades del Exchange

Cada instancia de CCXT Pro contiene todas las propiedades de la instancia CCXT subyacente. Además de las propiedades estándar de CCXT, la instancia de CCXT Pro incluye las siguientes:

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

## API Unificada

La API Unificada de CCXT Pro fomenta el flujo de control directo para lograr un mejor estilo de código, más legible y arquitectónicamente superior en comparación con el uso de EventEmitters y callbacks. Este último enfoque se considera obsoleto hoy en día, ya que requiere inversión del control (la gente no está acostumbrada al pensamiento invertido).

CCXT Pro adopta el enfoque moderno y está diseñado para la sintaxis asíncrona. Internamente, CCXT Pro aún tendrá que usar flujo de control invertido en ocasiones debido a las dependencias y las librerías WebSocket que no pueden hacer otra cosa.

Lo mismo aplica no solo para JS/ES6 sino también para el código asíncrono de Python 3. En PHP las primitivas asíncronas se toman prestadas de [ReactPHP](https://reactphp.org/).

La sintaxis asíncrona moderna permite combinar y dividir la ejecución en caminos paralelos para luego fusionarlos, agruparlos, priorizarlos y mucho más. Con las promesas se puede convertir fácilmente de un flujo de control de estilo asíncrono directo a un flujo de control de estilo callback invertido, y viceversa.

### Tiempo Real vs Limitación de Frecuencia

CCXT Pro admite dos modos de bucles de funciones de tick: el modo en tiempo real y el modo de limitación de frecuencia. Ambos se muestran a continuación en pseudocódigo:

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

En el **modo en tiempo real**, CCXT Pro devolverá el resultado tan pronto como llegue cada nuevo delta desde el exchange. La lógica general de una llamada unificada en un bucle en tiempo real consiste en esperar el siguiente delta y devolver inmediatamente la estructura de resultado unificada al usuario, una y otra vez. Esto es útil cuando el tiempo de reacción es crítico o debe ser lo más rápido posible.

Sin embargo, el modo en tiempo real requiere experiencia en programación con flujos asíncronos a la hora de sincronizar múltiples bucles de tick en paralelo. Además, los exchanges pueden transmitir un número muy elevado de actualizaciones durante períodos de alta actividad o alta volatilidad. Por ello, el usuario que desarrolla un algoritmo en tiempo real debe asegurarse de que el código en espacio de usuario sea capaz de consumir datos a esa velocidad. Trabajar en modo en tiempo real puede ser a veces más exigente en cuanto a recursos.

En el **modo de limitación de frecuencia**, CCXT Pro recibirá y gestionará los datos en segundo plano. El usuario es responsable de consultar los resultados de vez en cuando cuando sea necesario. La lógica general del bucle de limitación consiste en dormir la mayor parte del tiempo y despertar ocasionalmente para comprobar los resultados. Esto se hace normalmente a una frecuencia fija o, en otras palabras, a una _"tasa de fotogramas"_. El código dentro de un bucle de limitación suele ser más fácil de sincronizar entre múltiples exchanges. El racionamiento del tiempo invertido en un bucle con limitación también ayuda a reducir el uso de recursos al mínimo. Esto es práctico cuando su algoritmo es pesado y desea controlar la ejecución con precisión para evitar ejecutarlo con demasiada frecuencia.

La desventaja obvia del modo de limitación de frecuencia es ser menos reactivo o sensible a las actualizaciones. Cuando un algoritmo de trading tiene que esperar cierta cantidad de milisegundos antes de ejecutarse, puede llegar una o dos actualizaciones antes de que ese tiempo expire. En el modo de limitación, el usuario solo comprobará esas actualizaciones en el siguiente despertar (iteración del bucle), por lo que el retardo de reacción puede variar dentro de cierta cantidad de milisegundos a lo largo del tiempo.

## Métodos Públicos

### watchOrderBook

La interfaz de `watchOrderBook` es idéntica a la de [fetchOrderBook](/docs/manual#order-book). Acepta tres argumentos:

- `symbol` – cadena de texto, un símbolo CCXT unificado, obligatorio
- `limit` – entero, el número máximo de ofertas de compra/venta devueltas, opcional
- `params` – diccionario asociativo, sobreescrituras opcionales como se describe en [Sobreescritura de Parámetros de la API Unificada](/docs/manual#overriding-unified-api-params)

En general, los exchanges se pueden dividir en dos categorías:

1. los exchanges que admiten libros de órdenes limitados (transmitiendo solo la parte superior de la pila de órdenes)
2. los exchanges que transmiten solo libros de órdenes completos

Si el exchange acepta un argumento de limitación, el argumento `limit` se envía al exchange al suscribirse al flujo del libro de órdenes a través de una conexión WebSocket. El exchange enviará entonces solo la cantidad de órdenes especificada, lo que ayuda a reducir el tráfico. Algunos exchanges solo pueden aceptar ciertos valores de `limit`, como 10, 25, 50, 100, etc.

Si el exchange subyacente no acepta un argumento de limitación, la limitación se realiza en el lado del cliente.

El argumento `limit` no garantiza que el número de ofertas de compra o de venta sea siempre igual a `limit`. Designa el límite superior o el máximo, por lo que en algún momento puede haber menos de `limit` ofertas de compra o de venta, pero nunca más de `limit`. Este es el caso cuando el exchange no tiene suficientes órdenes en el libro de órdenes, o cuando una de las órdenes superiores del libro de órdenes se empareja y se elimina del libro de órdenes, dejando menos de `limit` entradas en el lado de las ofertas de compra o en el lado de las ofertas de venta. El espacio libre en el libro de órdenes generalmente se llena rápidamente con nuevos datos.

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

Similar a `watchOrderBook` pero acepta un array de símbolos para que pueda suscribirse a múltiples libros de órdenes en un solo mensaje.


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
Algunos exchanges permiten diferentes temas para escuchar tickers (por ejemplo: bookTicker). Puede configurar esto en `exchange.options['watchTicker']['name']`
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

Un error muy común sobre los WebSockets es creer que los flujos OHLCV de WS pueden de algún modo acelerar una estrategia de trading.
Si el propósito de su aplicación es implementar trading basado en OHLCV o una estrategia algorítmica especulativa, **considere lo siguiente cuidadosamente**.

En general, existen dos tipos de datos de trading utilizados en los algoritmos:

- datos en tiempo real de primer orden como libros de órdenes y operaciones
- datos de segundo orden no en tiempo real como tickers, ohlcvs, etc.

Cuando los desarrolladores dicen _"tiempo real"_, generalmente se refieren a pseudo tiempo real, o, dicho simplemente, _"tan rápido y tan cerca del tiempo real como sea posible"_.

Los datos de segundo orden se calculan **siempre** a partir de los datos de primer orden. Los OHLCVs se calculan a partir de operaciones agregadas. Los tickers se calculan a partir de operaciones y libros de órdenes.

Algunos exchanges realizan el cálculo de OHLCVs (datos de segundo orden) por usted en el lado del exchange y le envían actualizaciones a través de WS (Binance). Otros exchanges no consideran que esto sea necesario, con razón.

Obviamente, lleva tiempo calcular las velas OHLCV de segundo orden a partir de las operaciones. Además, enviar la vela calculada de vuelta a todos los usuarios conectados también lleva tiempo. Pueden producirse retrasos adicionales durante períodos de alta volatilidad si un exchange opera muy activamente bajo alta carga.

No existe una garantía estricta sobre cuánto tiempo tardará el exchange en calcular los datos de segundo orden y transmitirlos a usted a través de WS. Los retrasos y desfases en las velas OHLCV pueden variar significativamente de un exchange a otro. Por ejemplo, un exchange puede enviar una actualización OHLCV aproximadamente 30 segundos después del cierre real del período correspondiente. Otros exchanges pueden enviar las actualizaciones OHLCV actuales a intervalos regulares (digamos, una vez cada 100ms), mientras que en realidad las operaciones pueden ocurrir con mucha más frecuencia.

La mayoría de las personas usan WS para evitar cualquier tipo de retrasos y tener datos en tiempo real. Por lo tanto, en la mayoría de los casos es mucho mejor no esperar al exchange. Recalcular los datos de segundo orden a partir de los datos de primer orden por cuenta propia puede ser mucho más rápido y puede reducir los retrasos innecesarios. Por ello, no tiene mucho sentido usar WS únicamente para observar las velas OHLCV del exchange. Los desarrolladores preferirían usar `watch_trades()` y recalcular las velas OHLCV usando los métodos integrados de CCXT como `build_ohlcvc()`.

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

Eso explica por qué algunos exchanges razonablemente consideran que los OHLCVs no son necesarios en el contexto de WS, ya que los usuarios pueden calcular esa información en el espacio de usuario mucho más rápido teniendo solo un flujo WS de operaciones en tiempo real de primer orden.

Si su aplicación no es muy crítica en tiempo, puede seguir suscribiéndose a flujos OHLCV, con fines de representación gráfica. Si el exchange subyacente tiene `exchange.has['watchOHLCV']`, puede usar `watchOHLCV()/watch_ohlcv()` como se muestra a continuación:


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

Similar a `watchOHLCV` pero permite múltiples suscripciones de símbolos y marcos temporales

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

Similar a `watchTrades` pero permite suscribirse a múltiples símbolos en una sola llamada.


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


## Métodos Privados

En la mayoría de los casos la lógica de autenticación se toma prestada de CCXT, ya que los exchanges utilizan los mismos pares de claves y algoritmos de firma para las APIs REST y las APIs WebSocket. Consulte [Configuración de Claves API](/docs/manual#api-keys-setup) para más detalles.

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
observa todas las posiciones abiertas y devuelve una lista de [estructura de posición](/docs/manual#position-structure)


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

### Manejador personalizado

Si deseas tener acceso a los mensajes entrantes sin procesar y usar tus propios manejadores personalizados, puedes sobreescribir el método `handleMessage/handle_message` del exchange, de la siguiente manera:

A) Por herencia:


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


B) sobreescribiendo el método:


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


### Manejo de errores

En caso de error, CCXT Pro lanzará una excepción estándar de CCXT; consulta [Manejo de errores](/docs/index#error-handling) para más detalles.
