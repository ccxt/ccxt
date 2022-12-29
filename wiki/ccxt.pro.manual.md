# Manual

The CCXT Pro stack is built upon [CCXT](https://ccxt.com) and extends the core CCXT classes, using:

- JavaScript prototype-level mixins
- Python multiple inheritance
- PHP Traits

The CCXT Pro heavily relies on the transpiler of CCXT for [multilanguage support](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support).

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
    |       loadMarkets            .           watchBalance       |
    |       watchTicker            .       watchCreateOrder       |
    |       watchTickers           .       watchCancelOrder       |
    |       watchOrderBook         .             watchOrder       |
    |       watchOHLCV             .            watchOrders       |
    |       watchStatus            .        watchOpenOrders       |
    |       watchTrades            .      watchClosedOrders       |
    |                              .          watchMyTrades       |
    |                              .           watchDeposit       |
    |                              .          watchWithdraw       |
    │                              .                              |
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

The CCXT Pro library currently supports the following 46 cryptocurrency exchange markets and WebSocket trading APIs:

| logo                                                                                                                                                                                                            | id            | name                                                                                                    | ver                                                                                                                                              | certified                                                                                                                   | pro                                                                          |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|---------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------:|-----------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| [![alpaca](https://user-images.githubusercontent.com/1294454/187234005-b864db3d-f1e3-447a-aaf9-a9fc7b955d07.jpg)](https://alpaca.markets)                                                                       | alpaca        | [Alpaca](https://alpaca.markets)                                                                        | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://alpaca.markets/docs/)                                                       |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![ascendex](https://user-images.githubusercontent.com/1294454/112027508-47984600-8b48-11eb-9e17-d26459cc36c6.jpg)](https://ascendex.com/en-us/register?inviteCode=EL6BXBQM)                                    | ascendex      | [AscendEX](https://ascendex.com/en-us/register?inviteCode=EL6BXBQM)                                     | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://ascendex.github.io/ascendex-pro-api/#ascendex-pro-api-documentation)        |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bequant](https://user-images.githubusercontent.com/1294454/55248342-a75dfe00-525a-11e9-8aa2-05e9dca943c6.jpg)](https://bequant.io)                                                                           | bequant       | [Bequant](https://bequant.io)                                                                           | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://api.bequant.io/)                                                            |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![binance](https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg)](https://accounts.binance.com/en/register?ref=D7YA7CLY)                                        | binance       | [Binance](https://accounts.binance.com/en/register?ref=D7YA7CLY)                                        | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://binance-docs.github.io/apidocs/spot/en)                                     | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![binancecoinm](https://user-images.githubusercontent.com/1294454/117738721-668c8d80-b205-11eb-8c49-3fad84c4a07f.jpg)](https://accounts.binance.com/en/register?ref=D7YA7CLY)                                  | binancecoinm  | [Binance COIN-M](https://accounts.binance.com/en/register?ref=D7YA7CLY)                                 | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://binance-docs.github.io/apidocs/delivery/en/)                                | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![binanceus](https://user-images.githubusercontent.com/1294454/65177307-217b7c80-da5f-11e9-876e-0b748ba0a358.jpg)](https://www.binance.us/?ref=35005074)                                                       | binanceus     | [Binance US](https://www.binance.us/?ref=35005074)                                                      | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://github.com/binance-us/binance-official-api-docs)                            |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![binanceusdm](https://user-images.githubusercontent.com/1294454/117738721-668c8d80-b205-11eb-8c49-3fad84c4a07f.jpg)](https://accounts.binance.com/en/register?ref=D7YA7CLY)                                   | binanceusdm   | [Binance USDⓈ-M](https://accounts.binance.com/en/register?ref=D7YA7CLY)                                 | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://binance-docs.github.io/apidocs/futures/en/)                                 | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitfinex](https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg)](https://www.bitfinex.com/?refcode=P61eYxFL)                                                  | bitfinex      | [Bitfinex](https://www.bitfinex.com/?refcode=P61eYxFL)                                                  | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.bitfinex.com/v1/docs)                                                  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitget](https://user-images.githubusercontent.com/1294454/195989417-4253ddb0-afbe-4a1c-9dea-9dbcd121fa5d.jpg)](https://www.bitget.com/expressly?languageType=0&channelCode=ccxt&vipCode=tg9j)                | bitget        | [Bitget](https://www.bitget.com/expressly?languageType=0&channelCode=ccxt&vipCode=tg9j)                 | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://bitgetlimited.github.io/apidoc/en/mix)                                      | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitmart](https://user-images.githubusercontent.com/1294454/129991357-8f47464b-d0f4-41d6-8a82-34122f0d1398.jpg)](http://www.bitmart.com/?r=rQCFLh)                                                            | bitmart       | [BitMart](http://www.bitmart.com/?r=rQCFLh)                                                             | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://developer-pro.bitmart.com/)                                                 | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitmex](https://user-images.githubusercontent.com/1294454/27766319-f653c6e6-5ed4-11e7-933d-f0bc3699ae8f.jpg)](https://www.bitmex.com/register/upZpOX)                                                        | bitmex        | [BitMEX](https://www.bitmex.com/register/upZpOX)                                                        | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://www.bitmex.com/app/apiOverview)                                             |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitopro](https://user-images.githubusercontent.com/1294454/158227251-3a92a220-9222-453c-9277-977c6677fe71.jpg)](https://www.bitopro.com)                                                                     | bitopro       | [BitoPro](https://www.bitopro.com)                                                                      | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://github.com/bitoex/bitopro-offical-api-docs/blob/master/v3-1/rest-1/rest.md) |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitrue](https://user-images.githubusercontent.com/1294454/139516488-243a830d-05dd-446b-91c6-c1f18fe30c63.jpg)](https://www.bitrue.com/activity/task/task-landing?inviteCode=EZWETQE&cn=900000)               | bitrue        | [Bitrue](https://www.bitrue.com/activity/task/task-landing?inviteCode=EZWETQE&cn=900000)                | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://github.com/Bitrue-exchange/bitrue-official-api-docs)                        |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitstamp](https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg)](https://www.bitstamp.net)                                                                    | bitstamp      | [Bitstamp](https://www.bitstamp.net)                                                                    | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://www.bitstamp.net/api)                                                       |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bittrex](https://user-images.githubusercontent.com/51840849/87153921-edf53180-c2c0-11ea-96b9-f2a9a95a455b.jpg)](https://bittrex.com/Account/Register?referralCode=1ZE-G0G-M3B)                               | bittrex       | [Bittrex](https://bittrex.com/Account/Register?referralCode=1ZE-G0G-M3B)                                | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://bittrex.github.io/api/v3)                                                   |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitvavo](https://user-images.githubusercontent.com/1294454/169202626-bd130fc5-fcf9-41bb-8d97-6093225c73cd.jpg)](https://bitvavo.com/?a=24F34952F7)                                                           | bitvavo       | [Bitvavo](https://bitvavo.com/?a=24F34952F7)                                                            | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.bitvavo.com/)                                                          | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bybit](https://user-images.githubusercontent.com/51840849/76547799-daff5b80-649e-11ea-87fb-3be9bac08954.jpg)](https://www.bybit.com/register?affiliate_id=35953)                                             | bybit         | [Bybit](https://www.bybit.com/register?affiliate_id=35953)                                              | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://bybit-exchange.github.io/docs/inverse/)                                     | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![cex](https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg)](https://cex.io/r/0/up105393824/0/)                                                                | cex           | [CEX.IO](https://cex.io/r/0/up105393824/0/)                                                             | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://cex.io/cex-api)                                                             |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![coinbaseprime](https://user-images.githubusercontent.com/1294454/44539184-29f26e00-a70c-11e8-868f-e907fc236a7c.jpg)](https://exchange.coinbase.com)                                                          | coinbaseprime | [Coinbase Prime](https://exchange.coinbase.com)                                                         | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://docs.exchange.coinbase.com)                                                 |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![coinbasepro](https://user-images.githubusercontent.com/1294454/41764625-63b7ffde-760a-11e8-996d-a6328fa9347a.jpg)](https://pro.coinbase.com/)                                                                | coinbasepro   | [Coinbase Pro](https://pro.coinbase.com/)                                                               | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://docs.pro.coinbase.com)                                                      |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![coinex](https://user-images.githubusercontent.com/51840849/87182089-1e05fa00-c2ec-11ea-8da9-cc73b45abbbc.jpg)](https://www.coinex.com/register?refer_code=yw5fz)                                             | coinex        | [CoinEx](https://www.coinex.com/register?refer_code=yw5fz)                                              | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://github.com/coinexcom/coinex_exchange_api/wiki)                              |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![cryptocom](https://user-images.githubusercontent.com/1294454/147792121-38ed5e36-c229-48d6-b49a-48d05fc19ed4.jpeg)](https://crypto.com/exch/5835vstech)                                                       | cryptocom     | [Crypto.com](https://crypto.com/exch/5835vstech)                                                        | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://exchange-docs.crypto.com/spot/index.html)                                   |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![currencycom](https://user-images.githubusercontent.com/1294454/83718672-36745c00-a63e-11ea-81a9-677b1f789a4d.jpg)](https://currency.com/trading/signup?c=362jaimv&pid=referral)                              | currencycom   | [Currency.com](https://currency.com/trading/signup?c=362jaimv&pid=referral)                             | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://currency.com/api)                                                           |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![deribit](https://user-images.githubusercontent.com/1294454/41933112-9e2dd65a-798b-11e8-8440-5bab2959fcb8.jpg)](https://www.deribit.com/reg-1189.4038)                                                        | deribit       | [Deribit](https://www.deribit.com/reg-1189.4038)                                                        | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.deribit.com/v2)                                                        |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![flowbtc](https://user-images.githubusercontent.com/51840849/87443317-01c0d080-c5fe-11ea-95c2-9ebe1a8fafd9.jpg)](https://one.ndax.io/bfQiSL)                                                                  | flowbtc       | [flowBTC](https://one.ndax.io/bfQiSL)                                                                   | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://www.flowbtc.com.br/api.html)                                                |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![fmfwio](https://user-images.githubusercontent.com/1294454/159177712-b685b40c-5269-4cea-ac83-f7894c49525d.jpg)](https://fmfw.io/referral/da948b21d6c92d69)                                                    | fmfwio        | [FMFW.io](https://fmfw.io/referral/da948b21d6c92d69)                                                    | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://api.fmfw.io/api/2/explore/)                                                 |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![gate](https://user-images.githubusercontent.com/1294454/31784029-0313c702-b509-11e7-9ccc-bc0da6a0e435.jpg)](https://www.gate.io/ref/2436035)                                                                 | gate          | [Gate.io](https://www.gate.io/ref/2436035)                                                              | [![API Version 4](https://img.shields.io/badge/4-lightgray)](https://www.gate.io/docs/apiv4/en/index.html)                                       | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![hitbtc](https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg)](https://hitbtc.com/?ref_id=5a5d39a65d466)                                                      | hitbtc        | [HitBTC](https://hitbtc.com/?ref_id=5a5d39a65d466)                                                      | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://api.hitbtc.com/v2)                                                          |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![hollaex](https://user-images.githubusercontent.com/1294454/75841031-ca375180-5ddd-11ea-8417-b975674c23cb.jpg)](https://pro.hollaex.com/signup?affiliation_code=QSWA6G)                                       | hollaex       | [HollaEx](https://pro.hollaex.com/signup?affiliation_code=QSWA6G)                                       | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://apidocs.hollaex.com)                                                        |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![huobi](https://user-images.githubusercontent.com/1294454/76137448-22748a80-604e-11ea-8069-6e389271911d.jpg)](https://www.huobi.com/en-us/v/register/double-invite/?inviter_id=11343840&invite_code=6rmm2223) | huobi         | [Huobi](https://www.huobi.com/en-us/v/register/double-invite/?inviter_id=11343840&invite_code=6rmm2223) | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://huobiapi.github.io/docs/spot/v1/cn/)                                        | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![huobijp](https://user-images.githubusercontent.com/1294454/85734211-85755480-b705-11ea-8b35-0b7f1db33a2f.jpg)](https://www.huobi.co.jp/register/?invite_code=znnq3)                                          | huobijp       | [Huobi Japan](https://www.huobi.co.jp/register/?invite_code=znnq3)                                      | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://api-doc.huobi.co.jp)                                                        |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![idex](https://user-images.githubusercontent.com/51840849/94481303-2f222100-01e0-11eb-97dd-bc14c5943a86.jpg)](https://idex.io)                                                                                | idex          | [IDEX](https://idex.io)                                                                                 | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://docs.idex.io/)                                                              | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![kraken](https://user-images.githubusercontent.com/51840849/76173629-fc67fb00-61b1-11ea-84fe-f2de582f58a3.jpg)](https://www.kraken.com)                                                                       | kraken        | [Kraken](https://www.kraken.com)                                                                        | [![API Version 0](https://img.shields.io/badge/0-lightgray)](https://www.kraken.com/features/api)                                                |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![kucoin](https://user-images.githubusercontent.com/51840849/87295558-132aaf80-c50e-11ea-9801-a2fb0c57c799.jpg)](https://www.kucoin.com/ucenter/signup?rcode=E5wkqe)                                           | kucoin        | [KuCoin](https://www.kucoin.com/ucenter/signup?rcode=E5wkqe)                                            | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.kucoin.com)                                                            | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![luno](https://user-images.githubusercontent.com/1294454/27766607-8c1a69d8-5ede-11e7-930c-540b5eb9be24.jpg)](https://www.luno.com/invite/44893A)                                                              | luno          | [luno](https://www.luno.com/invite/44893A)                                                              | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://www.luno.com/en/api)                                                        |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![mexc](https://user-images.githubusercontent.com/1294454/137283979-8b2a818d-8633-461b-bfca-de89e8c446b2.jpg)](https://m.mexc.com/auth/signup?inviteCode=1FQ1G)                                                | mexc          | [MEXC Global](https://m.mexc.com/auth/signup?inviteCode=1FQ1G)                                          | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://mxcdevelop.github.io/APIDoc/)                                               | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![ndax](https://user-images.githubusercontent.com/1294454/108623144-67a3ef00-744e-11eb-8140-75c6b851e945.jpg)](https://one.ndax.io/bfQiSL)                                                                     | ndax          | [NDAX](https://one.ndax.io/bfQiSL)                                                                      | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://apidoc.ndax.io/)                                                            |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![okcoin](https://user-images.githubusercontent.com/51840849/87295551-102fbf00-c50e-11ea-90a9-462eebba5829.jpg)](https://www.okcoin.com/account/register?flag=activity&channelId=600001513)                    | okcoin        | [OKCoin](https://www.okcoin.com/account/register?flag=activity&channelId=600001513)                     | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://www.okcoin.com/docs/en/)                                                    |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![okx](https://user-images.githubusercontent.com/1294454/152485636-38b19e4a-bece-4dec-979a-5982859ffc04.jpg)](https://www.okx.com/join/1888677)                                                                | okx           | [OKX](https://www.okx.com/join/1888677)                                                                 | [![API Version 5](https://img.shields.io/badge/5-lightgray)](https://www.okx.com/docs-v5/en/)                                                    | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![phemex](https://user-images.githubusercontent.com/1294454/85225056-221eb600-b3d7-11ea-930d-564d2690e3f6.jpg)](https://phemex.com/register?referralCode=EDNVJ)                                                | phemex        | [Phemex](https://phemex.com/register?referralCode=EDNVJ)                                                | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://github.com/phemex/phemex-api-docs)                                          |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![ripio](https://user-images.githubusercontent.com/1294454/94507548-a83d6a80-0218-11eb-9998-28b9cec54165.jpg)](https://exchange.ripio.com)                                                                     | ripio         | [Ripio](https://exchange.ripio.com)                                                                     | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://exchange.ripio.com/en/api/)                                                 |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![upbit](https://user-images.githubusercontent.com/1294454/49245610-eeaabe00-f423-11e8-9cba-4b0aed794799.jpg)](https://upbit.com)                                                                              | upbit         | [Upbit](https://upbit.com)                                                                              | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.upbit.com/docs/%EC%9A%94%EC%B2%AD-%EC%88%98-%EC%A0%9C%ED%95%9C)        |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![wazirx](https://user-images.githubusercontent.com/1294454/148647666-c109c20b-f8ac-472f-91c3-5f658cb90f49.jpeg)](https://wazirx.com/invite/k7rrnks5)                                                          | wazirx        | [WazirX](https://wazirx.com/invite/k7rrnks5)                                                            | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.wazirx.com/#public-rest-api-for-wazirx)                                |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![woo](https://user-images.githubusercontent.com/1294454/150730761-1a00e5e0-d28c-480f-9e65-089ce3e6ef3b.jpg)](https://referral.woo.org/BAJS6oNmZb3vi3RGA)                                                      | woo           | [WOO X](https://referral.woo.org/BAJS6oNmZb3vi3RGA)                                                     | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.woo.org/)                                                              |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![zb](https://user-images.githubusercontent.com/1294454/32859187-cd5214f0-ca5e-11e7-967d-96568e2e2bd1.jpg)](https://www.zb.com/en/register?ref=4301lera)                                                       | zb            | [ZB](https://www.zb.com/en/register?ref=4301lera)                                                       | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://www.zb.com/i/developer)                                                     |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![zipmex](https://user-images.githubusercontent.com/1294454/146103275-c39a34d9-68a4-4cd2-b1f1-c684548d311b.jpg)](https://trade.zipmex.com/global/accounts/sign-up?aff=KLm7HyCsvN)                              | zipmex        | [Zipmex](https://trade.zipmex.com/global/accounts/sign-up?aff=KLm7HyCsvN)                               | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://apidoc.ndax.io/)                                                            |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |

This is the list of exchanges in CCXT Pro with support for WebSockets APIs. This list will be updated with new exchanges on a regular basis.

Full list of exchanges available in CCXT via REST: [Supported Cryptocurrency Exchange Markets](https://github.com/ccxt/ccxt/#supported-cryptocurrency-exchange-markets).

## Usage

```diff
- this part of the doc is under heavy development right now
- there may be some typos, mistakes and missing info here and there
- contributions, pull requests and feedback appreciated
```

## Prerequisites

The best way to understand CCXT Pro is to make sure you grasp the entire CCXT Manual and practice standard CCXT first. CCXT Pro borrows from CCXT. The two libraries share a lot of commonalities, including:

- the concepts of public API and private authenticated API
- markets, symbols, currency codes and ids
- unified data structures and formats, orderbooks, trades, orders, candles, timeframes, ...
- exceptions and error mappings
- authentication and API keys (for private feeds and calls)
- configuration options

The CCXT Pro audience consists mostly of professional algorithmic traders and developers. In order to work efficiently with this library the user is required to be well-familiar with the concepts of streaming. One has to understand the underlying differences between connection-based streaming APIs ([WebSocket](https://en.wikipedia.org/wiki/WebSocket), CCXT Pro) and request-response based APIs ([REST](https://en.wikipedia.org/wiki/Representational_state_transfer), CCXT).

The general async-style flow for a CCXT application is as follows:

```JavaScript

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

In CCXT Pro each public and private unified RESTful method having a `fetch*` prefix also has a corresponding stream-based counterpart method prefixed with `watch*`, as follows:

- Public API
  - `fetchStatus` → `watchStatus`
  - `fetchOrderBook` → `watchOrderBook`
  - `fetchTicker` → `watchTicker`
  - `fetchTickers` → `watchTickers`
  - `fetchOHLCV` → `watchOHLCV`
  - `fetchTrades` → `watchTrades`
- Private API
  - `fetchBalance` → `watchBalance`
  - `fetchOrders` → `watchOrders`
  - `fetchMyTrades` → `watchMyTrades`
  - `fetchTransactions` → `watchTransactions`
  - `fetchLedger` → `watchLedger`
  - `createOrder` → `watchCreateOrder` <sup>*(notice the `watch` prefix)*</sup>
  - `cancelOrder` → `watchCancelOrder` <sup>*(notice the `watch` prefix)*</sup>

The Unified CCXT Pro Streaming API inherits CCXT usage patterns to make migration easier.

The general async-style flow for a CCXT Pro application (as opposed to a CCXT application above) is shown below:

```JavaScript

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

That usage pattern is usually wrapped up into a core business-logic method called _"a `tick()` function"_, since it reiterates a reaction to the incoming events (aka _ticks_). From the two examples above it is obvious that the generic usage pattern in CCXT Pro and CCXT is identical.

Many of the CCXT rules and concepts also apply to CCXT Pro:

- CCXT Pro will load markets and will cache markets upon the first call to a unified API method
- CCXT Pro will call CCXT RESTful methods under the hood if necessary
- CCXT Pro will throw standard CCXT exceptions where necessary
- ...

## Streaming Specifics

Despite of the numerous commonalities, streaming-based APIs have their own specifics, because of their connection-based nature.

Having a connection-based interface implies connection-handling mechanisms. Connections are managed by CCXT Pro transparently to the user. Each exchange instance manages its own set of connections.

Upon your first call to any `watch*()` method the library will establish a connection to a specific stream/resource of the exchange and will maintain it. If the connection already exists – it is reused. The library will handle the subscription request/response messaging sequences as well as the authentication/signing if the requested stream is private.

The library will also watch the status of the uplink and will keep the connection alive. Upon a critical exception, a disconnect or a connection timeout/failure, the next iteration of the tick function will call the `watch` method that will trigger a reconnection. This way the library handles disconnections and reconnections for the user transparently. CCXT Pro applies the necessary rate-limiting and exponential backoff reconnection delays. All of that functionality is enabled by default and can be configured via exchange properties, as usual.

Most of the exchanges only have a single base URL for streaming APIs (usually, WebSocket, starting with `ws://` or `wss://`). Some of them may have more than one URL for each stream, depending on the feed in question.

Exchanges' Streaming APIs can be classified into two different categories:

- *sub* or *subscribe* allows receiving only
- *pub* or *publish* allows sending and receiving

### Sub

A *sub* interface usually allows to subscribe to a stream of data and listen for it. Most of exchanges that do support WebSockets will offer a *sub* type of API only. The *sub* type includes streaming public market data. Sometimes exchanges also allow subcribing to private user data. After the user subscribes to a data feed the channel effectively starts working one-way sending updates from the exchange towards the user continuously.

Commonly appearing types of public data streams:

- order book (most common) - updates on added, edited and deleted orders (aka *change deltas*)
- ticker updates upon changing of 24 hour stats
- fills feed (also common) - a live stream of public trades
- ohlcv candlestick feed
- heartbeat
- exchange chat/trollbox

Less common types of private user data streams:

- the stream of private trades of the user
- live order updates
- balance updates
- custom streams
- exchange-specific and other streams

### Pub

A *pub* interface usually allows users to send data requests towards the server. This usually includes common user actions, like:

- placing orders
- canceling orders
- placing withdrawal requests
- posting chat/trollbox messages
- etc

**Some exchanges do not offer a *pub* WS API, they will offer *sub* WS API only.** However, there are exchanges that have a complete Streaming API as well. In most cases a user cannot operate effectively having just the Streaming API. Exchanges will stream public market data *sub*, and the REST API is still needed for the *pub* part where missing.

### Incremental Data Structures

In many cases due to a unidirectional nature of the underlying data feeds, the application listening on the client-side has to keep a local snapshot of the data in memory and merge the updates received from the exchange server into the local snapshot. The updates coming from the exchange are also often called _deltas_, because in most cases those updates will contain just the changes between two states of the data and will not include the data that has not changed making it necessary to store the locally cached current state S of all relevant data objects.

All of that functionality is handled by CCXT Pro for the user. To work with CCXT Pro, the user does not have to track or manage subscriptions and related data. CCXT Pro will keep a cache of structures in memory to handle the underlying hassle.

Each incoming update says which parts of the data have changed and the receiving side "increments" local state S by merging the update on top of current state S and moves to next local state S'. In terms of CCXT Pro that is called _"incremental state"_ and the structures involved in the process of storing and updating the cached state are called _"incremental structures"_. CCXT Pro introduces several new base classes to handle the incremental state where necessary.

The incremental structures returned from the unified methods of CCXT Pro are often one of two types:

1. JSON-decoded object (`object` in JavaScript, `dict` in Python, `array()` in PHP). This type may be returned from public and private methods like `watchOrderBook`, `watchTicker`, `watchBalance`, `watchOrder`, etc.
2. An array/list of objects (usually sorted in chronological order). This type may be returned from methods like `watchOHLCV`, `watchTrades`, `watchMyTrades`, `watchOrders`, etc.

The unified methods returning arrays like `watchOHLCV`, `watchTrades`, `watchMyTrades`, `watchOrders`, are based on the caching layer. The user has to understand the inner workings of the caching layer to work with it efficiently.

The cache is a fixed-size deque aka array/list with two ends. The CCXT Pro library has a reasonable limit on the number of objects stored in memory. By default the caching array structures will store up to 1000 entries of each type (1000 most recent trades, 1000 most recent candles, 1000 most recent orders). The allowed maximum number can be configured by the user upon instantiation or later:

```Python
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

The cache limits have to be set prior to calling any watch-methods and cannot change during a program run.

When there is space left in the cache, new elements are simply appended to the end of it. If there's not enough room to fit a new element, the oldest element is deleted from the beginning of the cache to free some space. Thus, for example, the cache grows from 0 to 1000 most recent trades and then stays at 1000 most recent trades max, constantly renewing the stored data with each new update incoming from the exchange. It reminds a sliding frame window or a sliding door, that looks like shown below:

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

The user can configure the cache limits using the `exchange.options` as was shown above. Do not confuse the cache limits with the pagination limit.

**Note, that the `since` and `limit` [date-based pagination](Manual#date-based-pagination) params have a different meaning and are always applied within the cached window!** If the user specifies a `since` argument to the `watchTrades()` call, CCXT Pro will return all cached trades having `timestamp >= since`. If the user does not specify a `since` argument, CCXT pro will return cached trades from the beginning of the sliding window. If the user specifies a `limit` argument, the library will return up to `limit` candles starting from `since` or from the beginning of the cache. For that reason the user cannot paginate beyond the cached frame due to the WebSocket real-time specifics.

```Python
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

#### newUpdates mode

If you want to always get just the most recent trade, **you should instantiate the exchange with the newUpdates flag set to true**.

```Python
exchange = ccxtpro.binance({'newUpdates': True})
while True:
    trades = await exchange.watchTrades (symbol)
    print(trades)
```

The newUpdates mode continues to utilize the sliding cache in the background, but the user will only be given the new updates. This is because some exchanges use incremental structures, so we need to keep a cache of objects as the exchange may only provide partial information such as status updates.

The result from the newUpdates mode will be one or more updates that have occurred since the last time `exchange.watchMethod` resolved. CCXT Pro can return one or more orders that were updated since the previous call. The result of calling `exchange.watchOrders` will look like shown below:

```JavaScript
[
    order, // see https://docs.ccxt.com/en/latest/manual.html#order-structure
    order,
    order,
    ...
]
```

*Deprecation Warning*: in the future `newUpdates: true` will be the default mode and you will have to set newUpdates to false to get the sliding cache.

```JavaScript
// JavaScript
const ccxtpro = require ('ccxt.pro')
console.log ('CCXT version', ccxtpro.version)
console.log ('Supported exchanges:', ccxtpro.exchanges)
```

```Python
# Python
import ccxt.pro as ccxtpro
print('CCXT version', ccxtpro.__version__)
print('Supported exchanges:', ccxtpro.exchanges)
```

```PHP
// PHP
use \ccxt\pro; // optional, since you can use fully qualified names
echo 'CCXT version ', \ccxt\pro\Exchange::VERSION, "\n";
echo 'Supported exchanges: ', json_encode(\ccxt\pro\Exchange::$exchanges), "\n";
```

The imported CCXT Pro module wraps the CCXT inside itself – every exchange instantiated via CCXT Pro has all the CCXT methods as well as the additional functionality.

## Instantiation

CCXT Pro is designed for async/await style syntax and relies heavily on async primitives such as *promises* and *futures*.

Creating a CCXT Pro exchange instance is pretty much identical to creating a CCXT exchange instance.

```JavaScript
// JavaScript
const ccxt = require ('ccxt.pro')
const exchange = new ccxtpro.binance ({ newUpdates: false })
```

The Python implementation of CCXT Pro relies on builtin [asyncio](https://docs.python.org/3/library/asyncio.html) and [Event Loop](https://docs.python.org/3/library/asyncio-eventloop.html) in particular. In Python it is possible to supply an asyncio's event loop instance in the constructor arguments as shown below (identical to `ccxt.async support`):

```Python
# Python
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

In PHP the async primitives are borrowed from [ReactPHP](https://reactphp.org). The PHP implementation of CCXT Pro relies on [Promise](https://github.com/reactphp/promise) and [EventLoop](https://github.com/reactphp/event-loop) in particular. In PHP the user is required to supply a ReactPHP's event loop instance in the constructor arguments as shown below:

```PHP
// PHP
error_reporting(E_ALL | E_STRICT);
date_default_timezone_set('UTC');
require_once 'vendor/autoload.php';

$loop = \React\EventLoop\Factory::create(); // the event loop goes here ↓
$exchange = new \ccxt\pro\kucoin(array('loop' => $loop, 'newUpdates': false ));
```

## Exchange Properties

Every CCXT Pro instance contains all properties of the underlying CCXT instance. Apart from the standard CCXT properties, the CCXT Pro instance includes the following:

```JavaScript
{
    'has': { // an associative array of extended exchange capabilities
        'ws': true, // only available in CCXT Pro
        'watchOrderBook': true,
        'watchTicker': true,
        'watchTrades': true,
        'watchOHLCV': true,
        'watchBalance': true,
        'watchCreateOrder': true,
        'watchCancelOrder': true,
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

The Unified CCXT Pro API encourages direct control flow for better codestyle, more readable and architecturally superior code compared to using EventEmitters and callbacks. The latter is considered an outdated approach nowadays since it requires inversion of control (people aren't used to inverted thinking).

CCXT Pro goes with the modern approach and it is designed for the async syntax. Under the hood, CCXT Pro will still have to use inverted control flow sometimes because of the dependencies and the WebSocket libs that can't do otherwise.

The same is true not only for JS/ES6 but also for Python 3 async code as well. In PHP the async primitives are borrowed from [ReactPHP](https://reactphp.org/).

Modern async syntax allows you to combine and split the execution into parallel pathways and then merge them, group them, prioritize them, and what not. With promises one can easily convert from direct async-style control flow to inverted callback-style control flow, back and forth.

### Real-Time vs Throttling

CCXT Pro supports two modes of tick function loops – the real-time mode and the throttling mode. Both of them are shown below in pseudocode:

```JavaScript
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

```JavaScript
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

In **real-time mode** CCXT Pro will return the result as soon as each new delta arrives from the exchange. The general logic of a unified call in a real-time loop is to await for the next delta and immediately return the unified result structure to the user, over and over again. This is useful when reaction time is critical, or has to be as fast as possible.

However, the real-time mode requires programming experience with async flows when it comes to synchronizing multiple parallel tick loops. Apart from that, the exchanges can stream a very large number of updates during periods of high activity or high volatility. Therefore the user developing a real-time algorithm has to make sure that the userland code is capable of consuming data that fast. Working in real-time mode may be more demanding for resources sometimes.

In **throttling mode** CCXT Pro will receive and manage the data in the background. The user is responsible for calling the results from time to time when necessary. The general logic of the throttling loop is to sleep for most of the time and wake up to check the results occasionally. This is usually done at some fixed frequency, or, _"frame rate"_. The code inside a throttling loop is often easier to synchronize across multiple exchanges. The rationing of time spent in a throttled loop also helps reduce resource usage to a minimum. This is handy when your algorithm is heavy and you want to control the execution precisely to avoid running it too often.

The obvious downside of the throttling mode is being less reactive or responsive to updates. When a trading algorithm has to wait some number milliseconds before being executed – an update or two may arrive sooner than that time expires. In throttling mode the user will only check for those updates upon next wakeup (loop iteration), so the reaction lag may vary within some number of milliseconds over time.

### Public Methods

#### Market Data

##### watchOrderBook

The `watchOrderBook`'s interface is identical to [fetchOrderBook](https://docs.ccxt.com/en/latest/manual.html#order-book). It accepts three arguments:

- `symbol` – string, a unified CCXT symbol, required
- `limit` – integer, the max number of bids/asks returned, optional
- `params` – assoc dictionary, optional overrides as described in [Overriding Unified API Params](https://docs.ccxt.com/en/latest/manual.html#overriding-unified-api-params)

In general, the exchanges can be divided in two categories:

1. the exchanges that support limited orderbooks (streaming just the top part of the stack of orders)
2. the exchanges that stream full orderbooks only

If the exchange accepts a limiting argument, the `limit` argument is sent towards the exchange upon subscribing to the orderbook stream over a WebSocket connection. The exchange will then send only the specified amount of orders which helps reduce the traffic. Some exchanges may only accept certain values of `limit`, like 10, 25, 50, 100 and so on.

If the underlying exchange does not accept a limiting argument, the limiting is done on the client side.

The `limit` argument does not guarantee that the number of bids or asks will always be equal to `limit`. It designates the upper boundary or the maximum, so at some moment in time there may be less than `limit` bids or asks, but never more than `limit` bids or asks. This is the case when the exchange does not have enough orders on the orderbook, or when one of the top orders in the orderbook gets matched and removed from the orderbook, leaving less than `limit` entries on either bids side or asks side. The free space in the orderbook usually gets quickly filled with new data.

```JavaScript
// JavaScript
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

```Python
# Python
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

```PHP
// PHP
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

##### watchTicker
Some exchanges allow different topics to listen to tickers (ie: bookTicker). You can set this in `exchange.options['watchTicker']['name']`
```JavaScript
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

```Python
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

```PHP
// PHP
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

##### watchTickers

```JavaScript
// JavaScript
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

```Python
# Python
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

```PHP
// PHP
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

##### watchOHLCV

A very common misconception about WebSockets is that WS OHLCV streams can somehow speed up a trading strategy.
If the purpose of your app is to implement OHLCV-trading or a speculative algorithmic strategy, **consider the following carefully**.

In general, there's two types of trading data used in the algorithms:

- 1st-order real-time data like orderbooks and trades
- 2nd-order non-real-time data like tickers, ohlcvs, etc

When developers say _"real-time"_, that usually means pseudo real-time, or, put simply, _"as fast and as close to real time as possible"_.

The 2nd-order data is **always** calculated from the 1st-order data. OHLCVs are calculated from aggregated trades. Tickers are calculated from trades and orderbooks.

Some exchanges do the calculation of OHLCVs (2nd order data) for you on the exchange side and send you updates over WS (Binance). Other exchanges don't really think that is necessary, for a reason.

Obviously, it takes time to calculate 2nd-order OHLCV candles from trades. Apart from that sending the calculated candle back to all connected users also takes time. Additional delays can happen during periods of high volatility if an exchange is traded very actively under high load.

There is no strict guarantee on how much time it will take from the exchange to calculate the 2nd order data and stream it to you over WS. The delays and lags on OHLCV candles can vary significantly from exchange to exchange. For example, an exchange can send an OHLCV update ~30 seconds after the actual closing of a corresponding period. Other exchanges may send the current OHLCV updates at a regular intervals (say, once every 100ms), while in reality trades can happen much more frequently.

Most people use WS to avoid any sorts of delays and have real-time data. So, in most cases it is much better to not wait for the exchange. Recalculating the 2nd order data from 1st order data on your own may be much faster and that can lower the unnecessary delays. Therefore it does not make much sense to use WS for watching just the OHLCV candles from the exchange. Developers would rather `watch_trades()` instead and recalculate the OHLCV candles using CCXT's built-in methods like `build_ohlcvc()`.

```Python
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

That explains why some exchanges reasonably think that OHLCVs are not necessary in the WS context, cause users can calculate that information in the userland much faster having just a WS stream of realtime 1st-order trades.

If your application is not very time-critical, you can still subscribe to OHLCV streams, for charting purposes. If the underlying `exchange.has['watchOHLCV']`, you can `watchOHLCV()/watch_ohlcv()` as shown below:

```JavaScript
// JavaScript
if (exchange.has['watchOHLCV']) {
    while (true) {
        try {
            const candles = await exchange.watchOHLCV (symbol, since, limit, params)
            console.log (new Date (), candles)
        } catch (e) {
            console.log (e)
            // stop the loop on exception or leave it commented to retry
            // throw e
        }
    }
}
```

```Python
# Python
if exchange.has['watchOHLCV']:
    while True:
        try:
            candles = await exchange.watch_ohlcv(symbol, since, limit, params)
            print(exchange.iso8601(exchange.milliseconds()), candles)
        except Exception as e:
            print(e)
            # stop the loop on exception or leave it commented to retry
            # raise e
```

```PHP
// PHP
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

##### watchTrades

```JavaScript
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

```Python
# Python
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

```PHP
// PHP
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

### Private Methods

```diff
- work in progress now
```

#### Authentication

In most cases the authentication logic is borrowed from CCXT since the exchanges use the same keypairs and signing algorithms for REST APIs and WebSocket APIs. See [API Keys Setup](https://docs.ccxt.com/en/latest/manual.html#api-keys-setup) for more details.

#### Trading

##### watchBalance

```JavaScript
// JavaScript
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

```Python
# Python
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

```PHP
// PHP
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

##### watchOrders

```diff
- this method is a work in progress now (may be unavailable)
```

##### watchCreateOrder

```diff
- this method is a work in progress now (may be unavailable)
```

##### watchCancelOrder

```diff
- this method is a work in progress now (may be unavailable)
```

##### watchMyTrades

```diff
- this method is a work in progress now (may be unavailable)
```

```JavaScript
// JavaScript
watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {})
```

```Python
# Python
watch_my_trades(symbol=None, since=None, limit=None, params={})
```

```PHP
// PHP
watch_my_trades($symbol = null, $since = null, $lmit = null, $params = array());
```

#### Funding

##### watchTransactions

```diff
- this method is a work in progress now (may be unavailable)
```

### Error Handling

In case of an error the CCXT Pro will throw a standard CCXT exception, see [Error Handling](https://docs.ccxt.com/en/latest/manual.html#error-handling) for more details.
