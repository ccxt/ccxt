---
title: "Manual do CCXT Pro"
description: "CCXT Pro é uma parte gratuita do CCXT que adiciona suporte a streaming via WebSocket: https://github.com/ccxt/ccxt/issues/15171"
---

# Manual

CCXT Pro é uma parte gratuita do CCXT que adiciona suporte a streaming via WebSocket: https://github.com/ccxt/ccxt/issues/15171

A pilha do CCXT Pro é construída sobre o [CCXT](https://ccxt.com) e estende as classes principais do CCXT, usando:

- Mixins em nível de protótipo JavaScript
- Herança múltipla em Python
- Traits em PHP
- Herança de classe em Java (as classes de exchange pro estendem as classes de exchange base)

O CCXT Pro depende fortemente do transpilador do CCXT para [suporte a múltiplos idiomas](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support).

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
<!--- init list -->A biblioteca CCXT Pro suporta atualmente os seguintes 74 mercados de criptomoedas e APIs de negociação via WebSocket:

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
Esta é a lista de exchanges no CCXT Pro com suporte a APIs WebSockets. Esta lista será atualizada com novas exchanges regularmente.

Lista completa de exchanges disponíveis no CCXT via REST: [Mercados de Exchange de Criptomoedas Suportados](https://github.com/ccxt/ccxt/#supported-cryptocurrency-exchange-markets).

## Utilização

```diff
- this part of the doc is under heavy development right now
- there may be some typos, mistakes and missing info here and there
- contributions, pull requests and feedback appreciated
```

## Pré-requisitos

A melhor forma de compreender o CCXT Pro é garantir que você domina todo o Manual do CCXT e pratica o CCXT padrão primeiro. O CCXT Pro se apoia no CCXT. As duas bibliotecas compartilham muitas características em comum, incluindo:

- os conceitos de API pública e API privada autenticada
- mercados, símbolos, códigos de moeda e ids
- estruturas e formatos de dados unificados, livros de ordens, negociações, ordens, velas, timeframes, ...
- exceções e mapeamentos de erros
- autenticação e chaves de API (para feeds e chamadas privadas)
- opções de configuração

O público do CCXT Pro é composto principalmente por traders algorítmicos profissionais e desenvolvedores. Para trabalhar de forma eficiente com esta biblioteca, o utilizador deve estar bem familiarizado com os conceitos de streaming. É necessário compreender as diferenças subjacentes entre APIs de streaming baseadas em conexão ([WebSocket](https://en.wikipedia.org/wiki/WebSocket), CCXT Pro) e APIs baseadas em requisição-resposta ([REST](https://en.wikipedia.org/wiki/Representational_state_transfer), CCXT).

O fluxo geral de estilo assíncrono para uma aplicação CCXT é o seguinte:

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

No CCXT Pro, cada método RESTful unificado público e privado com prefixo `fetch*` também possui um método correspondente baseado em stream com prefixo `watch*`, como segue:

- API Pública
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
- API Privada
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
- unWatch (interrompe a subscrição em segundo plano para os métodos `watch`)
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

A API de Streaming Unificada do CCXT Pro herda os padrões de uso do CCXT para facilitar a migração.

O fluxo geral de estilo assíncrono para uma aplicação CCXT Pro (em oposição a uma aplicação CCXT acima) é apresentado abaixo:

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

Esse padrão de uso normalmente é encapsulado em um método de lógica de negócio central chamado _"função `tick()`"_, uma vez que reitera uma reação aos eventos recebidos (também conhecidos como _ticks_). Pelos dois exemplos acima, fica evidente que o padrão de uso genérico no CCXT Pro e no CCXT é idêntico.

Muitas das regras e conceitos do CCXT também se aplicam ao CCXT Pro:

- O CCXT Pro carregará mercados e os armazenará em cache na primeira chamada a um método de API unificada
- O CCXT Pro chamará métodos RESTful do CCXT internamente, se necessário
- O CCXT Pro lançará exceções padrão do CCXT quando necessário
- ...

## Especificidades do Streaming

Apesar das numerosas características em comum, as APIs baseadas em streaming possuem suas próprias especificidades, devido à sua natureza orientada a conexão.

Ter uma interface baseada em conexão implica mecanismos de gestão de conexão. As conexões são gerenciadas pelo CCXT Pro de forma transparente para o utilizador. Cada instância de exchange gerencia seu próprio conjunto de conexões.

Na sua primeira chamada a qualquer método `watch*()`, a biblioteca estabelecerá uma conexão com um stream/recurso específico da exchange e a manterá. Se a conexão já existir, ela será reutilizada. A biblioteca tratará as sequências de mensagens de requisição/resposta de subscrição, bem como a autenticação/assinatura caso o stream solicitado seja privado.

A biblioteca também monitorará o estado do uplink e manterá a conexão ativa. Diante de uma exceção crítica, desconexão ou timeout/falha de conexão, a próxima iteração da função tick chamará o método `watch`, que acionará uma reconexão. Desta forma, a biblioteca trata as desconexões e reconexões para o utilizador de forma transparente. O CCXT Pro aplica os limites de taxa necessários e atrasos de reconexão com backoff exponencial. Toda essa funcionalidade está habilitada por padrão e pode ser configurada através das propriedades da exchange, como de costume.

A maioria das exchanges possui apenas uma URL base para APIs de streaming (geralmente WebSocket, iniciando com `ws://` ou `wss://`). Algumas podem ter mais de uma URL para cada stream, dependendo do feed em questão.

As APIs de Streaming das exchanges podem ser classificadas em duas categorias diferentes:

- *sub* ou *subscribe* permite apenas receber
- *pub* ou *publish* permite enviar e receber

### Sub

Uma interface *sub* geralmente permite subscrever a um stream de dados e escutá-lo. A maioria das exchanges que suportam WebSockets oferecerá apenas uma API do tipo *sub*. O tipo *sub* inclui o streaming de dados públicos de mercado. Às vezes, as exchanges também permitem subscrever dados privados do utilizador. Após o utilizador subscrever a um feed de dados, o canal começa a funcionar de forma unidirecional, enviando atualizações da exchange para o utilizador continuamente.

Tipos comuns de streams de dados públicos:

- livro de ordens (mais comum) - atualizações sobre ordens adicionadas, editadas e eliminadas (também conhecidas como *deltas de mudança*)
- atualizações de ticker com mudança das estatísticas de 24 horas
- feed de execuções (também comum) - um stream ao vivo de negociações públicas
- feed de velas ohlcv
- heartbeat
- chat/trollbox da exchange

Tipos menos comuns de streams de dados privados do utilizador:

- o stream de negociações privadas do utilizador
- atualizações de ordens ao vivo
- atualizações de saldo
- streams personalizados
- streams específicos da exchange e outros

### Pub

Uma interface *pub* geralmente permite que os utilizadores enviem requisições de dados para o servidor. Isso normalmente inclui ações comuns do utilizador, como:

- colocação de ordens
- cancelamento de ordens
- colocação de requisições de saque
- publicação de mensagens no chat/trollbox
- etc

**Algumas exchanges não oferecem uma API WS do tipo *pub*, oferecendo apenas a API WS do tipo *sub*.** No entanto, existem exchanges que possuem uma API de Streaming completa. Na maioria dos casos, um utilizador não consegue operar de forma eficaz apenas com a API de Streaming. As exchanges farão streaming de dados públicos de mercado via *sub*, e a API REST ainda é necessária para a parte *pub* quando ausente.

### unWatch

Cada método `watchX` estabelece uma subscrição com um stream e continuará recebendo atualizações da exchange. Mesmo que você pare de obter o valor de retorno do método `watchX`, o stream continuará enviando dados, que são tratados e armazenados em segundo plano. Para interromper essas subscrições em segundo plano, você deve usar o método `unWatch` (ex.: `watchTrades` -> `unWatchTrades`).

### Estruturas de Dados Incrementais

Em muitos casos, devido à natureza unidirecional dos feeds de dados subjacentes, a aplicação que escuta no lado do cliente precisa manter um snapshot local dos dados na memória e mesclar as atualizações recebidas do servidor da exchange no snapshot local. As atualizações provenientes da exchange também são frequentemente chamadas de _deltas_, porque na maioria dos casos essas atualizações conterão apenas as mudanças entre dois estados dos dados e não incluirão os dados que não mudaram, tornando necessário armazenar o estado atual S em cache local de todos os objetos de dados relevantes.

Toda essa funcionalidade é tratada pelo CCXT Pro para o utilizador. Para trabalhar com o CCXT Pro, o utilizador não precisa rastrear ou gerenciar subscrições e dados relacionados. O CCXT Pro manterá um cache de estruturas na memória para lidar com a complexidade subjacente.

Cada atualização recebida indica quais partes dos dados mudaram, e o lado receptor "incrementa" o estado local S mesclando a atualização sobre o estado atual S, movendo para o próximo estado local S'. Em termos de CCXT Pro, isso é chamado de _"estado incremental"_ e as estruturas envolvidas no processo de armazenamento e atualização do estado em cache são chamadas de _"estruturas incrementais"_. O CCXT Pro introduz várias novas classes base para tratar o estado incremental quando necessário.

As estruturas incrementais retornadas pelos métodos unificados do CCXT Pro são geralmente de um dos dois tipos:

1. Objeto decodificado em JSON (`object` em JavaScript, `dict` em Python, `array()` em PHP). Este tipo pode ser retornado por métodos públicos e privados como `watchOrderBook`, `watchTicker`, `watchBalance`, `watchOrder`, etc.
2. Um array/lista de objetos (geralmente ordenados em ordem cronológica). Este tipo pode ser retornado por métodos como `watchOHLCV`, `watchTrades`, `watchMyTrades`, `watchOrders`, etc.

Os métodos unificados que retornam arrays como `watchOHLCV`, `watchTrades`, `watchMyTrades`, `watchOrders`, são baseados na camada de cache. O utilizador precisa compreender o funcionamento interno da camada de cache para trabalhar com ela de forma eficiente.

O cache é uma deque de tamanho fixo, também conhecida como array/lista com duas extremidades. A biblioteca CCXT Pro tem um limite razoável no número de objetos armazenados na memória. Por padrão, as estruturas de array em cache armazenarão até 1000 entradas de cada tipo (1000 negociações mais recentes, 1000 velas mais recentes, 1000 ordens mais recentes). O número máximo permitido pode ser configurado pelo utilizador na instanciação ou posteriormente:

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

Os limites do cache devem ser definidos antes de chamar qualquer método watch e não podem ser alterados durante a execução do programa.

Quando há espaço disponível no cache, novos elementos são simplesmente adicionados ao final. Se não houver espaço suficiente para um novo elemento, o elemento mais antigo é excluído do início do cache para liberar espaço. Assim, por exemplo, o cache cresce de 0 até 1000 negociações mais recentes e depois permanece no máximo de 1000 negociações mais recentes, renovando constantemente os dados armazenados a cada nova atualização recebida da exchange. Isso lembra uma janela deslizante ou uma porta deslizante, que se parece com o mostrado abaixo:

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

O utilizador pode configurar os limites do cache usando `exchange.options` conforme mostrado acima. Não confunda os limites do cache com o limite de paginação.

**Observe que os parâmetros `since` e `limit` de [paginação baseada em data](/docs/manual#date-based-pagination) têm um significado diferente e são sempre aplicados dentro da janela em cache!** Se o utilizador especificar um argumento `since` na chamada `watchTrades()`, o CCXT Pro retornará todas as negociações em cache com `timestamp >= since`. Se o utilizador não especificar um argumento `since`, o CCXT Pro retornará as negociações em cache desde o início da janela deslizante. Se o utilizador especificar um argumento `limit`, a biblioteca retornará até `limit` velas a partir de `since` ou desde o início do cache. Por essa razão, o utilizador não pode paginar além do frame em cache devido às especificidades do WebSocket em tempo real.

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

Se você quiser sempre obter apenas a negociação mais recente, **deve instanciar a exchange com o sinalizador newUpdates definido como true**.

```python
exchange = ccxtpro.binance({'newUpdates': True})
while True:
    trades = await exchange.watchTrades (symbol)
    print(trades)
```

O modo newUpdates continua a utilizar o cache deslizante em segundo plano, mas o usuário receberá apenas as novas atualizações. Isso ocorre porque algumas exchanges usam estruturas incrementais, portanto precisamos manter um cache de objetos, já que a exchange pode fornecer apenas informações parciais, como atualizações de status.

O resultado do modo newUpdates será uma ou mais atualizações ocorridas desde a última vez que `exchange.watchMethod` foi resolvido. O CCXT Pro pode retornar uma ou mais ordens que foram atualizadas desde a chamada anterior. O resultado de chamar `exchange.watchOrders` será como mostrado abaixo:

```javascript
[
    order, // see /docs/manual#order-structure
    order,
    order,
    ...
]
```

*Aviso de Depreciação*: no futuro, `newUpdates: true` será o modo padrão e você precisará definir newUpdates como false para obter o cache deslizante.

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


O módulo CCXT Pro importado envolve o CCXT dentro de si mesmo – toda exchange instanciada via CCXT Pro possui todos os métodos do CCXT, bem como a funcionalidade adicional.

## Instanciação

O CCXT Pro foi projetado para a sintaxe async/await e depende fortemente de primitivos assíncronos como *promises* e *futures*.

Criar uma instância de exchange no CCXT Pro é praticamente idêntico a criar uma instância de exchange no CCXT.


```javascript tab="JavaScript"
const ccxt = require ('ccxt').pro
const exchange = new ccxtpro.binance ({ newUpdates: false })
```

#### **Python**

A implementação Python do CCXT Pro depende do [asyncio](https://docs.python.org/3/library/asyncio.html) integrado e, em particular, do [Event Loop](https://docs.python.org/3/library/asyncio-eventloop.html). Em Python é possível fornecer uma instância do event loop do asyncio nos argumentos do construtor, como mostrado abaixo (idêntico ao `ccxt.async support`):

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

Em PHP, os primitivos assíncronos são emprestados do [ReactPHP](https://reactphp.org). A implementação PHP do CCXT Pro depende do [Promise](https://github.com/reactphp/promise) e do [EventLoop](https://github.com/reactphp/event-loop) em particular. Em PHP, o usuário é obrigado a fornecer uma instância do event loop do ReactPHP nos argumentos do construtor, como mostrado abaixo:

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


## Propriedades da Exchange

Toda instância do CCXT Pro contém todas as propriedades da instância CCXT subjacente. Além das propriedades padrão do CCXT, a instância do CCXT Pro inclui o seguinte:

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

A API Unificada do CCXT Pro incentiva o controle direto de fluxo para um estilo de código melhor, mais legível e arquiteturalmente superior em comparação ao uso de EventEmitters e callbacks. Esta última é considerada uma abordagem desatualizada atualmente, pois requer inversão de controle (as pessoas não estão acostumadas com o pensamento invertido).

O CCXT Pro segue a abordagem moderna e foi projetado para a sintaxe assíncrona. Por baixo dos panos, o CCXT Pro ainda precisará usar fluxo de controle invertido às vezes, por causa das dependências e das bibliotecas WebSocket que não conseguem fazer de outra forma.

O mesmo vale não apenas para JS/ES6, mas também para código assíncrono Python 3. Em PHP, os primitivos assíncronos são emprestados do [ReactPHP](https://reactphp.org/).

A sintaxe assíncrona moderna permite combinar e dividir a execução em caminhos paralelos e depois mesclá-los, agrupá-los, priorizá-los e muito mais. Com promises, é possível converter facilmente de fluxo de controle direto em estilo assíncrono para fluxo de controle invertido em estilo callback, e vice-versa.

### Tempo Real vs Throttling

O CCXT Pro suporta dois modos de loops de função tick – o modo em tempo real e o modo de throttling. Ambos são mostrados abaixo em pseudocódigo:

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

No **modo em tempo real**, o CCXT Pro retornará o resultado assim que cada novo delta chegar da exchange. A lógica geral de uma chamada unificada em um loop em tempo real é aguardar o próximo delta e imediatamente retornar a estrutura de resultado unificada ao usuário, repetidamente. Isso é útil quando o tempo de reação é crítico ou precisa ser o mais rápido possível.

No entanto, o modo em tempo real requer experiência em programação com fluxos assíncronos quando se trata de sincronizar múltiplos loops tick paralelos. Além disso, as exchanges podem transmitir um número muito grande de atualizações durante períodos de alta atividade ou alta volatilidade. Portanto, o usuário que desenvolve um algoritmo em tempo real deve garantir que o código do lado do usuário seja capaz de consumir dados nessa velocidade. Trabalhar no modo em tempo real pode ser mais exigente em termos de recursos às vezes.

No **modo de throttling**, o CCXT Pro receberá e gerenciará os dados em segundo plano. O usuário é responsável por consultar os resultados de tempos em tempos, quando necessário. A lógica geral do loop de throttling é dormir na maior parte do tempo e acordar para verificar os resultados ocasionalmente. Isso geralmente é feito em alguma frequência fixa, ou _"taxa de quadros"_. O código dentro de um loop de throttling é frequentemente mais fácil de sincronizar entre múltiplas exchanges. O racionamento do tempo gasto em um loop com throttling também ajuda a reduzir o uso de recursos ao mínimo. Isso é conveniente quando seu algoritmo é pesado e você deseja controlar a execução com precisão para evitar executá-lo com muita frequência.

A desvantagem óbvia do modo de throttling é ser menos reativo ou responsivo a atualizações. Quando um algoritmo de trading precisa aguardar alguns milissegundos antes de ser executado – uma ou duas atualizações podem chegar antes que esse tempo expire. No modo de throttling, o usuário só verificará essas atualizações na próxima vez que o loop acordar (iteração do loop), portanto, o atraso de reação pode variar dentro de alguns milissegundos ao longo do tempo.

## Métodos Públicos

### watchOrderBook

A interface do `watchOrderBook` é idêntica à do [fetchOrderBook](/docs/manual#order-book). Aceita três argumentos:

- `symbol` – string, um símbolo CCXT unificado, obrigatório
- `limit` – inteiro, o número máximo de bids/asks retornados, opcional
- `params` – dicionário associativo, substituições opcionais conforme descrito em [Substituindo Parâmetros da API Unificada](/docs/manual#overriding-unified-api-params)

Em geral, as exchanges podem ser divididas em duas categorias:

1. as exchanges que suportam orderbooks limitados (transmitindo apenas a parte superior da pilha de ordens)
2. as exchanges que transmitem apenas orderbooks completos

Se a exchange aceita um argumento de limitação, o argumento `limit` é enviado para a exchange ao assinar o stream do orderbook por uma conexão WebSocket. A exchange então enviará apenas a quantidade especificada de ordens, o que ajuda a reduzir o tráfego. Algumas exchanges podem aceitar apenas determinados valores de `limit`, como 10, 25, 50, 100 e assim por diante.

Se a exchange subjacente não aceitar um argumento de limitação, a limitação é feita no lado do cliente.

O argumento `limit` não garante que o número de bids ou asks sempre será igual a `limit`. Ele designa o limite superior ou o máximo, portanto, em algum momento pode haver menos do que `limit` bids ou asks, mas nunca mais do que `limit` bids ou asks. Esse é o caso quando a exchange não tem ordens suficientes no orderbook, ou quando uma das ordens do topo do orderbook é correspondida e removida do orderbook, deixando menos de `limit` entradas no lado dos bids ou no lado dos asks. O espaço livre no orderbook geralmente é rapidamente preenchido com novos dados.

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

Similar ao `watchOrderBook`, mas aceita um array de símbolos para que você possa assinar múltiplos orderbooks em uma única mensagem.


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
Algumas exchanges permitem diferentes tópicos para ouvir tickers (ex.: bookTicker). Você pode definir isso em `exchange.options['watchTicker']['name']`
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

Um equívoco muito comum sobre WebSockets é que streams WS de OHLCV podem de alguma forma acelerar uma estratégia de trading.
Se o objetivo do seu aplicativo é implementar trading baseado em OHLCV ou uma estratégia algorítmica especulativa, **considere o seguinte cuidadosamente**.

Em geral, há dois tipos de dados de trading usados nos algoritmos:

- dados em tempo real de 1ª ordem, como orderbooks e negociações
- dados não em tempo real de 2ª ordem, como tickers, ohlcvs, etc

Quando os desenvolvedores dizem _"tempo real"_, geralmente significa pseudo tempo real, ou, simplificando, _"tão rápido e tão próximo do tempo real quanto possível"_.

Os dados de 2ª ordem são **sempre** calculados a partir dos dados de 1ª ordem. OHLCVs são calculados a partir de negociações agregadas. Tickers são calculados a partir de negociações e orderbooks.

Algumas exchanges fazem o cálculo de OHLCVs (dados de 2ª ordem) para você no lado da exchange e enviam atualizações via WS (Binance). Outras exchanges realmente não acham isso necessário, por uma razão.

Obviamente, leva tempo para calcular candles OHLCV de 2ª ordem a partir de negociações. Além disso, enviar o candle calculado de volta a todos os usuários conectados também leva tempo. Atrasos adicionais podem ocorrer durante períodos de alta volatilidade, se uma exchange for negociada muito ativamente sob alta carga.

Não há garantia estrita de quanto tempo levará para a exchange calcular os dados de 2ª ordem e transmiti-los para você via WS. Os atrasos e defasagens nos candles OHLCV podem variar significativamente de exchange para exchange. Por exemplo, uma exchange pode enviar uma atualização de OHLCV aproximadamente 30 segundos após o fechamento real de um período correspondente. Outras exchanges podem enviar as atualizações de OHLCV atuais em intervalos regulares (digamos, uma vez a cada 100ms), enquanto na realidade as negociações podem ocorrer com muito mais frequência.

A maioria das pessoas usa WS para evitar qualquer tipo de atraso e ter dados em tempo real. Portanto, na maioria dos casos é muito melhor não esperar pela exchange. Recalcular os dados de 2ª ordem a partir dos dados de 1ª ordem por conta própria pode ser muito mais rápido e isso pode reduzir os atrasos desnecessários. Portanto, não faz muito sentido usar WS apenas para assistir candles OHLCV da exchange. Os desenvolvedores preferem usar `watch_trades()` e recalcular os candles OHLCV usando os métodos integrados do CCXT, como `build_ohlcvc()`.

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

Isso explica por que algumas exchanges razoavelmente acham que OHLCVs não são necessários no contexto WS, pois os usuários podem calcular essas informações no lado do usuário muito mais rapidamente tendo apenas um stream WS de negociações de 1ª ordem em tempo real.

Se o seu aplicativo não for muito crítico em termos de tempo, você ainda pode assinar streams de OHLCV, para fins de gráficos. Se a exchange subjacente tiver `exchange.has['watchOHLCV']`, você pode usar `watchOHLCV()/watch_ohlcv()` conforme mostrado abaixo:


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

Similar ao `watchOHLCV`, mas permite múltiplas assinaturas de símbolos e timeframes

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

Similar ao `watchTrades`, mas permite assinar múltiplos símbolos em uma única chamada.


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

Na maioria dos casos, a lógica de autenticação é emprestada do CCXT, já que as exchanges usam os mesmos pares de chaves e algoritmos de assinatura para APIs REST e APIs WebSocket. Consulte [Configuração de Chaves de API](/docs/manual#api-keys-setup) para mais detalhes.

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
observa todas as posições abertas e retorna uma lista de [estrutura de posição](/docs/manual#position-structure)


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

### Manipulador personalizado

Se você quiser ter acesso às mensagens recebidas brutas e usar seus próprios manipuladores personalizados, pode sobrescrever o método `handleMessage/handle_message` da exchange, da seguinte forma:

A) Por herança:


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


B) sobrescrevendo o método:


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


### Tratamento de Erros

Em caso de erro, o CCXT Pro lançará uma exceção padrão do CCXT. Consulte [Tratamento de Erros](/docs/index#error-handling) para mais detalhes.
