---
title: "Manuel CCXT Pro"
description: "CCXT Pro est une partie gratuite de CCXT qui ajoute la prise en charge du streaming WebSocket : https://github.com/ccxt/ccxt/issues/15171"
---

# Manuel

CCXT Pro est une partie gratuite de CCXT qui ajoute la prise en charge du streaming WebSocket : https://github.com/ccxt/ccxt/issues/15171

La pile CCXT Pro est construite sur [CCXT](https://ccxt.com) et étend les classes principales de CCXT, en utilisant :

- Les mixins au niveau du prototype JavaScript
- L'héritage multiple Python
- Les Traits PHP
- L'héritage de classes Java (les classes d'exchange pro étendent les classes d'exchange de base)

CCXT Pro s'appuie fortement sur le transpileur de CCXT pour la [prise en charge multilingue](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support).

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
<!--- init list -->La bibliothèque CCXT Pro prend actuellement en charge les 74 marchés d'échange de cryptomonnaies et API de trading WebSocket suivants :

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
Il s'agit de la liste des exchanges dans CCXT Pro avec prise en charge des API WebSockets. Cette liste sera mise à jour régulièrement avec de nouveaux exchanges.

Liste complète des exchanges disponibles dans CCXT via REST : [Marchés d'échange de cryptomonnaies pris en charge](https://github.com/ccxt/ccxt/#supported-cryptocurrency-exchange-markets).

## Utilisation

```diff
- this part of the doc is under heavy development right now
- there may be some typos, mistakes and missing info here and there
- contributions, pull requests and feedback appreciated
```

## Prérequis

La meilleure façon de comprendre CCXT Pro est de s'assurer que vous maîtrisez l'intégralité du Manuel CCXT et de pratiquer d'abord le CCXT standard. CCXT Pro s'appuie sur CCXT. Les deux bibliothèques partagent de nombreux points communs, notamment :

- les concepts d'API publique et d'API privée authentifiée
- les marchés, symboles, codes de devises et identifiants
- les structures et formats de données unifiés, carnets d'ordres, transactions, ordres, bougies, intervalles de temps, ...
- les exceptions et les correspondances d'erreurs
- l'authentification et les clés API (pour les flux et appels privés)
- les options de configuration

Le public de CCXT Pro est composé principalement de traders algorithmiques professionnels et de développeurs. Pour travailler efficacement avec cette bibliothèque, l'utilisateur doit bien maîtriser les concepts du streaming. Il faut comprendre les différences fondamentales entre les API de streaming basées sur des connexions ([WebSocket](https://en.wikipedia.org/wiki/WebSocket), CCXT Pro) et les API basées sur des requêtes-réponses ([REST](https://en.wikipedia.org/wiki/Representational_state_transfer), CCXT).

Le flux général de style asynchrone pour une application CCXT est le suivant :

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

Dans CCXT Pro, chaque méthode RESTful unifiée publique et privée ayant un préfixe `fetch*` possède également une méthode homologue basée sur les flux, préfixée par `watch*`, comme suit :

- API publique
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
- API privée
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
- Alternatives REST
  - `fetchTrades` → `fetchTradesWs`
  - `createOrder` → `createOrderWs`
  - `editOrder` → `editOrderWs`
  - `cancelOrder` → `cancelOrderWs`
  - `cancelOrders` → `cancelOrdersWs`
  - `cancelAllOrders` → `cancelAllOrdersWs`
  - etc ...
- unWatch (arrête l'abonnement en arrière-plan pour les méthodes `watch`-ées)
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

L'API de streaming unifiée CCXT Pro hérite des schémas d'utilisation de CCXT pour faciliter la migration.

Le flux général de style asynchrone pour une application CCXT Pro (par opposition à une application CCXT ci-dessus) est présenté ci-dessous :

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

Ce schéma d'utilisation est généralement encapsulé dans une méthode de logique métier centrale appelée _"une fonction `tick()`"_, car elle réitère une réaction aux événements entrants (aussi appelés _ticks_). D'après les deux exemples ci-dessus, il est évident que le schéma d'utilisation générique dans CCXT Pro et CCXT est identique.

Bon nombre des règles et concepts de CCXT s'appliquent également à CCXT Pro :

- CCXT Pro chargera les marchés et les mettra en cache lors du premier appel à une méthode d'API unifiée
- CCXT Pro appellera les méthodes RESTful de CCXT en coulisse si nécessaire
- CCXT Pro lèvera des exceptions CCXT standard le cas échéant
- ...

## Spécificités du Streaming

Malgré les nombreux points communs, les API basées sur le streaming ont leurs propres spécificités, en raison de leur nature orientée connexion.

Disposer d'une interface basée sur les connexions implique des mécanismes de gestion des connexions. Les connexions sont gérées par CCXT Pro de manière transparente pour l'utilisateur. Chaque instance d'exchange gère son propre ensemble de connexions.

Lors de votre premier appel à toute méthode `watch*()`, la bibliothèque établira une connexion à un flux/ressource spécifique de l'exchange et la maintiendra. Si la connexion existe déjà, elle est réutilisée. La bibliothèque gérera les séquences de messages de demande/réponse d'abonnement ainsi que l'authentification/signature si le flux demandé est privé.

La bibliothèque surveillera également l'état de la liaison montante et maintiendra la connexion active. En cas d'exception critique, de déconnexion ou d'expiration/d'échec de connexion, la prochaine itération de la fonction tick appellera la méthode `watch` qui déclenchera une reconnexion. De cette façon, la bibliothèque gère les déconnexions et reconnexions pour l'utilisateur de manière transparente. CCXT Pro applique la limitation de débit nécessaire et des délais de reconnexion à recul exponentiel. Toutes ces fonctionnalités sont activées par défaut et peuvent être configurées via les propriétés de l'exchange, comme d'habitude.

La plupart des exchanges ne disposent que d'une seule URL de base pour les API de streaming (généralement WebSocket, commençant par `ws://` ou `wss://`). Certains peuvent avoir plusieurs URL pour chaque flux, selon le flux en question.

Les API de streaming des exchanges peuvent être classées en deux catégories distinctes :

- *sub* ou *subscribe* permet la réception uniquement
- *pub* ou *publish* permet l'envoi et la réception

### Sub

Une interface *sub* permet généralement de s'abonner à un flux de données et de l'écouter. La plupart des exchanges qui prennent en charge les WebSockets n'offriront qu'un type d'API *sub*. Le type *sub* inclut le streaming de données de marché publiques. Parfois, les exchanges permettent également de s'abonner aux données privées des utilisateurs. Une fois que l'utilisateur s'est abonné à un flux de données, le canal commence effectivement à fonctionner de manière unidirectionnelle, envoyant des mises à jour de l'exchange vers l'utilisateur en continu.

Types courants de flux de données publiques :

- carnet d'ordres (le plus courant) - mises à jour sur les ordres ajoutés, modifiés et supprimés (aussi appelés *deltas de changement*)
- mises à jour du ticker lors de la modification des statistiques sur 24 heures
- flux d'exécutions (aussi courant) - un flux en direct de transactions publiques
- flux de bougies ohlcv
- heartbeat
- chat/trollbox de l'exchange

Types moins courants de flux de données privées des utilisateurs :

- le flux des transactions privées de l'utilisateur
- mises à jour d'ordres en direct
- mises à jour du solde
- flux personnalisés
- flux spécifiques à l'exchange et autres flux

### Pub

Une interface *pub* permet généralement aux utilisateurs d'envoyer des demandes de données vers le serveur. Cela inclut généralement les actions courantes des utilisateurs, telles que :

- passer des ordres
- annuler des ordres
- soumettre des demandes de retrait
- publier des messages dans le chat/trollbox
- etc

**Certains exchanges ne proposent pas d'API WS *pub*, ils n'offriront qu'une API WS *sub*.** Cependant, il existe des exchanges disposant d'une API de streaming complète. Dans la plupart des cas, un utilisateur ne peut pas opérer efficacement avec uniquement l'API de streaming. Les exchanges diffuseront les données de marché publiques en *sub*, et l'API REST reste nécessaire pour la partie *pub* là où elle est absente.

### unWatch

Chaque méthode `watchX` établit un abonnement à un flux et recevra continuellement des mises à jour de l'exchange. Même si vous arrêtez de récupérer la valeur de retour de la méthode `watchX`, le flux continuera à envoyer des données, qui sont traitées et stockées en arrière-plan. Pour arrêter ces abonnements en arrière-plan, vous devez utiliser la méthode `unWatch` (par ex. `watchTrades` -> `unWatchTrades`).

### Structures de Données Incrémentales

Dans de nombreux cas, en raison de la nature unidirectionnelle des flux de données sous-jacents, l'application à l'écoute côté client doit conserver un instantané local des données en mémoire et fusionner les mises à jour reçues du serveur de l'exchange dans l'instantané local. Les mises à jour provenant de l'exchange sont aussi souvent appelées _deltas_, car dans la plupart des cas ces mises à jour ne contiendront que les changements entre deux états des données et n'incluront pas les données qui n'ont pas changé, rendant nécessaire le stockage de l'état courant S mis en cache localement de tous les objets de données pertinents.

Toutes ces fonctionnalités sont gérées par CCXT Pro pour l'utilisateur. Pour travailler avec CCXT Pro, l'utilisateur n'a pas à suivre ou gérer les abonnements et les données associées. CCXT Pro maintiendra un cache de structures en mémoire pour gérer la complexité sous-jacente.

Chaque mise à jour entrante indique quelles parties des données ont changé et le côté récepteur « incrémente » l'état local S en fusionnant la mise à jour par-dessus l'état courant S et passe au prochain état local S'. En termes de CCXT Pro, cela s'appelle _"état incrémental"_ et les structures impliquées dans le processus de stockage et de mise à jour de l'état mis en cache sont appelées _"structures incrémentales"_. CCXT Pro introduit plusieurs nouvelles classes de base pour gérer l'état incrémental là où cela est nécessaire.

Les structures incrémentales retournées par les méthodes unifiées de CCXT Pro sont souvent de l'un des deux types suivants :

1. Objet décodé en JSON (`object` en JavaScript, `dict` en Python, `array()` en PHP). Ce type peut être retourné par des méthodes publiques et privées telles que `watchOrderBook`, `watchTicker`, `watchBalance`, `watchOrder`, etc.
2. Un tableau/liste d'objets (généralement triés dans l'ordre chronologique). Ce type peut être retourné par des méthodes telles que `watchOHLCV`, `watchTrades`, `watchMyTrades`, `watchOrders`, etc.

Les méthodes unifiées retournant des tableaux comme `watchOHLCV`, `watchTrades`, `watchMyTrades`, `watchOrders`, sont basées sur la couche de cache. L'utilisateur doit comprendre le fonctionnement interne de la couche de cache pour l'utiliser efficacement.

Le cache est une deque de taille fixe, aussi appelée tableau/liste avec deux extrémités. La bibliothèque CCXT Pro impose une limite raisonnable sur le nombre d'objets stockés en mémoire. Par défaut, les structures de tableau en cache stockeront jusqu'à 1000 entrées de chaque type (1000 transactions les plus récentes, 1000 bougies les plus récentes, 1000 ordres les plus récents). Le nombre maximum autorisé peut être configuré par l'utilisateur lors de l'instanciation ou ultérieurement :

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

Les limites du cache doivent être définies avant d'appeler toute méthode watch et ne peuvent pas être modifiées pendant l'exécution d'un programme.

Lorsqu'il reste de l'espace dans le cache, les nouveaux éléments sont simplement ajoutés à la fin. S'il n'y a pas assez de place pour un nouvel élément, l'élément le plus ancien est supprimé du début du cache pour libérer de l'espace. Ainsi, par exemple, le cache passe de 0 à 1000 transactions les plus récentes puis reste à un maximum de 1000 transactions les plus récentes, renouvelant constamment les données stockées à chaque nouvelle mise à jour provenant de l'exchange. Cela rappelle une fenêtre à cadre glissant ou une porte coulissante, qui ressemble à ce qui est illustré ci-dessous :

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

L'utilisateur peut configurer les limites du cache en utilisant `exchange.options` comme indiqué ci-dessus. Ne pas confondre les limites du cache avec la limite de pagination.

**Notez que les paramètres `since` et `limit` de [pagination basée sur les dates](/docs/manual#date-based-pagination) ont une signification différente et sont toujours appliqués dans la fenêtre mise en cache !** Si l'utilisateur spécifie un argument `since` lors de l'appel à `watchTrades()`, CCXT Pro retournera toutes les transactions mises en cache ayant `timestamp >= since`. Si l'utilisateur ne spécifie pas d'argument `since`, CCXT Pro retournera les transactions mises en cache depuis le début de la fenêtre glissante. Si l'utilisateur spécifie un argument `limit`, la bibliothèque retournera jusqu'à `limit` bougies à partir de `since` ou depuis le début du cache. Pour cette raison, l'utilisateur ne peut pas paginer au-delà du cadre mis en cache en raison des spécificités temps réel de WebSocket.

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

#### Mode newUpdates

Si vous souhaitez toujours obtenir uniquement le trade le plus récent, **vous devez instancier l'exchange avec le drapeau newUpdates défini à true**.

```python
exchange = ccxtpro.binance({'newUpdates': True})
while True:
    trades = await exchange.watchTrades (symbol)
    print(trades)
```

Le mode newUpdates continue d'utiliser le cache glissant en arrière-plan, mais l'utilisateur ne recevra que les nouvelles mises à jour. Cela est dû au fait que certains exchanges utilisent des structures incrémentielles, nous devons donc conserver un cache d'objets car l'exchange peut ne fournir que des informations partielles telles que des mises à jour d'état.

Le résultat du mode newUpdates sera une ou plusieurs mises à jour survenues depuis la dernière résolution de `exchange.watchMethod`. CCXT Pro peut retourner un ou plusieurs ordres mis à jour depuis l'appel précédent. Le résultat de l'appel à `exchange.watchOrders` ressemblera à ce qui est indiqué ci-dessous :

```javascript
[
    order, // see /docs/manual#order-structure
    order,
    order,
    ...
]
```

*Avertissement de dépréciation* : à l'avenir, `newUpdates: true` sera le mode par défaut et vous devrez définir newUpdates à false pour obtenir le cache glissant.

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


Le module CCXT Pro importé encapsule CCXT en son sein — chaque exchange instancié via CCXT Pro dispose de toutes les méthodes CCXT ainsi que des fonctionnalités supplémentaires.

## Instanciation

CCXT Pro est conçu pour la syntaxe async/await et repose largement sur des primitives asynchrones telles que les *promises* et les *futures*.

La création d'une instance d'exchange CCXT Pro est quasiment identique à la création d'une instance d'exchange CCXT.


```javascript tab="JavaScript"
const ccxt = require ('ccxt').pro
const exchange = new ccxtpro.binance ({ newUpdates: false })
```

#### **Python**

L'implémentation Python de CCXT Pro repose sur le module intégré [asyncio](https://docs.python.org/3/library/asyncio.html) et en particulier sur [Event Loop](https://docs.python.org/3/library/asyncio-eventloop.html). En Python, il est possible de fournir une instance de boucle d'événements asyncio dans les arguments du constructeur comme indiqué ci-dessous (identique à `ccxt.async support`) :

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

En PHP, les primitives asynchrones sont empruntées à [ReactPHP](https://reactphp.org). L'implémentation PHP de CCXT Pro repose sur [Promise](https://github.com/reactphp/promise) et [EventLoop](https://github.com/reactphp/event-loop) en particulier. En PHP, l'utilisateur doit fournir une instance de boucle d'événements ReactPHP dans les arguments du constructeur comme indiqué ci-dessous :

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


## Propriétés de l'exchange

Chaque instance CCXT Pro contient toutes les propriétés de l'instance CCXT sous-jacente. En plus des propriétés CCXT standard, l'instance CCXT Pro inclut les éléments suivants :

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

## API unifiée

L'API CCXT Pro unifiée encourage un flux de contrôle direct pour un meilleur style de code, un code plus lisible et architecturalement supérieur par rapport à l'utilisation d'EventEmitters et de callbacks. Cette dernière approche est considérée comme obsolète de nos jours car elle nécessite une inversion de contrôle (les gens ne sont pas habitués à la pensée inversée).

CCXT Pro adopte l'approche moderne et est conçu pour la syntaxe async. Sous le capot, CCXT Pro devra parfois utiliser un flux de contrôle inversé en raison des dépendances et des bibliothèques WebSocket qui ne peuvent pas faire autrement.

Il en va de même non seulement pour JS/ES6 mais aussi pour le code async Python 3. En PHP, les primitives asynchrones sont empruntées à [ReactPHP](https://reactphp.org/).

La syntaxe async moderne vous permet de combiner et de diviser l'exécution en chemins parallèles, puis de les fusionner, de les regrouper, de les prioriser, et bien plus encore. Avec les promises, il est facile de convertir d'un flux de contrôle async direct à un flux de contrôle inversé par callbacks, et vice versa.

### Temps réel vs Limitation

CCXT Pro prend en charge deux modes de boucles de fonctions tick — le mode temps réel et le mode de limitation. Les deux sont présentés ci-dessous en pseudocode :

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

En **mode temps réel**, CCXT Pro retournera le résultat dès que chaque nouveau delta arrive de l'exchange. La logique générale d'un appel unifié dans une boucle temps réel consiste à attendre le prochain delta et à retourner immédiatement la structure de résultat unifiée à l'utilisateur, encore et encore. Ceci est utile lorsque le temps de réaction est critique ou doit être le plus rapide possible.

Cependant, le mode temps réel nécessite une expérience en programmation avec les flux asynchrones lorsqu'il s'agit de synchroniser plusieurs boucles tick parallèles. En dehors de cela, les exchanges peuvent diffuser un très grand nombre de mises à jour pendant les périodes de forte activité ou de forte volatilité. Par conséquent, l'utilisateur développant un algorithme en temps réel doit s'assurer que le code en espace utilisateur est capable de consommer des données aussi rapidement. Travailler en mode temps réel peut parfois être plus exigeant en ressources.

En **mode de limitation**, CCXT Pro recevra et gérera les données en arrière-plan. L'utilisateur est responsable d'appeler les résultats de temps en temps lorsque nécessaire. La logique générale de la boucle de limitation consiste à dormir la plupart du temps et à se réveiller pour vérifier les résultats occasionnellement. Cela se fait généralement à une fréquence fixe, ou _"cadence d'images"_. Le code à l'intérieur d'une boucle de limitation est souvent plus facile à synchroniser entre plusieurs exchanges. Le rationnement du temps passé dans une boucle limitée contribue également à réduire l'utilisation des ressources au minimum. C'est pratique lorsque votre algorithme est lourd et que vous souhaitez contrôler précisément l'exécution pour éviter de l'exécuter trop souvent.

L'inconvénient évident du mode de limitation est d'être moins réactif aux mises à jour. Lorsqu'un algorithme de trading doit attendre quelques millisecondes avant d'être exécuté, une ou deux mises à jour peuvent arriver avant l'expiration de ce délai. En mode de limitation, l'utilisateur ne vérifiera ces mises à jour qu'au prochain réveil (itération de la boucle), de sorte que le délai de réaction peut varier dans un certain nombre de millisecondes au fil du temps.

## Méthodes publiques

### watchOrderBook

L'interface de `watchOrderBook` est identique à [fetchOrderBook](/docs/manual#order-book). Elle accepte trois arguments :

- `symbol` – chaîne, un symbole CCXT unifié, obligatoire
- `limit` – entier, le nombre maximum d'offres/demandes retournées, optionnel
- `params` – dictionnaire associatif, surcharges optionnelles décrites dans [Surcharger les paramètres de l'API unifiée](/docs/manual#overriding-unified-api-params)

En général, les exchanges peuvent être divisés en deux catégories :

1. les exchanges qui prennent en charge les carnets d'ordres limités (diffusant uniquement la partie supérieure de la pile d'ordres)
2. les exchanges qui diffusent uniquement des carnets d'ordres complets

Si l'exchange accepte un argument de limitation, l'argument `limit` est envoyé vers l'exchange lors de l'abonnement au flux du carnet d'ordres via une connexion WebSocket. L'exchange n'enverra alors que le nombre d'ordres spécifié, ce qui contribue à réduire le trafic. Certains exchanges peuvent n'accepter que certaines valeurs de `limit`, comme 10, 25, 50, 100, etc.

Si l'exchange sous-jacent n'accepte pas d'argument de limitation, la limitation est effectuée côté client.

L'argument `limit` ne garantit pas que le nombre d'offres ou de demandes sera toujours égal à `limit`. Il désigne la limite supérieure ou le maximum, donc à un moment donné il peut y avoir moins de `limit` offres ou demandes, mais jamais plus de `limit` offres ou demandes. C'est le cas lorsque l'exchange ne dispose pas d'assez d'ordres dans le carnet d'ordres, ou lorsqu'un des ordres en tête du carnet d'ordres est exécuté et supprimé, laissant moins de `limit` entrées du côté des offres ou des demandes. L'espace libre dans le carnet d'ordres est généralement rapidement comblé par de nouvelles données.

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

Similaire à `watchOrderBook` mais accepte un tableau de symboles afin que vous puissiez vous abonner à plusieurs carnets d'ordres en un seul message.


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
Certains exchanges permettent d'écouter différents sujets pour les tickers (par exemple : bookTicker). Vous pouvez le définir dans `exchange.options['watchTicker']['name']`
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

Une idée reçue très courante sur les WebSockets est que les flux OHLCV WS peuvent d'une manière ou d'une autre accélérer une stratégie de trading.
Si le but de votre application est d'implémenter un trading OHLCV ou une stratégie algorithmique spéculative, **réfléchissez attentivement à ce qui suit**.

En général, il existe deux types de données de trading utilisées dans les algorithmes :

- les données temps réel de premier ordre comme les carnets d'ordres et les trades
- les données non temps réel de second ordre comme les tickers, les ohlcvs, etc.

Lorsque les développeurs disent _"temps réel"_, cela signifie généralement pseudo temps réel, ou plus simplement, _"aussi vite et aussi proche du temps réel que possible"_.

Les données de second ordre sont **toujours** calculées à partir des données de premier ordre. Les OHLCVs sont calculés à partir des trades agrégés. Les tickers sont calculés à partir des trades et des carnets d'ordres.

Certains exchanges effectuent le calcul des OHLCVs (données de second ordre) pour vous côté exchange et vous envoient des mises à jour via WS (Binance). D'autres exchanges n'estiment pas vraiment que cela soit nécessaire, pour une raison.

Évidemment, il faut du temps pour calculer les bougies OHLCV de second ordre à partir des trades. En plus de cela, l'envoi de la bougie calculée à tous les utilisateurs connectés prend également du temps. Des délais supplémentaires peuvent survenir pendant les périodes de forte volatilité si un exchange est très actif sous une charge élevée.

Il n'y a aucune garantie stricte sur le temps que mettra l'exchange pour calculer les données de second ordre et vous les diffuser via WS. Les délais et décalages sur les bougies OHLCV peuvent varier considérablement d'un exchange à l'autre. Par exemple, un exchange peut envoyer une mise à jour OHLCV environ 30 secondes après la clôture effective de la période correspondante. D'autres exchanges peuvent envoyer les mises à jour OHLCV actuelles à intervalles réguliers (par exemple, une fois toutes les 100 ms), alors qu'en réalité les trades peuvent se produire beaucoup plus fréquemment.

La plupart des gens utilisent WS pour éviter tout type de délais et disposer de données en temps réel. Ainsi, dans la plupart des cas, il est bien préférable de ne pas attendre l'exchange. Recalculer les données de second ordre à partir des données de premier ordre par vous-même peut être beaucoup plus rapide et cela peut réduire les délais inutiles. Par conséquent, il n'est pas très utile d'utiliser WS uniquement pour surveiller les bougies OHLCV de l'exchange. Les développeurs préfèrent utiliser `watch_trades()` et recalculer les bougies OHLCV en utilisant les méthodes intégrées de CCXT comme `build_ohlcvc()`.

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

Cela explique pourquoi certains exchanges estiment raisonnablement que les OHLCVs ne sont pas nécessaires dans le contexte WS, car les utilisateurs peuvent calculer ces informations dans l'espace utilisateur beaucoup plus rapidement en ayant simplement un flux WS de trades de premier ordre en temps réel.

Si votre application n'est pas très critique en termes de temps, vous pouvez toujours vous abonner aux flux OHLCV, à des fins de graphiques. Si l'exchange sous-jacent dispose de `exchange.has['watchOHLCV']`, vous pouvez utiliser `watchOHLCV()/watch_ohlcv()` comme indiqué ci-dessous :


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

Similaire à `watchOHLCV` mais permet plusieurs abonnements de symboles et de périodes de temps

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

Similaire à `watchTrades` mais permet de s'abonner à plusieurs symboles en un seul appel.


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


## Méthodes privées

Dans la plupart des cas, la logique d'authentification est empruntée à CCXT puisque les exchanges utilisent les mêmes paires de clés et algorithmes de signature pour les API REST et les API WebSocket. Consultez [Configuration des clés API](/docs/manual#api-keys-setup) pour plus de détails.

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
surveiller toutes les positions ouvertes et retourne une liste d'objets de [structure de position](/docs/manual#position-structure)


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

### Gestionnaire personnalisé

Si vous souhaitez accéder aux messages bruts entrants et utiliser vos propres gestionnaires, vous pouvez redéfinir la méthode `handleMessage/handle_message` de l'exchange, comme suit :

A) Par héritage :


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


B) En surchargeant la méthode :


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


### Gestion des erreurs

En cas d'erreur, CCXT Pro lèvera une exception CCXT standard, consultez [Gestion des erreurs](/docs/index#error-handling) pour plus de détails.
