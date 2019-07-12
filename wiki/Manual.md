# Overview

The ccxt library is a collection of available crypto *exchanges* or exchange classes. Each class implements the public and private API for a particular crypto exchange. All exchanges are derived from the base Exchange class and share a set of common methods. To access a particular exchange from ccxt library you need to create an instance of corresponding exchange class. Supported exchanges are updated frequently and new exchanges are added regularly.

The structure of the library can be outlined as follows:

```
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

Full public and private HTTP REST APIs for all exchanges are implemented. WebSocket and FIX implementations in JavaScript, PHP, Python and other languages coming soon.

- [Exchanges](#exchanges)
- [Markets](#markets)
- [API Methods / Endpoints](#api-methods--endpoints)
- [Market Data](#market-data)
- [Trading](#trading)

# Exchanges

The ccxt library currently supports the following 123 cryptocurrency exchange markets and trading APIs:

|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;logo&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;                                                                                                       | id                 | name                                                                                    | ver | doc                                                                                          | certified                                                                                                                  |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------|-----------------------------------------------------------------------------------------|:---:|:--------------------------------------------------------------------------------------------:|----------------------------------------------------------------------------------------------------------------------------|
|[![_1btcxe](https://user-images.githubusercontent.com/1294454/27766049-2b294408-5ecc-11e7-85cc-adaff013dc1a.jpg)](https://1btcxe.com)                                                          | _1btcxe            | [1BTCXE](https://1btcxe.com)                                                            | *   | [API](https://1btcxe.com/api-docs.php)                                                       |                                                                                                                             | Panama                                  |
|[![acx](https://user-images.githubusercontent.com/1294454/30247614-1fe61c74-9621-11e7-9e8c-f1a627afa279.jpg)](https://acx.io)                                                                  | acx                | [ACX](https://acx.io)                                                                   | 2   | [API](https://acx.io/documents/api_v2)                                                       |                                                                                                                             | Australia                               |
|[![allcoin](https://user-images.githubusercontent.com/1294454/31561809-c316b37c-b061-11e7-8d5a-b547b4d730eb.jpg)](https://www.allcoin.com)                                                     | allcoin            | [Allcoin](https://www.allcoin.com)                                                      | 1   | [API](https://www.allcoin.com/api_market/market)                                             |                                                                                                                             | Canada                                  |
|[![anxpro](https://user-images.githubusercontent.com/1294454/27765983-fd8595da-5ec9-11e7-82e3-adb3ab8c2612.jpg)](https://anxpro.com)                                                           | anxpro             | [ANXPro](https://anxpro.com)                                                            | *   | [API](https://anxv2.docs.apiary.io)                                                          |                                                                                                                             | Japan, Singapore, Hong Kong, New Zealand|
|[![bcex](https://user-images.githubusercontent.com/1294454/43362240-21c26622-92ee-11e8-9464-5801ec526d77.jpg)](https://www.bcex.top/register?invite_code=758978&lang=en)                       | bcex               | [BCEX](https://www.bcex.top/register?invite_code=758978&lang=en)                        | 1   | [API](https://github.com/BCEX-TECHNOLOGY-LIMITED/API_Docs/wiki/Interface)                    |                                                                                                                             | China, Canada                           |
|[![bequant](https://user-images.githubusercontent.com/1294454/55248342-a75dfe00-525a-11e9-8aa2-05e9dca943c6.jpg)](https://bequant.io)                                                          | bequant            | [Bequant](https://bequant.io)                                                           | 2   | [API](https://api.bequant.io/)                                                               |                                                                                                                             | Malta                                   |
|[![bibox](https://user-images.githubusercontent.com/1294454/34902611-2be8bf1a-f830-11e7-91a2-11b2f292e750.jpg)](https://www.bibox.com/signPage?id=11114745&lang=en)                            | bibox              | [Bibox](https://www.bibox.com/signPage?id=11114745&lang=en)                             | 1   | [API](https://github.com/Biboxcom/api_reference/wiki/home_en)                                |                                                                                                                             | China, US, South Korea                  |
|[![bigone](https://user-images.githubusercontent.com/1294454/42803606-27c2b5ec-89af-11e8-8d15-9c8c245e8b2c.jpg)](https://b1.run/users/new?code=D3LLBVFT)                                       | bigone             | [BigONE](https://b1.run/users/new?code=D3LLBVFT)                                        | 2   | [API](https://open.big.one/docs/api.html)                                                    |                                                                                                                             | UK                                      |
|[![binance](https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg)](https://www.binance.com/?ref=10205187)                                       | binance            | [Binance](https://www.binance.com/?ref=10205187)                                        | *   | [API](https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md) | [![CCXT Certified](https://img.shields.io/badge/CCXT-certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | Japan, Malta                            |
|[![binanceje](https://user-images.githubusercontent.com/1294454/54874009-d526eb00-4df3-11e9-928c-ce6a2b914cd1.jpg)](https://www.binance.je/?ref=35047921)                                      | binanceje          | [Binance Jersey](https://www.binance.je/?ref=35047921)                                  | *   | [API](https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md) |                                                                                                                             | Jersey                                  |
|[![bit2c](https://user-images.githubusercontent.com/1294454/27766119-3593220e-5ece-11e7-8b3a-5a041f6bcc3f.jpg)](https://bit2c.co.il/Aff/63bfed10-e359-420c-ab5a-ad368dab0baf)                  | bit2c              | [Bit2C](https://bit2c.co.il/Aff/63bfed10-e359-420c-ab5a-ad368dab0baf)                   | *   | [API](https://www.bit2c.co.il/home/api)                                                      |                                                                                                                             | Israel                                  |
|[![bitbank](https://user-images.githubusercontent.com/1294454/37808081-b87f2d9c-2e59-11e8-894d-c1900b7584fe.jpg)](https://bitbank.cc/)                                                         | bitbank            | [bitbank](https://bitbank.cc/)                                                          | 1   | [API](https://docs.bitbank.cc/)                                                              |                                                                                                                             | Japan                                   |
|[![bitbay](https://user-images.githubusercontent.com/1294454/27766132-978a7bd8-5ece-11e7-9540-bc96d1e9bbb8.jpg)](https://auth.bitbay.net/ref/jHlbB4mIkdS1)                                     | bitbay             | [BitBay](https://auth.bitbay.net/ref/jHlbB4mIkdS1)                                      | *   | [API](https://bitbay.net/public-api)                                                         |                                                                                                                             | Malta, EU                               |
|[![bitfinex](https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg)](https://www.bitfinex.com)                                                   | bitfinex           | [Bitfinex](https://www.bitfinex.com)                                                    | 1   | [API](https://docs.bitfinex.com/v1/docs)                                                     | [![CCXT Certified](https://img.shields.io/badge/CCXT-certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | British Virgin Islands                  |
|[![bitfinex2](https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg)](https://www.bitfinex.com)                                                  | bitfinex2          | [Bitfinex](https://www.bitfinex.com)                                                    | 2   | [API](https://docs.bitfinex.com/v2/docs/)                                                    |                                                                                                                             | British Virgin Islands                  |
|[![bitflyer](https://user-images.githubusercontent.com/1294454/28051642-56154182-660e-11e7-9b0d-6042d1e6edd8.jpg)](https://bitflyer.jp)                                                        | bitflyer           | [bitFlyer](https://bitflyer.jp)                                                         | 1   | [API](https://lightning.bitflyer.com/docs?lang=en)                                           |                                                                                                                             | Japan                                   |
|[![bitforex](https://user-images.githubusercontent.com/1294454/44310033-69e9e600-a3d8-11e8-873d-54d74d1bc4e4.jpg)](https://www.bitforex.com/en/invitationRegister?inviterId=1867438)           | bitforex           | [Bitforex](https://www.bitforex.com/en/invitationRegister?inviterId=1867438)            | 1   | [API](https://github.com/bitforexapi/API_Docs/wiki)                                          |                                                                                                                             | China                                   |
|[![bithumb](https://user-images.githubusercontent.com/1294454/30597177-ea800172-9d5e-11e7-804c-b9d4fa9b56b0.jpg)](https://www.bithumb.com)                                                     | bithumb            | [Bithumb](https://www.bithumb.com)                                                      | *   | [API](https://apidocs.bithumb.com)                                                           |                                                                                                                             | South Korea                             |
|[![bitkk](https://user-images.githubusercontent.com/1294454/32859187-cd5214f0-ca5e-11e7-967d-96568e2e2bd1.jpg)](https://www.bitkk.com)                                                         | bitkk              | [bitkk](https://www.bitkk.com)                                                          | 1   | [API](https://www.bitkk.com/i/developer)                                                     |                                                                                                                             | China                                   |
|[![bitlish](https://user-images.githubusercontent.com/1294454/27766275-dcfc6c30-5ed3-11e7-839d-00a846385d0b.jpg)](https://bitlish.com)                                                         | bitlish            | [Bitlish](https://bitlish.com)                                                          | 1   | [API](https://bitlish.com/api)                                                               |                                                                                                                             | UK, EU, Russia                          |
|[![bitmex](https://user-images.githubusercontent.com/1294454/27766319-f653c6e6-5ed4-11e7-933d-f0bc3699ae8f.jpg)](https://www.bitmex.com/register/rm3C16)                                       | bitmex             | [BitMEX](https://www.bitmex.com/register/rm3C16)                                        | 1   | [API](https://www.bitmex.com/app/apiOverview)                                                |                                                                                                                             | Seychelles                              |
|[![bitso](https://user-images.githubusercontent.com/1294454/27766335-715ce7aa-5ed5-11e7-88a8-173a27bb30fe.jpg)](https://bitso.com/?ref=itej)                                                   | bitso              | [Bitso](https://bitso.com/?ref=itej)                                                    | 3   | [API](https://bitso.com/api_info)                                                            |                                                                                                                             | Mexico                                  |
|[![bitstamp](https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg)](https://www.bitstamp.net)                                                   | bitstamp           | [Bitstamp](https://www.bitstamp.net)                                                    | 2   | [API](https://www.bitstamp.net/api)                                                          |                                                                                                                             | UK                                      |
|[![bitstamp1](https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg)](https://www.bitstamp.net)                                                  | bitstamp1          | [Bitstamp](https://www.bitstamp.net)                                                    | 1   | [API](https://www.bitstamp.net/api)                                                          |                                                                                                                             | UK                                      |
|[![bittrex](https://user-images.githubusercontent.com/1294454/27766352-cf0b3c26-5ed5-11e7-82b7-f3826b7a97d8.jpg)](https://bittrex.com)                                                         | bittrex            | [Bittrex](https://bittrex.com)                                                          | 1.1 | [API](https://bittrex.github.io/api/)                                                        | [![CCXT Certified](https://img.shields.io/badge/CCXT-certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | US                                      |
|[![bitz](https://user-images.githubusercontent.com/1294454/35862606-4f554f14-0b5d-11e8-957d-35058c504b6f.jpg)](https://u.bit-z.com/register?invite_code=1429193)                               | bitz               | [Bit-Z](https://u.bit-z.com/register?invite_code=1429193)                               | 2   | [API](https://apidoc.bit-z.com/en/)                                                          |                                                                                                                             | Hong Kong                               |
|[![bl3p](https://user-images.githubusercontent.com/1294454/28501752-60c21b82-6feb-11e7-818b-055ee6d0e754.jpg)](https://bl3p.eu)                                                                | bl3p               | [BL3P](https://bl3p.eu)                                                                 | 1   | [API](https://github.com/BitonicNL/bl3p-api/tree/master/docs)                                |                                                                                                                             | Netherlands, EU                         |
|[![bleutrade](https://user-images.githubusercontent.com/1294454/30303000-b602dbe6-976d-11e7-956d-36c5049c01e7.jpg)](https://bleutrade.com)                                                     | bleutrade          | [Bleutrade](https://bleutrade.com)                                                      | 2   | [API](https://app.swaggerhub.com/apis-docs/bleu/white-label/3.0.0)                           |                                                                                                                             | Brazil                                  |
|[![braziliex](https://user-images.githubusercontent.com/1294454/34703593-c4498674-f504-11e7-8d14-ff8e44fb78c1.jpg)](https://braziliex.com/?ref=5FE61AB6F6D67DA885BC98BA27223465)               | braziliex          | [Braziliex](https://braziliex.com/?ref=5FE61AB6F6D67DA885BC98BA27223465)                | *   | [API](https://braziliex.com/exchange/api.php)                                                |                                                                                                                             | Brazil                                  |
|[![btcalpha](https://user-images.githubusercontent.com/1294454/42625213-dabaa5da-85cf-11e8-8f99-aa8f8f7699f0.jpg)](https://btc-alpha.com/?r=123788)                                            | btcalpha           | [BTC-Alpha](https://btc-alpha.com/?r=123788)                                            | 1   | [API](https://btc-alpha.github.io/api-docs)                                                  |                                                                                                                             | US                                      |
|[![btcbox](https://user-images.githubusercontent.com/1294454/31275803-4df755a8-aaa1-11e7-9abb-11ec2fad9f2d.jpg)](https://www.btcbox.co.jp/)                                                    | btcbox             | [BtcBox](https://www.btcbox.co.jp/)                                                     | 1   | [API](https://www.btcbox.co.jp/help/asm)                                                     |                                                                                                                             | Japan                                   |
|[![btcchina](https://user-images.githubusercontent.com/1294454/27766368-465b3286-5ed6-11e7-9a11-0f6467e1d82b.jpg)](https://www.btcchina.com)                                                   | btcchina           | [BTCChina](https://www.btcchina.com)                                                    | 1   | [API](https://www.btcchina.com/apidocs)                                                      |                                                                                                                             | China                                   |
|[![btcmarkets](https://user-images.githubusercontent.com/1294454/29142911-0e1acfc2-7d5c-11e7-98c4-07d9532b29d7.jpg)](https://btcmarkets.net)                                                   | btcmarkets         | [BTC Markets](https://btcmarkets.net)                                                   | *   | [API](https://github.com/BTCMarkets/API)                                                     |                                                                                                                             | Australia                               |
|[![btctradeim](https://user-images.githubusercontent.com/1294454/36770531-c2142444-1c5b-11e8-91e2-a4d90dc85fe8.jpg)](https://m.baobi.com/invite?inv=1765b2)                                    | btctradeim         | [BtcTrade.im](https://m.baobi.com/invite?inv=1765b2)                                    | *   | [API](https://www.btctrade.im/help.api.html)                                                 |                                                                                                                             | Hong Kong                               |
|[![btctradeua](https://user-images.githubusercontent.com/1294454/27941483-79fc7350-62d9-11e7-9f61-ac47f28fcd96.jpg)](https://btc-trade.com.ua/registration/22689)                              | btctradeua         | [BTC Trade UA](https://btc-trade.com.ua/registration/22689)                             | *   | [API](https://docs.google.com/document/d/1ocYA0yMy_RXd561sfG3qEPZ80kyll36HUxvCRe5GbhE/edit)  |                                                                                                                             | Ukraine                                 |
|[![btcturk](https://user-images.githubusercontent.com/1294454/27992709-18e15646-64a3-11e7-9fa2-b0950ec7712f.jpg)](https://www.btcturk.com)                                                     | btcturk            | [BTCTurk](https://www.btcturk.com)                                                      | *   | [API](https://github.com/BTCTrader/broker-api-docs)                                          |                                                                                                                             | Turkey                                  |
|[![buda](https://user-images.githubusercontent.com/1294454/47380619-8a029200-d706-11e8-91e0-8a391fe48de3.jpg)](https://www.buda.com)                                                           | buda               | [Buda](https://www.buda.com)                                                            | 2   | [API](https://api.buda.com)                                                                  |                                                                                                                             | Argentina, Chile, Colombia, Peru        |
|[![bxinth](https://user-images.githubusercontent.com/1294454/27766412-567b1eb4-5ed7-11e7-94a8-ff6a3884f6c5.jpg)](https://bx.in.th/ref/cYHknT/)                                                 | bxinth             | [BX.in.th](https://bx.in.th/ref/cYHknT/)                                                | *   | [API](https://bx.in.th/info/api)                                                             |                                                                                                                             | Thailand                                |
|[![cex](https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg)](https://cex.io/r/0/up105393824/0/)                                               | cex                | [CEX.IO](https://cex.io/r/0/up105393824/0/)                                             | *   | [API](https://cex.io/cex-api)                                                                |                                                                                                                             | UK, EU, Cyprus, Russia                  |
|[![chilebit](https://user-images.githubusercontent.com/1294454/27991414-1298f0d8-647f-11e7-9c40-d56409266336.jpg)](https://chilebit.net)                                                       | chilebit           | [ChileBit](https://chilebit.net)                                                        | 1   | [API](https://blinktrade.com/docs)                                                           |                                                                                                                             | Chile                                   |
|[![cobinhood](https://user-images.githubusercontent.com/1294454/35755576-dee02e5c-0878-11e8-989f-1595d80ba47f.jpg)](https://cobinhood.com?referrerId=a9d57842-99bb-4d7c-b668-0479a15a458b)     | cobinhood          | [COBINHOOD](https://cobinhood.com?referrerId=a9d57842-99bb-4d7c-b668-0479a15a458b)      | 1   | [API](https://cobinhood.github.io/api-public)                                                |                                                                                                                             | Taiwan                                  |
|[![coinbase](https://user-images.githubusercontent.com/1294454/40811661-b6eceae2-653a-11e8-829e-10bfadb078cf.jpg)](https://www.coinbase.com/join/58cbe25a355148797479dbd2)                     | coinbase           | [Coinbase](https://www.coinbase.com/join/58cbe25a355148797479dbd2)                      | 2   | [API](https://developers.coinbase.com/api/v2)                                                |                                                                                                                             | US                                      |
|[![coinbaseprime](https://user-images.githubusercontent.com/1294454/44539184-29f26e00-a70c-11e8-868f-e907fc236a7c.jpg)](https://prime.coinbase.com)                                            | coinbaseprime      | [Coinbase Prime](https://prime.coinbase.com)                                            | *   | [API](https://docs.prime.coinbase.com)                                                       |                                                                                                                             | US                                      |
|[![coinbasepro](https://user-images.githubusercontent.com/1294454/41764625-63b7ffde-760a-11e8-996d-a6328fa9347a.jpg)](https://pro.coinbase.com/)                                               | coinbasepro        | [Coinbase Pro](https://pro.coinbase.com/)                                               | *   | [API](https://docs.pro.coinbase.com/)                                                        |                                                                                                                             | US                                      |
|[![coincheck](https://user-images.githubusercontent.com/1294454/27766464-3b5c3c74-5ed9-11e7-840e-31b32968e1da.jpg)](https://coincheck.com)                                                     | coincheck          | [coincheck](https://coincheck.com)                                                      | *   | [API](https://coincheck.com/documents/exchange/api)                                          |                                                                                                                             | Japan, Indonesia                        |
|[![coinegg](https://user-images.githubusercontent.com/1294454/36770310-adfa764e-1c5a-11e8-8e09-449daac3d2fb.jpg)](https://www.coinegg.com/user/register?invite=523218)                         | coinegg            | [CoinEgg](https://www.coinegg.com/user/register?invite=523218)                          | *   | [API](https://www.coinegg.com/explain.api.html)                                              |                                                                                                                             | China, UK                               |
|[![coinex](https://user-images.githubusercontent.com/1294454/38046312-0b450aac-32c8-11e8-99ab-bc6b136b6cc7.jpg)](https://www.coinex.com/register?refer_code=yw5fz)                             | coinex             | [CoinEx](https://www.coinex.com/register?refer_code=yw5fz)                              | 1   | [API](https://github.com/coinexcom/coinex_exchange_api/wiki)                                 |                                                                                                                             | China                                   |
|[![coinexchange](https://user-images.githubusercontent.com/1294454/34842303-29c99fca-f71c-11e7-83c1-09d900cb2334.jpg)](https://www.coinexchange.io/?r=a1669e56)                                | coinexchange       | [CoinExchange](https://www.coinexchange.io/?r=a1669e56)                                 | *   | [API](https://coinexchangeio.github.io/slate/)                                               |                                                                                                                             | India, Japan, South Korea, Vietnam, US  |
|[![coinfalcon](https://user-images.githubusercontent.com/1294454/41822275-ed982188-77f5-11e8-92bb-496bcd14ca52.jpg)](https://coinfalcon.com/?ref=CFJSVGTUPASB)                                 | coinfalcon         | [CoinFalcon](https://coinfalcon.com/?ref=CFJSVGTUPASB)                                  | 1   | [API](https://docs.coinfalcon.com)                                                           |                                                                                                                             | UK                                      |
|[![coinfloor](https://user-images.githubusercontent.com/1294454/28246081-623fc164-6a1c-11e7-913f-bac0d5576c90.jpg)](https://www.coinfloor.co.uk)                                               | coinfloor          | [coinfloor](https://www.coinfloor.co.uk)                                                | *   | [API](https://github.com/coinfloor/api)                                                      |                                                                                                                             | UK                                      |
|[![coingi](https://user-images.githubusercontent.com/1294454/28619707-5c9232a8-7212-11e7-86d6-98fe5d15cc6e.jpg)](https://www.coingi.com/?r=XTPPMC)                                             | coingi             | [Coingi](https://www.coingi.com/?r=XTPPMC)                                              | *   | [API](https://coingi.docs.apiary.io)                                                         |                                                                                                                             | Panama, Bulgaria, China, US             |
|[![coinmarketcap](https://user-images.githubusercontent.com/1294454/28244244-9be6312a-69ed-11e7-99c1-7c1797275265.jpg)](https://coinmarketcap.com)                                             | coinmarketcap      | [CoinMarketCap](https://coinmarketcap.com)                                              | 1   | [API](https://coinmarketcap.com/api)                                                         |                                                                                                                             | US                                      |
|[![coinmate](https://user-images.githubusercontent.com/1294454/27811229-c1efb510-606c-11e7-9a36-84ba2ce412d8.jpg)](https://coinmate.io?referral=YTFkM1RsOWFObVpmY1ZjMGREQmpTRnBsWjJJNVp3PT0)   | coinmate           | [CoinMate](https://coinmate.io?referral=YTFkM1RsOWFObVpmY1ZjMGREQmpTRnBsWjJJNVp3PT0)    | *   | [API](https://coinmate.docs.apiary.io)                                                       |                                                                                                                             | UK, Czech Republic, EU                  |
|[![coinone](https://user-images.githubusercontent.com/1294454/38003300-adc12fba-323f-11e8-8525-725f53c4a659.jpg)](https://coinone.co.kr)                                                       | coinone            | [CoinOne](https://coinone.co.kr)                                                        | 2   | [API](https://doc.coinone.co.kr)                                                             |                                                                                                                             | South Korea                             |
|[![coinspot](https://user-images.githubusercontent.com/1294454/28208429-3cacdf9a-6896-11e7-854e-4c79a772a30f.jpg)](https://www.coinspot.com.au/register?code=PJURCU)                           | coinspot           | [CoinSpot](https://www.coinspot.com.au/register?code=PJURCU)                            | *   | [API](https://www.coinspot.com.au/api)                                                       |                                                                                                                             | Australia                               |
|[![cointiger](https://user-images.githubusercontent.com/1294454/39797261-d58df196-5363-11e8-9880-2ec78ec5bd25.jpg)](https://www.cointiger.one/#/register?refCode=FfvDtt)                       | cointiger          | [CoinTiger](https://www.cointiger.one/#/register?refCode=FfvDtt)                        | 1   | [API](https://github.com/cointiger/api-docs-en/wiki)                                         |                                                                                                                             | China                                   |
|[![coolcoin](https://user-images.githubusercontent.com/1294454/36770529-be7b1a04-1c5b-11e8-9600-d11f1996b539.jpg)](https://www.coolcoin.com/user/register?invite_code=bhaega)                  | coolcoin           | [CoolCoin](https://www.coolcoin.com/user/register?invite_code=bhaega)                   | *   | [API](https://www.coolcoin.com/help.api.html)                                                |                                                                                                                             | Hong Kong                               |
|[![coss](https://user-images.githubusercontent.com/1294454/50328158-22e53c00-0503-11e9-825c-c5cfd79bfa74.jpg)](https://www.coss.io/c/reg?r=OWCMHQVW2Q)                                         | coss               | [COSS](https://www.coss.io/c/reg?r=OWCMHQVW2Q)                                          | 1   | [API](https://api.coss.io/v1/spec)                                                           | [![CCXT Certified](https://img.shields.io/badge/CCXT-certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | Singapore, Netherlands                  |
|[![crex24](https://user-images.githubusercontent.com/1294454/47813922-6f12cc00-dd5d-11e8-97c6-70f957712d47.jpg)](https://crex24.com/?refid=slxsjsjtil8xexl9hksr)                               | crex24             | [CREX24](https://crex24.com/?refid=slxsjsjtil8xexl9hksr)                                | 2   | [API](https://docs.crex24.com/trade-api/v2)                                                  |                                                                                                                             | Estonia                                 |
|[![crypton](https://user-images.githubusercontent.com/1294454/41334251-905b5a78-6eed-11e8-91b9-f3aa435078a1.jpg)](https://cryptonbtc.com)                                                      | crypton            | [Crypton](https://cryptonbtc.com)                                                       | 1   | [API](https://cryptonbtc.docs.apiary.io/)                                                    |                                                                                                                             | EU                                      |
|[![deribit](https://user-images.githubusercontent.com/1294454/41933112-9e2dd65a-798b-11e8-8440-5bab2959fcb8.jpg)](https://www.deribit.com/reg-1189.4038)                                       | deribit            | [Deribit](https://www.deribit.com/reg-1189.4038)                                        | 1   | [API](https://docs.deribit.com)                                                              |                                                                                                                             | Netherlands                             |
|[![dsx](https://user-images.githubusercontent.com/1294454/27990275-1413158a-645a-11e7-931c-94717f7510e3.jpg)](https://dsx.uk)                                                                  | dsx                | [DSX](https://dsx.uk)                                                                   | 2   | [API](https://dsx.uk/developers/publicApiV2)                                                 |                                                                                                                             | UK                                      |
|[![dx](https://user-images.githubusercontent.com/1294454/57979980-6483ff80-7a2d-11e9-9224-2aa20665703b.jpg)](https://dx.exchange/registration?dx_cid=20&dx_scname=100001100000038139)          | dx                 | [DX.Exchange](https://dx.exchange/registration?dx_cid=20&dx_scname=100001100000038139)  | 1   | [API](https://apidocs.dx.exchange)                                                           |                                                                                                                             | UK, EU                                  |
|[![ethfinex](https://user-images.githubusercontent.com/1294454/37555526-7018a77c-29f9-11e8-8835-8e415c038a18.jpg)](https://www.ethfinex.com)                                                   | ethfinex           | [Ethfinex](https://www.ethfinex.com)                                                    | 1   | [API](https://bitfinex.readme.io/v1/docs)                                                    |                                                                                                                             | British Virgin Islands                  |
|[![exmo](https://user-images.githubusercontent.com/1294454/27766491-1b0ea956-5eda-11e7-9225-40d67b481b8d.jpg)](https://exmo.me/?ref=131685)                                                    | exmo               | [EXMO](https://exmo.me/?ref=131685)                                                     | 1   | [API](https://exmo.me/en/api_doc?ref=131685)                                                 |                                                                                                                             | Spain, Russia                           |
|[![exx](https://user-images.githubusercontent.com/1294454/37770292-fbf613d0-2de4-11e8-9f79-f2dc451b8ccb.jpg)](https://www.exx.com/r/fde4260159e53ab8a58cc9186d35501f?recommQd=1)               | exx                | [EXX](https://www.exx.com/r/fde4260159e53ab8a58cc9186d35501f?recommQd=1)                | *   | [API](https://www.exx.com/help/restApi)                                                      |                                                                                                                             | China                                   |
|[![fcoin](https://user-images.githubusercontent.com/1294454/42244210-c8c42e1e-7f1c-11e8-8710-a5fb63b165c4.jpg)](https://www.fcoin.com/i/Z5P7V)                                                 | fcoin              | [FCoin](https://www.fcoin.com/i/Z5P7V)                                                  | 2   | [API](https://developer.fcoin.com)                                                           |                                                                                                                             | China                                   |
|[![fcoinjp](https://user-images.githubusercontent.com/1294454/54219174-08b66b00-4500-11e9-862d-f522d0fe08c6.jpg)](https://www.fcoinjp.com)                                                     | fcoinjp            | [FCoinJP](https://www.fcoinjp.com)                                                      | 2   | [API](https://developer.fcoin.com)                                                           |                                                                                                                             | Japan                                   |
|[![flowbtc](https://user-images.githubusercontent.com/1294454/28162465-cd815d4c-67cf-11e7-8e57-438bea0523a2.jpg)](https://www.flowbtc.com.br)                                                  | flowbtc            | [flowBTC](https://www.flowbtc.com.br)                                                   | 1   | [API](https://www.flowbtc.com.br/api.html)                                                   |                                                                                                                             | Brazil                                  |
|[![foxbit](https://user-images.githubusercontent.com/1294454/27991413-11b40d42-647f-11e7-91ee-78ced874dd09.jpg)](https://foxbit.com.br/exchange)                                               | foxbit             | [FoxBit](https://foxbit.com.br/exchange)                                                | 1   | [API](https://foxbit.com.br/api/)                                                            |                                                                                                                             | Brazil                                  |
|[![fybse](https://user-images.githubusercontent.com/1294454/27766512-31019772-5edb-11e7-8241-2e675e6797f1.jpg)](https://www.fybse.se)                                                          | fybse              | [FYB-SE](https://www.fybse.se)                                                          | *   | [API](https://fyb.docs.apiary.io)                                                            |                                                                                                                             | Sweden                                  |
|[![gateio](https://user-images.githubusercontent.com/1294454/31784029-0313c702-b509-11e7-9ccc-bc0da6a0e435.jpg)](https://www.gate.io/signup/2436035)                                           | gateio             | [Gate.io](https://www.gate.io/signup/2436035)                                           | 2   | [API](https://gate.io/api2)                                                                  |                                                                                                                             | China                                   |
|[![gdax](https://user-images.githubusercontent.com/1294454/27766527-b1be41c6-5edb-11e7-95f6-5b496c469e2c.jpg)](https://www.gdax.com)                                                           | gdax               | [GDAX](https://www.gdax.com)                                                            | *   | [API](https://docs.gdax.com)                                                                 |                                                                                                                             | US                                      |
|[![gemini](https://user-images.githubusercontent.com/1294454/27816857-ce7be644-6096-11e7-82d6-3c257263229c.jpg)](https://gemini.com/)                                                          | gemini             | [Gemini](https://gemini.com/)                                                           | 1   | [API](https://docs.gemini.com/rest-api)                                                      |                                                                                                                             | US                                      |
|[![hadax](https://user-images.githubusercontent.com/1294454/38059952-4756c49e-32f1-11e8-90b9-45c1eccba9cd.jpg)](https://www.huobi.co/en-us/topic/invited/?invite_code=rwrd3)                   | hadax              | [HADAX](https://www.huobi.co/en-us/topic/invited/?invite_code=rwrd3)                    | 1   | [API](https://github.com/huobiapi/API_Docs/wiki)                                             |                                                                                                                             | China                                   |
|[![hitbtc](https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg)](https://hitbtc.com/?ref_id=5a5d39a65d466)                                     | hitbtc             | [HitBTC](https://hitbtc.com/?ref_id=5a5d39a65d466)                                      | 1   | [API](https://github.com/hitbtc-com/hitbtc-api/blob/master/APIv1.md)                         |                                                                                                                             | Hong Kong                               |
|[![hitbtc2](https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg)](https://hitbtc.com/?ref_id=5a5d39a65d466)                                    | hitbtc2            | [HitBTC](https://hitbtc.com/?ref_id=5a5d39a65d466)                                      | 2   | [API](https://api.hitbtc.com)                                                                |                                                                                                                             | Hong Kong                               |
|[![huobipro](https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg)](https://www.huobi.co/en-us/topic/invited/?invite_code=rwrd3)                | huobipro           | [Huobi Pro](https://www.huobi.co/en-us/topic/invited/?invite_code=rwrd3)                | 1   | [API](https://huobiapi.github.io/docs/spot/v1/cn/)                                           |                                                                                                                             | China                                   |
|[![huobiru](https://user-images.githubusercontent.com/1294454/52978816-e8552e00-33e3-11e9-98ed-845acfece834.jpg)](https://www.huobi.com.ru/invite?invite_code=esc74)                           | huobiru            | [Huobi Russia](https://www.huobi.com.ru/invite?invite_code=esc74)                       | 1   | [API](https://github.com/cloudapidoc/API_Docs_en)                                            |                                                                                                                             | Russia                                  |
|[![ice3x](https://user-images.githubusercontent.com/1294454/38012176-11616c32-3269-11e8-9f05-e65cf885bb15.jpg)](https://ice3x.com?ref=14341802)                                                | ice3x              | [ICE3X](https://ice3x.com?ref=14341802)                                                 | 1   | [API](https://ice3x.co.za/ice-cubed-bitcoin-exchange-api-documentation-1-june-2017)          |                                                                                                                             | South Africa                            |
|[![independentreserve](https://user-images.githubusercontent.com/1294454/30521662-cf3f477c-9bcb-11e7-89bc-d1ac85012eda.jpg)](https://www.independentreserve.com)                               | independentreserve | [Independent Reserve](https://www.independentreserve.com)                               | *   | [API](https://www.independentreserve.com/API)                                                |                                                                                                                             | Australia, New Zealand                  |
|[![indodax](https://user-images.githubusercontent.com/1294454/37443283-2fddd0e4-281c-11e8-9741-b4f1419001b5.jpg)](https://indodax.com/ref/testbitcoincoid/1)                                   | indodax            | [INDODAX](https://indodax.com/ref/testbitcoincoid/1)                                    | 1.8 | [API](https://indodax.com/downloads/BITCOINCOID-API-DOCUMENTATION.pdf)                       |                                                                                                                             | Indonesia                               |
|[![itbit](https://user-images.githubusercontent.com/1294454/27822159-66153620-60ad-11e7-89e7-005f6d7f3de0.jpg)](https://www.itbit.com)                                                         | itbit              | [itBit](https://www.itbit.com)                                                          | 1   | [API](https://api.itbit.com/docs)                                                            |                                                                                                                             | US                                      |
|[![kkex](https://user-images.githubusercontent.com/1294454/47401462-2e59f800-d74a-11e8-814f-e4ae17b4968a.jpg)](https://kkex.com)                                                               | kkex               | [KKEX](https://kkex.com)                                                                | 2   | [API](https://kkex.com/api_wiki/cn/)                                                         |                                                                                                                             | China, US, Japan                        |
|[![kraken](https://user-images.githubusercontent.com/1294454/27766599-22709304-5ede-11e7-9de1-9f33732e1509.jpg)](https://www.kraken.com)                                                       | kraken             | [Kraken](https://www.kraken.com)                                                        | 0   | [API](https://www.kraken.com/en-us/help/api)                                                 | [![CCXT Certified](https://img.shields.io/badge/CCXT-certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | US                                      |
|[![kucoin](https://user-images.githubusercontent.com/1294454/57369448-3cc3aa80-7196-11e9-883e-5ebeb35e4f57.jpg)](https://www.kucoin.com/?rcode=E5wkqe)                                         | kucoin             | [KuCoin](https://www.kucoin.com/?rcode=E5wkqe)                                          | 2   | [API](https://docs.kucoin.com)                                                               | [![CCXT Certified](https://img.shields.io/badge/CCXT-certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | Seychelles                              |
|[![kuna](https://user-images.githubusercontent.com/1294454/31697638-912824fa-b3c1-11e7-8c36-cf9606eb94ac.jpg)](https://kuna.io?r=kunaid-gvfihe8az7o4)                                          | kuna               | [Kuna](https://kuna.io?r=kunaid-gvfihe8az7o4)                                           | 2   | [API](https://kuna.io/documents/api)                                                         |                                                                                                                             | Ukraine                                 |
|[![lakebtc](https://user-images.githubusercontent.com/1294454/28074120-72b7c38a-6660-11e7-92d9-d9027502281d.jpg)](https://www.lakebtc.com)                                                     | lakebtc            | [LakeBTC](https://www.lakebtc.com)                                                      | 2   | [API](https://www.lakebtc.com/s/api_v2)                                                      |                                                                                                                             | US                                      |
|[![lbank](https://user-images.githubusercontent.com/1294454/38063602-9605e28a-3302-11e8-81be-64b1e53c4cfb.jpg)](https://www.lbex.io/invite?icode=7QCY)                                         | lbank              | [LBank](https://www.lbex.io/invite?icode=7QCY)                                          | 1   | [API](https://github.com/LBank-exchange/lbank-official-api-docs)                             |                                                                                                                             | China                                   |
|[![liqui](https://user-images.githubusercontent.com/1294454/27982022-75aea828-63a0-11e7-9511-ca584a8edd74.jpg)](https://liqui.io)                                                              | liqui              | [Liqui](https://liqui.io)                                                               | 3   | [API](https://liqui.io/api)                                                                  |                                                                                                                             | Ukraine                                 |
|[![liquid](https://user-images.githubusercontent.com/1294454/45798859-1a872600-bcb4-11e8-8746-69291ce87b04.jpg)](https://www.liquid.com?affiliate=SbzC62lt30976)                               | liquid             | [Liquid](https://www.liquid.com?affiliate=SbzC62lt30976)                                | 2   | [API](https://developers.liquid.com)                                                         |                                                                                                                             | Japan, China, Taiwan                    |
|[![livecoin](https://user-images.githubusercontent.com/1294454/27980768-f22fc424-638a-11e7-89c9-6010a54ff9be.jpg)](https://livecoin.net/?from=Livecoin-CQ1hfx44)                               | livecoin           | [LiveCoin](https://livecoin.net/?from=Livecoin-CQ1hfx44)                                | *   | [API](https://www.livecoin.net/api?lang=en)                                                  |                                                                                                                             | US, UK, Russia                          |
|[![luno](https://user-images.githubusercontent.com/1294454/27766607-8c1a69d8-5ede-11e7-930c-540b5eb9be24.jpg)](https://www.luno.com/invite/44893A)                                             | luno               | [luno](https://www.luno.com/invite/44893A)                                              | 1   | [API](https://www.luno.com/en/api)                                                           |                                                                                                                             | UK, Singapore, South Africa             |
|[![lykke](https://user-images.githubusercontent.com/1294454/34487620-3139a7b0-efe6-11e7-90f5-e520cef74451.jpg)](https://www.lykke.com)                                                         | lykke              | [Lykke](https://www.lykke.com)                                                          | 1   | [API](https://hft-api.lykke.com/swagger/ui/)                                                 |                                                                                                                             | Switzerland                             |
|[![mandala](https://user-images.githubusercontent.com/1294454/54686665-df629400-4b2a-11e9-84d3-d88856367dd7.jpg)](https://trade.mandalaex.com/?ref=564377)                                     | mandala            | [Mandala](https://trade.mandalaex.com/?ref=564377)                                      | 1.1 | [API](https://apidocs.mandalaex.com)                                                         |                                                                                                                             | Malta                                   |
|[![mercado](https://user-images.githubusercontent.com/1294454/27837060-e7c58714-60ea-11e7-9192-f05e86adb83f.jpg)](https://www.mercadobitcoin.com.br)                                           | mercado            | [Mercado Bitcoin](https://www.mercadobitcoin.com.br)                                    | 3   | [API](https://www.mercadobitcoin.com.br/api-doc)                                             |                                                                                                                             | Brazil                                  |
|[![mixcoins](https://user-images.githubusercontent.com/1294454/30237212-ed29303c-9535-11e7-8af8-fcd381cfa20c.jpg)](https://mixcoins.com)                                                       | mixcoins           | [MixCoins](https://mixcoins.com)                                                        | 1   | [API](https://mixcoins.com/help/api/)                                                        |                                                                                                                             | UK, Hong Kong                           |
|[![negociecoins](https://user-images.githubusercontent.com/1294454/38008571-25a6246e-3258-11e8-969b-aeb691049245.jpg)](https://www.negociecoins.com.br)                                        | negociecoins       | [NegocieCoins](https://www.negociecoins.com.br)                                         | 3   | [API](https://www.negociecoins.com.br/documentacao-tradeapi)                                 |                                                                                                                             | Brazil                                  |
|[![nova](https://user-images.githubusercontent.com/1294454/30518571-78ca0bca-9b8a-11e7-8840-64b83a4a94b2.jpg)](https://novaexchange.com/signup/?re=is8vz2hsl3qxewv1uawd)                       | nova               | [Novaexchange](https://novaexchange.com/signup/?re=is8vz2hsl3qxewv1uawd)                | 2   | [API](https://novaexchange.com/remote/faq)                                                   |                                                                                                                             | Tanzania                                |
|[![oceanex](https://user-images.githubusercontent.com/1294454/58385970-794e2d80-8001-11e9-889c-0567cd79b78e.jpg)](https://oceanex.pro/signup?referral=VE24QX)                                  | oceanex            | [OceanEx](https://oceanex.pro/signup?referral=VE24QX)                                   | 1   | [API](https://api.oceanex.pro/doc/v1)                                                        |                                                                                                                             | US                                      |
|[![okcoincny](https://user-images.githubusercontent.com/1294454/27766792-8be9157a-5ee5-11e7-926c-6d69b8d3378d.jpg)](https://www.okcoin.cn)                                                     | okcoincny          | [OKCoin CNY](https://www.okcoin.cn)                                                     | 1   | [API](https://www.okcoin.cn/rest_getStarted.html)                                            |                                                                                                                             | China                                   |
|[![okcoinusd](https://user-images.githubusercontent.com/1294454/27766791-89ffb502-5ee5-11e7-8a5b-c5950b68ac65.jpg)](https://www.okcoin.com/account/register?flag=activity&channelId=600001513) | okcoinusd          | [OKCoin USD](https://www.okcoin.com/account/register?flag=activity&channelId=600001513) | 1   | [API](https://www.okcoin.com/docs/en/)                                                       |                                                                                                                             | China, US                               |
|[![okex](https://user-images.githubusercontent.com/1294454/32552768-0d6dd3c6-c4a6-11e7-90f8-c043b64756a7.jpg)](https://www.okex.com)                                                           | okex               | [OKEX](https://www.okex.com)                                                            | 1   | [API](https://github.com/okcoin-okex/API-docs-OKEx.com)                                      |                                                                                                                             | China, US                               |
|[![okex3](https://user-images.githubusercontent.com/1294454/32552768-0d6dd3c6-c4a6-11e7-90f8-c043b64756a7.jpg)](https://www.okex.com)                                                          | okex3              | [OKEX](https://www.okex.com)                                                            | 3   | [API](https://www.okex.com/docs/en/)                                                         |                                                                                                                             | China, US                               |
|[![paymium](https://user-images.githubusercontent.com/1294454/27790564-a945a9d4-5ff9-11e7-9d2d-b635763f2f24.jpg)](https://www.paymium.com)                                                     | paymium            | [Paymium](https://www.paymium.com)                                                      | 1   | [API](https://github.com/Paymium/api-documentation)                                          |                                                                                                                             | France, EU                              |
|[![poloniex](https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg)](https://www.poloniex.com/?utm_source=ccxt&utm_medium=web)                   | poloniex           | [Poloniex](https://www.poloniex.com/?utm_source=ccxt&utm_medium=web)                    | *   | [API](https://docs.poloniex.com)                                                             | [![CCXT Certified](https://img.shields.io/badge/CCXT-certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | US                                      |
|[![rightbtc](https://user-images.githubusercontent.com/1294454/42633917-7d20757e-85ea-11e8-9f53-fffe9fbb7695.jpg)](https://www.rightbtc.com)                                                   | rightbtc           | [RightBTC](https://www.rightbtc.com)                                                    | *   | [API](https://52.53.159.206/api/trader/)                                                     |                                                                                                                             | United Arab Emirates                    |
|[![southxchange](https://user-images.githubusercontent.com/1294454/27838912-4f94ec8a-60f6-11e7-9e5d-bbf9bd50a559.jpg)](https://www.southxchange.com)                                           | southxchange       | [SouthXchange](https://www.southxchange.com)                                            | *   | [API](https://www.southxchange.com/Home/Api)                                                 |                                                                                                                             | Argentina                               |
|[![stronghold](https://user-images.githubusercontent.com/1294454/52160042-98c1f300-26be-11e9-90dd-da8473944c83.jpg)](https://stronghold.co)                                                    | stronghold         | [Stronghold](https://stronghold.co)                                                     | 1   | [API](https://docs.stronghold.co)                                                            |                                                                                                                             |                                         |
|[![surbitcoin](https://user-images.githubusercontent.com/1294454/27991511-f0a50194-6481-11e7-99b5-8f02932424cc.jpg)](https://surbitcoin.com)                                                   | surbitcoin         | [SurBitcoin](https://surbitcoin.com)                                                    | 1   | [API](https://blinktrade.com/docs)                                                           |                                                                                                                             | Venezuela                               |
|[![theocean](https://user-images.githubusercontent.com/1294454/43103756-d56613ce-8ed7-11e8-924e-68f9d4bcacab.jpg)](https://theocean.trade)                                                     | theocean           | [The Ocean](https://theocean.trade)                                                     | 1   | [API](https://docs.theocean.trade)                                                           | [![CCXT Certified](https://img.shields.io/badge/CCXT-certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | US                                      |
|[![therock](https://user-images.githubusercontent.com/1294454/27766869-75057fa2-5ee9-11e7-9a6f-13e641fa4707.jpg)](https://therocktrading.com)                                                  | therock            | [TheRockTrading](https://therocktrading.com)                                            | 1   | [API](https://api.therocktrading.com/doc/v1/index.html)                                      |                                                                                                                             | Malta                                   |
|[![tidebit](https://user-images.githubusercontent.com/1294454/39034921-e3acf016-4480-11e8-9945-a6086a1082fe.jpg)](http://bit.ly/2IX0LrM)                                                       | tidebit            | [TideBit](http://bit.ly/2IX0LrM)                                                        | 2   | [API](https://www.tidebit.com/documents/api/guide)                                           |                                                                                                                             | Hong Kong                               |
|[![tidex](https://user-images.githubusercontent.com/1294454/30781780-03149dc4-a12e-11e7-82bb-313b269d24d4.jpg)](https://tidex.com)                                                             | tidex              | [Tidex](https://tidex.com)                                                              | 3   | [API](https://tidex.com/exchange/public-api)                                                 |                                                                                                                             | UK                                      |
|[![upbit](https://user-images.githubusercontent.com/1294454/49245610-eeaabe00-f423-11e8-9cba-4b0aed794799.jpg)](https://upbit.com)                                                             | upbit              | [Upbit](https://upbit.com)                                                              | 1   | [API](https://docs.upbit.com/docs/%EC%9A%94%EC%B2%AD-%EC%88%98-%EC%A0%9C%ED%95%9C)           | [![CCXT Certified](https://img.shields.io/badge/CCXT-certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | South Korea                             |
|[![vaultoro](https://user-images.githubusercontent.com/1294454/27766880-f205e870-5ee9-11e7-8fe2-0d5b15880752.jpg)](https://www.vaultoro.com)                                                   | vaultoro           | [Vaultoro](https://www.vaultoro.com)                                                    | 1   | [API](https://api.vaultoro.com)                                                              |                                                                                                                             | Switzerland                             |
|[![vbtc](https://user-images.githubusercontent.com/1294454/27991481-1f53d1d8-6481-11e7-884e-21d17e7939db.jpg)](https://vbtc.exchange)                                                          | vbtc               | [VBTC](https://vbtc.exchange)                                                           | 1   | [API](https://blinktrade.com/docs)                                                           |                                                                                                                             | Vietnam                                 |
|[![virwox](https://user-images.githubusercontent.com/1294454/27766894-6da9d360-5eea-11e7-90aa-41f2711b7405.jpg)](https://www.virwox.com)                                                       | virwox             | [VirWoX](https://www.virwox.com)                                                        | *   | [API](https://www.virwox.com/developers.php)                                                 |                                                                                                                             | Austria, EU                             |
|[![xbtce](https://user-images.githubusercontent.com/1294454/28059414-e235970c-662c-11e7-8c3a-08e31f78684b.jpg)](https://xbtce.com/?agent=XX97BTCXXXG687021000B)                                | xbtce              | [xBTCe](https://xbtce.com/?agent=XX97BTCXXXG687021000B)                                 | 1   | [API](https://www.xbtce.com/tradeapi)                                                        |                                                                                                                             | Russia                                  |
|[![yobit](https://user-images.githubusercontent.com/1294454/27766910-cdcbfdae-5eea-11e7-9859-03fea873272d.jpg)](https://www.yobit.net)                                                         | yobit              | [YoBit](https://www.yobit.net)                                                          | 3   | [API](https://www.yobit.net/en/api/)                                                         |                                                                                                                             | Russia                                  |
|[![zaif](https://user-images.githubusercontent.com/1294454/27766927-39ca2ada-5eeb-11e7-972f-1b4199518ca6.jpg)](https://zaif.jp)                                                                | zaif               | [Zaif](https://zaif.jp)                                                                 | 1   | [API](https://techbureau-api-document.readthedocs.io/ja/latest/index.html)                   |                                                                                                                             | Japan                                   |
|[![zb](https://user-images.githubusercontent.com/1294454/32859187-cd5214f0-ca5e-11e7-967d-96568e2e2bd1.jpg)](https://www.zb.com)                                                               | zb                 | [ZB](https://www.zb.com)                                                                | 1   | [API](https://www.zb.com/i/developer)                                                        |                                                                                                                             | China                                   |

Besides making basic market and limit orders, some exchanges offer margin trading (leverage), various derivatives (like futures contracts and options) and also have [dark pools](https://en.wikipedia.org/wiki/Dark_pool), [OTC](https://en.wikipedia.org/wiki/Over-the-counter_(finance)) (over-the-counter trading), merchant APIs and much more.

## Instantiation

To connect to an exchange and start trading you need to instantiate an exchange class from ccxt library.

To get the full list of ids of supported exchanges programmatically:

```JavaScript
// JavaScript
const ccxt = require ('ccxt')
console.log (ccxt.exchanges)
```

```Python
# Python
import ccxt
print (ccxt.exchanges)
```

```PHP
// PHP
include 'ccxt.php';
var_dump (\ccxt\Exchange::$exchanges);
```

An exchange can be instantiated like shown in the examples below:

```JavaScript
// JavaScript
const ccxt = require ('ccxt')
let exchange = new ccxt.kraken () // default id
let kraken1 = new ccxt.kraken ({ id: 'kraken1' })
let kraken2 = new ccxt.kraken ({ id: 'kraken2' })
let id = 'gdax'
let gdax = new ccxt[id] ();

// from variable id
const exchangeId = 'binance'
    , exchangeClass = ccxt[exchangeId]
    , exchange = new exchangeClass ({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        'timeout': 30000,
        'enableRateLimit': true,
    })
```

```Python
# Python
import ccxt
exchange = ccxt.okcoinusd () # default id
okcoin1 = ccxt.okcoinusd ({ 'id': 'okcoin1' })
okcoin2 = ccxt.okcoinusd ({ 'id': 'okcoin2' })
id = 'btcchina'
btcchina = eval ('ccxt.%s ()' % id)
gdax = getattr (ccxt, 'gdax') ()

# from variable id
exchange_id = 'binance'
exchange_class = getattr(ccxt, exchange_id)
exchange = exchange_class({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
    'timeout': 30000,
    'enableRateLimit': True,
})
```

The ccxt library in PHP uses builtin UTC/GMT time functions, therefore you are required to set date.timezone in your php.ini or call [date_default_timezone_set ()](http://php.net/manual/en/function.date-default-timezone-set.php) function before using the PHP version of the library. The recommended timezone setting is `"UTC"`.

```PHP
// PHP
date_default_timezone_set ('UTC');
include 'ccxt.php';
$bitfinex = new \ccxt\bitfinex (); // default id
$bitfinex1 = new \ccxt\bitfinex (array ('id' => 'bitfinex1'));
$bitfinex2 = new \ccxt\bitfinex (array ('id' => 'bitfinex2'));
$id = 'kraken';
$exchange = '\\ccxt\\' . $id
$kraken = new $exchange ();

// from variable id
$exchange_id = 'binance';
$exchange_class = "\\ccxt\\$exchange_id";
$exchange = new $exchange_class (array (
    'apiKey' => 'YOUR_API_KEY',
    'secret' => 'YOUR_SECRET',
    'timeout' => 30000,
    'enableRateLimit' => true,
));
```

### Overriding Exchange Properties Upon Instantiation

Most of exchange properties as well as specific options can be overrided upon exchange class instantiation or afterwards, like shown below:

```JavaScript
// JavaScript
const exchange = new ccxt.binance ({
    'rateLimit': 10000, // unified exchange property
    'options': {
        'adjustForTimeDifference': true, // exchange-specific option
    }
})
exchange.options['adjustForTimeDifference'] = false
```

```Python
# Python
exchange = ccxt.binance ({
    'rateLimit': 10000,  # unified exchange property
    'options': {
        'adjustForTimeDifference': True,  # exchange-specific option
    }
})
exchange.options['adjustForTimeDifference'] = False
```

```PHP
// PHP
$exchange_id = 'binance';
$exchange_class = "\\ccxt\\$exchange_id";
$exchange = new $exchange_class (array (
    'rateLimit' => 10000, // unified exchange property
    'options' => array (
        'adjustForTimeDifference' => true, // exchange-specific option
    ),
));
$exchange->options['adjustForTimeDifference'] = false;
```

## Exchange Structure

Every exchange has a set of properties and methods, most of which you can override by passing an associative array of params to an exchange constructor. You can also make a subclass and override everything.

Here's an overview of base exchange properties with values added for example:

```JavaScript
{
    'id':   'exchange'                  // lowercase string exchange id
    'name': 'Exchange'                  // human-readable string
    'countries': [ 'US', 'CN', 'EU' ],  // array of ISO country codes
    'urls': {
        'api': 'https://api.example.com/data',  // string or dictionary of base API URLs
        'www': 'https://www.example.com'        // string website URL
        'doc': 'https://docs.example.com/api',  // string URL or array of URLs
    },
    'version':         'v1',            // string ending with digits
    'api':             { ... },         // dictionary of api endpoints
    'has': {                            // exchange capabilities
        'CORS': false,
        'publicAPI': true,
        'privateAPI': true,
        'cancelOrder': true,
        'createDepositAddress': false,
        'createOrder': true,
        'deposit': false,
        'fetchBalance': true,
        'fetchClosedOrders': false,
        'fetchCurrencies': false,
        'fetchDepositAddress': false,
        'fetchMarkets': true,
        'fetchMyTrades': false,
        'fetchOHLCV': false,
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
    'timeframes': {                     // empty if the exchange !has.fetchOHLCV
        '1m': '1minute',
        '1h': '1hour',
        '1d': '1day',
        '1M': '1month',
        '1y': '1year',
    },
    'timeout':          10000,          // number in milliseconds
    'rateLimit':        2000,           // number in milliseconds
    'userAgent':       'ccxt/1.1.1 ...' // string, HTTP User-Agent header
    'verbose':          false,          // boolean, output error details
    'markets':         { ... }          // dictionary of markets/pairs by symbol
    'symbols':         [ ... ]          // sorted list of string symbols (traded pairs)
    'currencies':      { ... }          // dictionary of currencies by currency code
    'markets_by_id':   { ... },         // dictionary of dictionaries (markets) by id
    'proxy': 'https://crossorigin.me/', // string URL
    'apiKey':   '92560ffae9b8a0421...', // string public apiKey (ASCII, hex, Base64, ...)
    'secret':   '9aHjPmW+EtRRKN/Oi...'  // string private secret key
    'password': '6kszf4aci8r',          // string password
    'uid':      '123456',               // string user id
}
```

### Exchange Properties

Below is a detailed description of each of the base exchange properties:

- `id`: Each exchange has a default id. The id is not used for anything, it's a string literal for user-land exchange instance identification purposes. You can have multiple links to the same exchange and differentiate them by ids. Default ids are all lowercase and correspond to exchange names.

- `name`: This is a string literal containing the human-readable exchange name.

- `countries`: An array of string literals of 2-symbol ISO country codes, where the exchange is operating from.

- `urls['api']`: The single string literal base URL for API calls or an associative array of separate URLs for private and public APIs.

- `urls['www']`: The main HTTP website URL.

- `urls['doc']`: A single string URL link to original documentation for exchange API on their website or an array of links to docs.

- `version`: A string literal containing version identifier for current exchange API. The ccxt library will append this version string to the API Base URL upon each request. You don't have to modify it, unless you are implementing a new exchange API. The version identifier is a usually a numeric string starting with a letter 'v' in some cases, like v1.1. Do not override it unless you are implementing your own new crypto exchange class.

- `api`: An associative array containing a definition of all API endpoints exposed by a crypto exchange. The API definition is used by ccxt to automatically construct callable instance methods for each available endpoint.

- `has`: This is an associative array of exchange capabilities (e.g `fetchTickers`, `fetchOHLCV` or `CORS`).

- `timeframes`: An associative array of timeframes, supported by the fetchOHLCV method of the exchange. This is only populated when `has['fetchOHLCV']` property is true.

- `timeout`: A timeout in milliseconds for a request-response roundtrip (default timeout is 10000 ms = 10 seconds). You should always set it to a reasonable value, hanging forever with no timeout is not your option, for sure.

- `rateLimit`: A request rate limit in milliseconds. Specifies the required minimal delay between two consequent HTTP requests to the same exchange. The built-in rate-limiter is disabled by default and is turned on by setting the `enableRateLimit` property to true.

- `enableRateLimit`: A boolean (true/false) value that enables the built-in rate limiter and throttles consecutive requests. This setting is false (disabled) by default. **The user is required to implement own [rate limiting](https://github.com/ccxt/ccxt/wiki/Manual#rate-limit) or enable the built-in rate limiter to avoid being banned from the exchange**.

- `userAgent`: An object to set HTTP User-Agent header to. The ccxt library will set its User-Agent by default. Some exchanges may not like it. If you are having difficulties getting a reply from an exchange and want to turn User-Agent off or use the default one, set this value to false, undefined, or an empty string.

- `verbose`: A boolean flag indicating whether to log HTTP requests to stdout (verbose flag is false by default). Python people have an alternative way of DEBUG logging with a standard pythonic logger, which is enabled by adding these two lines to the beginning of their code:
  ```Python
  import logging
  logging.basicConfig(level=logging.DEBUG)
  ```

- `markets`: An associative array of markets indexed by common trading pairs or symbols. Markets should be loaded prior to accessing this property. Markets are unavailable until you call the `loadMarkets() / load_markets()` method on exchange instance.

- `symbols`: A non-associative array (a list) of symbols available with an exchange, sorted in alphabetical order. These are the keys of the `markets` property. Symbols are loaded and reloaded from markets. This property is a convenient shorthand for all market keys.

- `currencies`: An associative array (a dict) of currencies by codes (usually 3 or 4 letters) available with an exchange. Currencies are loaded and reloaded from markets.

- `markets_by_id`: An associative array of markets indexed by exchange-specific ids. Markets should be loaded prior to accessing this property.

- `proxy`: A string literal containing base URL of http(s) proxy, `''` by default. For use with web browsers and from blocked locations. An example of a proxy string is `'http://crossorigin.me/'`. The absolute exchange endpoint URL is appended to this string before sending the HTTP request.

- `apiKey`: This is your public API key string literal. Most exchanges require [API keys setup](https://github.com/ccxt/ccxt/wiki/Manual#api-keys-setup).

- `secret`: Your private secret API key string literal. Most exchanges require this as well together with the apiKey.

- `password`: A string literal with your password/phrase. Some exchanges require this parameter for trading, but most of them don't.

- `uid`: A unique id of your account. This can be a string literal or a number. Some exchanges also require this for trading, but most of them don't.

- `requiredCredentials`: A unified associative dictionary that shows which of the above API credentials are required for sending private API calls to the underlying exchange (an exchange may require a specific set of keys).

- `options`: An exchange-specific associative dictionary containing special keys and options that are accepted by the underlying exchange and supported in CCXT.

- `precisionMode`: The exchange decimal precision counting mode, read more about [Precision And Limits](#precision-and-limits)

See this section on [Overriding exchange properties](https://github.com/ccxt/ccxt/wiki/Manual#overriding-exchange-properties-upon-instantiation).

#### Exchange Metadata

- `has`: An assoc-array containing flags for exchange capabilities, including the following:

    ```JavaScript
    'has': {

        'CORS': false,  // has Cross-Origin Resource Sharing enabled (works from browser) or not

        'publicAPI': true,  // has public API available and implemented, true/false
        'privateAPI': true, // has private API available and implemented, true/false

        // unified methods availability flags (can be true, false, or 'emulated'):

        'cancelOrder': true,
        'createDepositAddress': false,
        'createOrder': true,
        'deposit': false,
        'fetchBalance': true,
        'fetchClosedOrders': false,
        'fetchCurrencies': false,
        'fetchDepositAddress': false,
        'fetchMarkets': true,
        'fetchMyTrades': false,
        'fetchOHLCV': false,
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

    The meaning of each flag showing availability of this or that method is:

    - boolean `true` means the method is natively available from the exchange API and unified in the ccxt library
    - boolean `false` means the method isn't natively available from the exchange API or not unified in the ccxt library yet
    - an `'emulated'` string means the endpoint isn't natively available from the exchange API but reconstructed by the ccxt library from available true-methods

## Rate Limit

Exchanges usually impose what is called a *rate limit*. Exchanges will remember and track your user credentials and your IP address and will not allow you to query the API too frequently. They balance their load and control traffic congestion to protect API servers from (D)DoS and misuse.

**WARNING: Stay under the rate limit to avoid ban!**

Most exchanges allow **up to 1 or 2 requests per second**. Exchanges may temporarily restrict your access to their API or ban you for some period of time if you are too aggressive with your requests.

**The `exchange.rateLimit` property is set to a safe default which is sub-optimal. Some exchanges may have varying rate limits for different endpoints. It is up to the user to tweak `rateLimit` according to application-specific purposes.**

The CCXT library has a built-in experimental rate-limiter that will do the necessary throttling in background transparently to the user. **WARNING: users are responsible for at least some type of rate-limiting: either by implementing a custom algorithm or by doing it with the built-in rate-limiter.**.

Turn on the built-in rate-limiter with `.enableRateLimit` property, like so:

```JavaScript
// JavaScript

// enable built-in rate limiting upon instantiation of the exchange
const exchange = new ccxt.bitfinex ({
    'enableRateLimit': true,
})

// or switch the built-in rate-limiter on or off later after instantiation
exchange.enableRateLimit = true // enable
exchange.enableRateLimit = false // disable
```

```Python
# Python

# enable built-in rate limiting upon instantiation of the exchange
exchange = ccxt.bitfinex({
    'enableRateLimit': True,
})

# or switch the built-in rate-limiter on or off later after instantiation
exchange.enableRateLimit = True  # enable
exchange.enableRateLimit = False  # disable
```

```PHP
// PHP

// enable built-in rate limiting upon instantiation of the exchange
$exchange = new \ccxt\bitfinex (array (
    'enableRateLimit' => true,
));

// or switch the built-in rate-limiter on or off later after instantiation
$exchange->enableRateLimit = true; // enable
$exchange->enableRateLimit = false; // disable
```

In case your calls hit a rate limit or get nonce errors, the ccxt library will throw an `InvalidNonce` exception, or, in some cases, one of the following types:

- `DDoSProtectionError`
- `ExchangeNotAvailable`
- `ExchangeError`
– `InvalidNonce`

A later retry is usually enough to handle that. More on that here:

- [Authentication](https://github.com/ccxt/ccxt/wiki/Manual#authentication)
- [Troubleshooting](https://github.com/ccxt/ccxt/wiki/Manual#troubleshooting)
- [Overriding The Nonce](https://github.com/ccxt/ccxt/wiki/Manual#overriding-the-nonce)

### DDoS Protection By Cloudflare / Incapsula

Some exchanges are [DDoS](https://en.wikipedia.org/wiki/Denial-of-service_attack)-protected by [Cloudflare](https://www.cloudflare.com) or [Incapsula](https://www.incapsula.com). Your IP can get temporarily blocked during periods of high load. Sometimes they even restrict whole countries and regions. In that case their servers usually return a page that states a HTTP 40x error or runs an AJAX test of your browser / captcha test and delays the reload of the page for several seconds. Then your browser/fingerprint is granted access temporarily and gets added to a whitelist or receives a HTTP cookie for further use.

The most common symptoms for a DDoS protection problem, rate-limiting problem or for a location-based filtering issue:
- Getting `RequestTimeout` exceptions with all types of exchange methods
- Catching `ExchangeError` or `ExchangeNotAvailable` with HTTP error codes 400, 403, 404, 429, 500, 501, 503, etc..
- Having DNS resolving issues, SSL certificate issues and low-level connectivity issues
- Getting a template HTML page instead of JSON from the exchange

If you encounter DDoS protection errors and cannot reach a particular exchange then:

- try using a cloudscraper:
  - https://github.com/ccxt/ccxt/blob/master/examples/js/bypass-cloudflare.js
  - https://github.com/ccxt/ccxt/blob/master/examples/py/bypass-cloudflare.py
  - https://github.com/ccxt/ccxt/blob/master/examples/py/bypass-cloudflare-with-cookies.py
- use a proxy (this is less responsive, though)
- ask the exchange support to add you to a whitelist
- run your software in close proximity to the exchange (same country, same city, same datacenter, same server rack, same server)
- try an alternative IP within a different geographic region
- run your software in a distributed network of servers
- ...

# Markets

Each exchange is a place for trading some kinds of valuables. Sometimes they are called with various different terms like instruments, symbols, trading pairs, currencies, tokens, stocks, commodities, contracts, etc, but they all mean the same – a trading pair, a symbol or a financial instrument.

In terms of the ccxt library, every exchange offers multiple markets within itself. The set of markets differs from exchange to exchange opening possibilities for cross-exchange and cross-market arbitrage. A market is usually a pair of traded crypto/fiat currencies.

## Market Structure

```JavaScript
{
    'id':     ' btcusd',  // string literal for referencing within an exchange
    'symbol':  'BTC/USD', // uppercase string literal of a pair of currencies
    'base':    'BTC',     // uppercase string, unified base currency code, 3 or more letters
    'quote':   'USD',     // uppercase string, unified quote currency code, 3 or more letters
    'baseId':  'btc',     // any string, exchange-specific base currency id
    'quoteId': 'usd',     // any string, exchange-specific quote currency id
    'active': true,       // boolean, market status
    'precision': {        // number of decimal digits "after the dot"
        'price': 8,       // integer or float for TICK_SIZE roundingMode, might be missing if not supplied by the exchange
        'amount': 8,      // integer, might be missing if not supplied by the exchange
        'cost': 8,        // integer, very few exchanges actually have it
    },
    'limits': {           // value limits when placing orders on this market
        'amount': {
            'min': 0.01,  // order amount should be > min
            'max': 1000,  // order amount should be < max
        },
        'price': { ... }, // same min/max limits for the price of the order
        'cost':  { ... }, // same limits for order cost = price * amount
    },
    'info':      { ... }, // the original unparsed market info from the exchange
}
```

Each market is an associative array (aka dictionary) with the following keys:

- `id`. The string or numeric ID of the market or trade instrument within the exchange. Market ids are used inside exchanges internally to identify trading pairs during the request/response process.
- `symbol`. An uppercase string code representation of a particular trading pair or instrument. This is usually written as `BaseCurrency/QuoteCurrency` with a slash as in `BTC/USD`, `LTC/CNY` or `ETH/EUR`, etc. Symbols are used to reference markets within the ccxt library (explained below).
- `base`. A unified uppercase string code of base fiat or crypto currency. This is the standardized currency code that is used to refer to that currency or token throughout CCXT and throughout the Unified CCXT API, it's the language that CCXT understands.
- `quote`. A unified uppercase string code of quoted fiat or crypto currency.
- `baseId`. An exchange-specific id of the base currency for this market, not unified. Can be any string, literally. This is communicated to the exchange using the language the exchange understands.
- `quoteId`. An exchange-specific id of the quote currency, not unified.
- `active`. A boolean indicating whether or not trading this market is currently possible. Often, when a market is inactive, all corresponding tickers, orderbooks and other related endpoints return empty responses, all zeroes, no data or outdated data for that market. The user should check if the market is active and [reload market cache periodically, as explained below](#market-cache-force-reload).
- `info`. An associative array of non-common market properties, including fees, rates, limits and other general market information. The internal info array is different for each particular market, its contents depend on the exchange.
- `precision`. The amounts of decimal digits accepted in order values by exchanges upon order placement for price, amount and cost.
- `limits`. The minimums and maximums for prices, amounts (volumes) and costs (where cost = price * amount).

### Precision And Limits

**Do not confuse `limits` with `precision`!** Precision has nothing to do with min limits. A precision of 8 digits does not necessarily mean a min limit of 0.00000001. The opposite is also true: a min limit of 0.0001 does not necessarily mean a precision of 4.

Examples:

1. `(market['limits']['amount']['min'] == 0.05) && (market['precision']['amount'] == 4)`

  In the first example the **amount** of any order placed on the market **must satisfy both conditions**:

  - The *amount value* should be >= 0.05:
    ```diff
    + good: 0.05, 0.051, 0.0501, 0.0502, ..., 0.0599, 0.06, 0.0601, ...
    - bad: 0.04, 0.049, 0.0499
    ```
  - *Precision of the amount* should up to 4 decimal digits:
    ```diff
    + good: 0.05, 0.051, 0.052, ..., 0.0531, ..., 0.06, ... 0.0719, ...
    - bad: 0.05001, 0.05000, 0.06001
    ```

2. `(market['limits']['price']['min'] == 0.0019) && (market['precision']['price'] == 5)`

  In the second example the **price** of any order placed on the market **must satisfy both conditions**:

  - The *price value* should be >= 0.019:
    ```diff
    + good: 0.019, ... 0.0191, ... 0.01911, 0.01912, ...
    - bad: 0.016, ..., 0.01699
    ```
  - *Precision of price* should be 5 decimal digits or less:
    ```diff
    + good: 0.02, 0.021, 0.0212, 0.02123, 0.02124, 0.02125, ...
    - bad: 0.017000, 0.017001, ...
    ```

3. `(market['limits']['amount']['min'] == 50) && (market['precision']['amount'] == -1)`

  - The *amount value* should be greater than 50:
    ```diff
    + good: 50, 60, 70, 80, 90, 100, ... 2000, ...
    - bad: 1, 2, 3, ..., 9
    ```
  - A negative *amount precision* means that the amount should be an integer multiple of 10 (to the absolute power specified):
    ```diff
    + good: 50, ..., 110, ... 1230, ..., 1000000, ..., 1234560, ...
    - bad: 9.5, ... 10.1, ..., 11, ... 200.71, ...
    ```

*The `precision` and `limits` params are currently under heavy development, some of these fields may be missing here and there until the unification process is complete. This does not influence most of the orders but can be significant in extreme cases of very large or very small orders. The `active` flag is not yet supported and/or implemented by all markets.*

#### Notes On Precision And Limits

The user is required to stay within all limits and precision! The values of the order should satisfy the following conditions:

- Order `amount` > `limits['min']['amount']`
- Order `amount` < `limits['max']['amount']`
- Order `price` > `limits['min']['price']`
- Order `price` < `limits['max']['price']`
- Order `cost` (`amount * price`) > `limits['min']['cost']`
- Order `cost` (`amount * price`) < `limits['max']['cost']`
- Precision of `amount` must be <= `precision['amount']`
- Precision of `price` must be <= `precision['price']`

The above values can be missing with some exchanges that don't provide info on limits from their API or don't have it implemented yet.

#### Methods For Formatting Decimals

Each exchange has its own rounding, counting and padding modes.

Supported rounding modes are:

- `ROUND` – will round the last decimal digits to precision
- `TRUNCATE`– will cut off the digits after certain precision

The decimal precision counting mode is available in the `exchange.precisionMode` property.

Supported counting modes are:

- `DECIMAL_PLACES` – counts all digits, 99% of exchanges use this counting mode
- `SIGNIFICANT_DIGITS` – counts non-zero digits only, some exchanges (`bitfinex` and maybe a few other) implement this mode of counting decimals
- `TICK_SIZE` – some exchanges only allow a multiple of a specific value (`bitmex` uses this mode)

Supported padding modes are:

- `NO_PADDING` – default for most cases
- `PAD_WITH_ZERO` – appends zero characters up to precision

The exchange base class contains the `decimalToPrecision` method to help format values to the required decimal precision with support for different rounding, counting and padding modes.

```JavaScript
// JavaScript
function decimalToPrecision (x, roundingMode, numPrecisionDigits, countingMode = DECIMAL_PLACES, paddingMode = NO_PADDING)
```

```Python
# Python
# WARNING! The `decimal_to_precision` method is susceptible to getcontext().prec!
def decimal_to_precision(n, rounding_mode=ROUND, precision=None, counting_mode=DECIMAL_PLACES, padding_mode=NO_PADDING):
```

```PHP
// PHP
function decimalToPrecision ($x, $roundingMode = ROUND, $numPrecisionDigits = null, $countingMode = DECIMAL_PLACES, $paddingMode = NO_PADDING)
```

For examples of how to use the `decimalToPrecision` to format strings and floats, please, see the following files:

- JavaScript: https://github.com/ccxt/ccxt/blob/master/js/test/base/functions/test.number.js
- Python: https://github.com/ccxt/ccxt/blob/master/python/test/test_decimal_to_precision.py
- PHP: https://github.com/ccxt/ccxt/blob/master/php/test/decimal_to_precision.php

**Python WARNING! The `decimal_to_precision` method is susceptible to getcontext().prec!**

## Loading Markets

In most cases you are required to load the list of markets and trading symbols for a particular exchange prior to accessing other API methods. If you forget to load markets the ccxt library will do that automatically upon your first call to the unified API. It will send two HTTP requests, first for markets and then the second one for other data, sequentially.

In order to load markets manually beforehand call the `loadMarkets ()` / `load_markets ()` method on an exchange instance. It returns an associative array of markets indexed by trading symbol. If you want more control over the execution of your logic, preloading markets by hand is recommended.

```JavaScript
// JavaScript
(async () => {
    let kraken = new ccxt.kraken ()
    let markets = await kraken.load_markets ()
    console.log (kraken.id, markets)
}) ()
```

```Python
# Python
okcoin = ccxt.okcoinusd ()
markets = okcoin.load_markets ()
print (okcoin.id, markets)
```

```PHP
// PHP
$id = 'huobipro';
$exchange = '\\ccxt\\' . $id;
$huobipro = new $exchange ();
$markets = $huobipro->load_markets ();
var_dump ($huobipro->id, $markets);
```

## Symbols And Market Ids

Market ids are used during the REST request-response process to reference trading pairs within exchanges. The set of market ids is unique per exchange and cannot be used across exchanges. For example, the BTC/USD pair/market may have different ids on various popular exchanges, like `btcusd`, `BTCUSD`, `XBTUSD`, `btc/usd`, `42` (numeric id), `BTC/USD`, `Btc/Usd`, `tBTCUSD`, `XXBTZUSD`. You don't need to remember or use market ids, they are there for internal HTTP request-response purposes inside exchange implementations.

The ccxt library abstracts uncommon market ids to symbols, standardized to a common format. Symbols aren't the same as market ids. Every market is referenced by a corresponding symbol. Symbols are common across exchanges which makes them suitable for arbitrage and many other things.

A symbol is usually an uppercase string literal name for a pair of traded currencies with a slash in between. A currency is a code of three or four uppercase letters, like `BTC`, `ETH`, `USD`, `GBP`, `CNY`, `LTC`, `JPY`, `DOGE`, `RUB`, `ZEC`, `XRP`, `XMR`, etc. Some exchanges have exotic currencies with longer names. The first currency before the slash is usually called *base currency*, and the one after the slash is called *quote currency*.  Examples of a symbol are: `BTC/USD`, `DOGE/LTC`, `ETH/EUR`, `DASH/XRP`, `BTC/CNY`, `ZEC/XMR`, `ETH/JPY`.

Sometimes the user might notice a symbol like `'XBTM18'` or `'.XRPUSDM20180101'` or some other *"exotic/rare symbols"*. The symbol is **not required** to have a slash or to be a pair of currencies. The string in the symbol really depends on the type of the market (whether it is a spot market or a futures market, a darkpool market or an expired market, etc). Attempting to parse the symbol string is highly discouraged, one should not rely on the symbol format, it is recommended to use market properties instead.

Market structures are indexed by symbols and ids. The base exchange class also has builtin methods for accessing markets by symbols. Most API methods require a symbol to be passed in their first argument. You are often required to specify a symbol when querying current prices, making orders, etc.

Most of the time users will be working with market symbols. You will get a standard userland exception if you access non-existent keys in these dicts.

```JavaScript
// JavaScript

(async () => {

    console.log (await exchange.loadMarkets ())

    let btcusd1 = exchange.markets['BTC/USD']     // get market structure by symbol
    let btcusd2 = exchange.market ('BTC/USD')     // same result in a slightly different way

    let btcusdId = exchange.marketId ('BTC/USD')  // get market id by symbol

    let symbols = exchange.symbols                // get an array of symbols
    let symbols2 = Object.keys (exchange.markets) // same as previous line

    console.log (exchange.id, symbols)            // print all symbols

    let currencies = exchange.currencies          // a list of currencies

    let bitfinex = new ccxt.bitfinex ()
    await bitfinex.loadMarkets ()

    bitfinex.markets['BTC/USD']                   // symbol → market (get market by symbol)
    bitfinex.markets_by_id['XRPBTC']              // id → market (get market by id)

    bitfinex.markets['BTC/USD']['id']             // symbol → id (get id by symbol)
    bitfinex.markets_by_id['XRPBTC']['symbol']    // id → symbol (get symbol by id)

})
```

```Python
# Python

print (exchange.load_markets ())

etheur1 = exchange.markets['ETH/EUR']      # get market structure by symbol
etheur2 = exchange.market ('ETH/EUR')      # same result in a slightly different way

etheurId = exchange.market_id ('BTC/USD')  # get market id by symbol

symbols = exchange.symbols                 # get a list of symbols
symbols2 = list (exchange.markets.keys ()) # same as previous line

print (exchange.id, symbols)               # print all symbols

currencies = exchange.currencies           # a list of currencies

kraken = ccxt.kraken ()
kraken.load_markets ()

kraken.markets['BTC/USD']                  # symbol → market (get market by symbol)
kraken.markets_by_id['XXRPZUSD']           # id → market (get market by id)

kraken.markets['BTC/USD']['id']            # symbol → id (get id by symbol)
kraken.markets_by_id['XXRPZUSD']['symbol'] # id → symbol (get symbol by id)
```

```PHP
// PHP

$var_dump ($exchange->load_markets ());

$dashcny1 = $exchange->markets['DASH/CNY'];     // get market structure by symbol
$dashcny2 = $exchange->market ('DASH/CNY');     // same result in a slightly different way

$dashcnyId = $exchange->market_id ('DASH/CNY'); // get market id by symbol

$symbols = $exchange->symbols;                  // get an array of symbols
$symbols2 = array_keys ($exchange->markets);    // same as previous line

var_dump ($exchange->id, $symbols);             // print all symbols

$currencies = $exchange->currencies;            // a list of currencies

$okcoinusd = '\\ccxt\\okcoinusd';
$okcoinusd = new $okcoinusd ();

$okcoinusd->load_markets ();

$okcoinusd->markets['BTC/USD'];                 // symbol → market (get market by symbol)
$okcoinusd->markets_by_id['btc_usd'];           // id → market (get market by id)

$okcoinusd->markets['BTC/USD']['id'];           // symbol → id (get id by symbol)
$okcoinusd->markets_by_id['btc_usd']['symbol']; // id → symbol (get symbol by id)
```

### Naming Consistency

There is a bit of term ambiguity across various exchanges that may cause confusion among newcoming traders. Some exchanges call markets as *pairs*, whereas other exchanges call symbols as *products*. In terms of the ccxt library, each exchange contains one or more trading markets. Each market has an id and a symbol. Most symbols are pairs of base currency and quote currency.

```Exchanges → Markets → Symbols → Currencies```

Historically various symbolic names have been used to designate same trading pairs. Some cryptocurrencies (like Dash) even changed their names more than once during their ongoing lifetime. For consistency across exchanges the ccxt library will perform the following known substitutions for symbols and currencies:

- `XBT → BTC`: `XBT` is newer but `BTC` is more common among exchanges and sounds more like bitcoin ([read more](https://www.google.ru/search?q=xbt+vs+btc)).
- `BCC → BCH`: The Bitcoin Cash fork is often called with two different symbolic names: `BCC` and `BCH`. The name `BCC` is ambiguous for Bitcoin Cash, it is confused with BitConnect. The ccxt library will convert `BCC` to `BCH` where it is appropriate (some exchanges and aggregators confuse them).
- `DRK → DASH`: `DASH` was Darkcoin then became Dash ([read more](https://minergate.com/blog/dashcoin-and-dash/)).
- `BCHABC → BCH`: On November 15 2018 Bitcoin Cash forked the second time, so, now there is `BCH` (for BCH ABC) and `BSV` (for BCH SV).
- `BCHSV → BSV`: This is a common substitution mapping for the Bitcoin Cash SV fork (some exchanges call it `BSV`, others call it `BCHSV`, we use the former).
- `DSH → DASH`: Try not to confuse symbols and currencies. The `DSH` (Dashcoin) is not the same as `DASH` (Dash). Some exchanges have `DASH` labelled inconsistently as `DSH`, the ccxt library does a correction for that as well (`DSH → DASH`), but only on certain exchanges that have these two currencies confused, whereas most exchanges have them both correct. Just remember that `DASH/BTC` is not the same as `DSH/BTC`.
- `XRB` → `NANO`: `NANO` is the newer code for RaiBlocks, thus, CCXT unified API uses will replace the older `XRB` with `NANO` where needed. https://hackernoon.com/nano-rebrand-announcement-9101528a7b76
- `USD` → `USDT`: Some exchanges, like Bitfinex, HitBTC and a few other name the currency as `USD` in their listings, but those markets are actually trading `USDT`. The confusion can come from a 3-letter limitation on symbol names or may be due to other reasons. In cases where the traded currency is actually `USDT` and is not `USD` – the CCXT library will perform `USD` → `USDT` conversion. Note, however, that some exchanges  have both `USD` and `USDT` symbols, for example, Kraken has a `USDT/USD` trading pair.

#### Notes On Naming Consistency

Each exchange has an associative array of substitutions for cryptocurrency symbolic codes in the `exchange.commonCurrencies` property. Sometimes the user may notice exotic symbol names with mixed-case words and spaces in the code. The logic behind having these names is explained by the rules for resolving conflicts in naming and currency-coding when one or more currencies have the same symbolic code with different exchanges:

- First, we gather all info available from the exchanges themselves about the currency codes in question. They usually have a description of their coin listings somewhere in their API or their docs, knowledgebases or elsewhere on their websites.
- When we identify each particular cryptocurrency standing behind the currency code, we look them up on [CoinMarketCap](https://coinmarketcap.com).
- The currency that has the greatest market capitalization of all wins the currency code and keeps it. For example, HOT often stand for either `Holo` or `Hydro Protocol`. In this case `Holo` retains the code `HOT`, and `Hydro Protocol` will have its name as its code, literally, `Hydro Protocol`. So, there may be trading pairs with symbols like `HOT/USD` (for `Holo`) and `Hydro Protocol/USD` – those are two different markets.
- If market cap of a particular coin is unknown or is not enough to determine the winner, we also take trading volumes and other factors into consideration.
- When the winner is determined all other competing currencies get their code names properly remapped and substituted within conflicting exchanges via `.commonCurrencies`.
- Unfortunately this is a work in progress, because new currencies get listed daily and new exchanges are added from time to time, so, in general this is a never-ending process of self-correction in a quickly changing environment, practically, in *"live mode"*. We are thankful for all reported conflicts and mismatches you may find.

#### Questions On Naming Consistency

**_Is it possible for symbols to change?_**

In short, yes, sometimes, but rarely. Symbolic mappings can be changed if that is absolutely required and cannot be avoided. However, all previous symbolic changes were related to resolving conflicts or forks. So far, there was no precedent of a market cap of one coin overtaking another coin with the same symbolic code in CCXT.

**_Can we rely on always listing the same crypto with the same symbol?_**

More or less ) First, this library is a work in progress, and it is trying to adapt to the everchanging reality, so there may be conflicts that we will fix by changing some mappings in the future. Ultimately, the license says "no warranties, use at your own risk". However, we don't change symbolic mappings randomly all over the place, because we understand the consequences and we'd want to rely on the library as well and we don't like to break the backward-compatibility at all.

If it so happens that a symbol of a major token is forked or has to be changed, then the control is still in the users' hands. The `exchange.commonCurrencies` property can be [overrided upon initialization or later](#overriding-exchange-properties-upon-instantiation), just like any other exchange property.  If a significant token is involved, we usually post instructions on how to retain the old behavior by adding a couple of lines to the constructor params.

#### Consistency Of Base And Quote Currencies

It depends on which exchange you are using, but some of them have a reversed (inconsistent) pairing of `base` and `quote`. They actually have base and quote misplaced  (switched/reversed sides). In that case you'll see a difference of parsed `base` and `quote` currency values with the unparsed `info` in the market substructure.

For those exchanges the ccxt will do a correction, switching and normalizing sides of base and quote currencies when parsing exchange replies. This logic is financially and terminologically correct. If you want less confusion, remember the following rule: **base is always before the slash, quote is always after the slash in any symbol and with any market**.

```
base currency ↓
             BTC / USDT
             ETH / BTC
            DASH / ETH
                    ↑ quote currency
```

## Market Cache Force Reload

The `loadMarkets () / load_markets ()` is also a dirty method with a side effect of saving the array of markets on the exchange instance. You only need to call it once per exchange. All subsequent calls to the same method will return the locally saved (cached) array of markets.

When exchange markets are loaded, you can then access market information any time via the `markets` property. This property contains an associative array of markets indexed by symbol. If you need to force reload the list of markets after you have them loaded already, pass the reload = true flag to the same method again.

```JavaScript
// JavaScript
(async () => {
    let kraken = new ccxt.kraken ({ verbose: true }) // log HTTP requests
    await kraken.load_markets () // request markets
    console.log (kraken.id, kraken.markets)    // output a full list of all loaded markets
    console.log (Object.keys (kraken.markets)) // output a short list of market symbols
    console.log (kraken.markets['BTC/USD'])    // output single market details
    await kraken.load_markets () // return a locally cached version, no reload
    let reloadedMarkets = await kraken.load_markets (true) // force HTTP reload = true
    console.log (reloadedMarkets['ETH/BTC'])
}) ()
```

```Python
# Python
poloniex = ccxt.poloniex({'verbose': True}) # log HTTP requests
poloniex.load_markets() # request markets
print(poloniex.id, poloniex.markets)   # output a full list of all loaded markets
print(list(poloniex.markets.keys())) # output a short list of market symbols
print(poloniex.markets['BTC/ETH'])     # output single market details
poloniex.load_markets() # return a locally cached version, no reload
reloadedMarkets = poloniex.load_markets(True) # force HTTP reload = True
print(reloadedMarkets['ETH/ZEC'])
```

```PHP
// PHP
$bitfinex = new \ccxt\bitfinex (array ('verbose' => true)); // log HTTP requests
$bitfinex.load_markets (); // request markets
var_dump ($bitfinex->id, $bitfinex->markets); // output a full list of all loaded markets
var_dump (array_keys ($bitfinex->markets));   // output a short list of market symbols
var_dump ($bitfinex->markets['XRP/USD']);     // output single market details
$bitfinex->load_markets (); // return a locally cached version, no reload
$reloadedMarkets = $bitfinex->load_markets (true); // force HTTP reload = true
var_dump ($bitfinex->markets['XRP/BTC']);
```

# API Methods / Endpoints

Each exchange offers a set of API methods. Each method of the API is called an *endpoint*. Endpoints are HTTP URLs for querying various types of information. All endpoints return JSON in response to client requests.

Usually, there is an endpoint for getting a list of markets from an exchange, an endpoint for retrieving an order book for a particular market, an endpoint for retrieving trade history, endpoints for placing and canceling orders, for money deposit and withdrawal, etc... Basically every kind of action you could perform within a particular exchange has a separate endpoint URL offered by the API.

Because the set of methods differs from exchange to exchange, the ccxt library implements the following:
- a public and private API for all possible URLs and methods
- a unified API supporting a subset of common methods

The endpoint URLs are predefined in the `api` property for each exchange. You don't have to override it, unless you are implementing a new exchange API (at least you should know what you're doing).

## Implicit API Methods

Most of exchange-specific API methods are implicit, meaning that they aren't defined explicitly anywhere in code. The library implements a declarative approach for defining implicit (non-unified) exchanges' API methods.

Each method of the API usually has its own endpoint. The library defines all endpoints for each particular exchange in the `.api` property. Upon exchange construction an implicit *magic* method (aka *partial function* or *closure*) will be created inside `defineRestApi()/define_rest_api()` on the exchange instance for each endpoint from the list of `.api` endpoints. This is performed for all exchanges universally. Each generated method will be accessible in both `camelCase` and `under_score` notations.

The endpoints definition is a **full list of ALL API URLs** exposed by an exchange. This list gets converted to callable methods upon exchange instantiation. Each URL in the API endpoint list gets a corresponding callable method. This is done automatically for all exchanges, therefore the ccxt library supports **all possible URLs** offered by crypto exchanges.

Each implicit method gets a unique name which is constructed from the `.api` definition. For example, a private HTTPS PUT `https://api.exchange.com/order/{id}/cancel` endpoint will have a corresponding exchange method named `.privatePutOrderIdCancel()`/`.private_put_order_id_cancel()`. A public HTTPS GET `https://api.exchange.com/market/ticker/{pair}` endpoint would result in the corresponding method named `.publicGetTickerPair()`/`.public_get_ticker_pair()`, and so on.

An implicit method takes a dictionary of parameters, sends the request to the exchange and returns an exchange-specific JSON result from the API **as is, unparsed**. To pass a parameter, add it to the dictionary explicitly under a key equal to the parameter's name. For the examples above, this would look like `.privatePutOrderIdCancel ({ id: '41987a2b-...' })` and `.publicGetTickerPair ({ pair: 'BTC/USD' })`.

The recommended way of working with exchanges is not using exchange-specific implicit methods but using the unified ccxt methods instead. The exchange-specific methods should be used as a fallback in cases when a corresponding unified method isn't available (yet).

To get a list of all available methods with an exchange instance, including implicit methods and unified methods you can simply do the following:

```
console.log (new ccxt.kraken ())   // JavaScript
print(dir(ccxt.hitbtc()))           # Python
var_dump (new \ccxt\okcoinusd ()); // PHP
```

## Public/Private API

API URLs are often grouped into two sets of methods called a *public API* for market data and a *private API* for trading and account access. These groups of API methods are usually prefixed with a word 'public' or 'private'.

A public API is used to access market data and does not require any authentication whatsoever. Most exchanges provide market data openly to all (under their rate limit). With the ccxt library anyone can access market data out of the box without having to register with the exchanges and without setting up account keys and passwords.

Public APIs include the following:

- instruments/trading pairs
- price feeds (exchange rates)
- order books (L1, L2, L3...)
- trade history (closed orders, transactions, executions)
- tickers (spot / 24h price)
- OHLCV series for charting
- other public endpoints

For trading with private API you need to obtain API keys from/to exchanges. It often means registering with exchanges and creating API keys with your account. Most exchanges require personal info or identification. Some kind of verification may be necessary as well.

If you want to trade you need to register yourself, this library will not create accounts or API keys for you. Some exchange APIs expose interface methods for registering an account from within the code itself, but most of exchanges don't. You have to sign up and create API keys with their websites.

Private APIs allow the following:

- manage personal account info
- query account balances
- trade by making market and limit orders
- create deposit addresses and fund accounts
- request withdrawal of fiat and crypto funds
- query personal open / closed orders
- query positions in margin/leverage trading
- get ledger history
- transfer funds between accounts
- use merchant services

Some exchanges offer the same logic under different names. For example, a public API is also often called *market data*, *basic*, *market*, *mapi*, *api*, *price*, etc... All of them mean a set of methods for accessing data available to public. A private API is also often called *trading*, *trade*, *tapi*, *exchange*, *account*, etc...

A few exchanges also expose a merchant API which allows you to create invoices and accept crypto and fiat payments from your clients. This kind of API is often called *merchant*, *wallet*, *payment*, *ecapi* (for e-commerce).

To get a list of all available methods with an exchange instance, you can simply do the following:

```
console.log (new ccxt.kraken ())   // JavaScript
print (dir (ccxt.hitbtc ()))        # Python
var_dump (new \ccxt\okcoinusd ()); // PHP
```

## Synchronous vs Asynchronous Calls

In the JavaScript version of CCXT all methods are asynchronous and return [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolve with a decoded JSON object. In CCXT we use the modern *async/await* syntax to work with Promises. If you're not familiar with that syntax, you can read more about it [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function).

```JavaScript
// JavaScript

(async () => {
    let pairs = await kraken.publicGetSymbolsDetails ()
    let marketIds = Object.keys (pairs['result'])
    let marketId = marketIds[0]
    let ticker = await kraken.publicGetTicker ({ pair: marketId })
    console.log (kraken.id, marketId, ticker)
}) ()
```

The ccxt library supports asynchronous concurrency mode in Python 3.5+ with async/await syntax. The asynchronous Python version uses pure [asyncio](https://docs.python.org/3/library/asyncio.html) with [aiohttp](http://aiohttp.readthedocs.io). In async mode you have all the same properties and methods, but most methods are decorated with an async keyword. If you want to use async mode, you should link against the `ccxt.async_support` subpackage, like in the following example:

```Python
# Python

import asyncio
import ccxt.async_support as ccxt

async def print_poloniex_ethbtc_ticker():
    poloniex = ccxt.poloniex()
    print(await poloniex.fetch_ticker('ETH/BTC'))

asyncio.get_event_loop().run_until_complete(print_poloniex_ethbtc_ticker())
```

In PHP all API methods are synchronous.

## Returned JSON Objects

All public and private API methods return raw decoded JSON objects in response from the exchanges, as is, untouched. The unified API returns JSON-decoded objects in a common format and structured uniformly across all exchanges.

## Passing Parameters To API Methods

The set of all possible API endpoints differs from exchange to exchange. Most of methods accept a single associative array (or a Python dict) of key-value parameters. The params are passed as follows:

```
bitso.publicGetTicker ({ book: 'eth_mxn' })                 // JavaScript
ccxt.zaif().public_get_ticker_pair ({ 'pair': 'btc_jpy' })  # Python
$luno->public_get_ticker (array ('pair' => 'XBTIDR'));      // PHP
```

For a full list of accepted method parameters for each exchange, please consult [API docs](#exchanges).

### API Method Naming Conventions

An exchange method name is a concatenated string consisting of type (public or private), HTTP method (GET, POST, PUT, DELETE) and endpoint URL path like in the following examples:

| Method Name                  | Base API URL                   | Endpoint URL                   |
|------------------------------|--------------------------------|--------------------------------|
| publicGetIdOrderbook         | https://bitbay.net/API/Public  | {id}/orderbook                 |
| publicGetPairs               | https://bitlish.com/api        | pairs                          |
| publicGetJsonMarketTicker    | https://www.bitmarket.net      | json/{market}/ticker           |
| privateGetUserMargin         | https://bitmex.com             | user/margin                    |
| privatePostTrade             | https://btc-x.is/api           | trade                          |
| tapiCancelOrder              | https://yobit.net              | tapi/CancelOrder               |
| ...                          | ...                            | ...                            |

The ccxt library supports both camelcase notation (preferred in JavaScript) and underscore notation (preferred in Python and PHP), therefore all methods can be called in either notation or coding style in any language. Both of these notations work in JavaScript, Python and PHP:

```
exchange.methodName ()  // camelcase pseudocode
exchange.method_name () // underscore pseudocode
```

To get a list of all available methods with an exchange instance, you can simply do the following:

```
console.log (new ccxt.kraken ())   // JavaScript
print (dir (ccxt.hitbtc ()))        # Python
var_dump (new \ccxt\okcoinusd ()); // PHP
```

## Unified API

The unified ccxt API is a subset of methods common among the exchanges. It currently contains the following methods:

- `fetchMarkets ()`: Fetches a list of all available markets from an exchange and returns an array of markets (objects with properties such as `symbol`, `base`, `quote` etc.). Some exchanges do not have means for obtaining a list of markets via their online API. For those, the list of markets is hardcoded.
- `loadMarkets ([reload])`: Returns the list of markets as an object indexed by symbol and caches it with the exchange instance. Returns cached markets if loaded already, unless the `reload = true` flag is forced.
- `fetchOrderBook (symbol[, limit = undefined[, params = {}]])`: Fetch L2/L3 order book for a particular market trading symbol.
- `fetchStatus ([, params = {}])`: Returns information regarding the exchange status from either the info hardcoded in the exchange instance or the API, if available.
- `fetchL2OrderBook (symbol[, limit = undefined[, params]])`: Level 2 (price-aggregated) order book for a particular symbol.
- `fetchTrades (symbol[, since[, [limit, [params]]]])`: Fetch recent trades for a particular trading symbol.
- `fetchTicker (symbol)`: Fetch latest ticker data by trading symbol.
- `fetchBalance ()`: Fetch Balance.
- `createOrder (symbol, type, side, amount[, price[, params]])`
- `createLimitBuyOrder (symbol, amount, price[, params])`
- `createLimitSellOrder (symbol, amount, price[, params])`
- `createMarketBuyOrder (symbol, amount[, params])`
- `createMarketSellOrder (symbol, amount[, params])`
- `cancelOrder (id[, symbol[, params]])`
- `fetchOrder (id[, symbol[, params]])`
- `fetchOrders ([symbol[, since[, limit[, params]]]])`
- `fetchOpenOrders ([symbol[, since, limit, params]]]])`
- `fetchClosedOrders ([symbol[, since[, limit[, params]]]])`
- `fetchMyTrades ([symbol[, since[, limit[, params]]]])`
- ...

### Overriding Unified API Params

Note, that most of methods of the unified API accept an optional `params` parameter. It is an associative array (a dictionary, empty by default) containing the params you want to override. The contents of `params` are exchange-specific, consult the exchanges' API documentation for supported fields and values. Use the `params` dictionary if you need to pass a custom setting or an optional parameter to your unified query.

```JavaScript
// JavaScript
(async () => {

    const params = {
        'foo': 'bar',      // exchange-specific overrides in unified queries
        'Hello': 'World!', // see their docs for more details on parameter names
    }

    // the overrides go into the last argument to the unified call ↓ HERE
    const result = await exchange.fetchOrderBook (symbol, length, params)
}) ()
```

```Python
# Python
params = {
    'foo': 'bar',       # exchange-specific overrides in unified queries
    'Hello': 'World!',  # see their docs for more details on parameter names
}

# overrides go in the last argument to the unified call ↓ HERE
result = exchange.fetch_order_book(symbol, length, params)
```

```PHP
// PHP
$params = array (
    'foo' => 'bar',       // exchange-specific overrides in unified queries
    'Hello' => 'World!',  // see their docs for more details on parameter names
}

// overrides go into the last argument to the unified call ↓ HERE
$result = $exchange->fetch_order_book ($symbol, $length, $params);
```

### Pagination

Most of unified methods will return either a single object or a plain array (a list) of objects (trades, orders, transactions and so on). However, very few exchanges (if any at all) will return all orders, all trades, all ohlcv candles or all transactions at once. Most often their APIs `limit` output to a certain number of most recent objects. **YOU CANNOT GET ALL OBJECTS SINCE THE BEGINNING OF TIME TO THE PRESENT MOMENT IN JUST ONE CALL**. Practically, very few exchanges will tolerate or allow that.

To fetch historical orders or trades, the user will need to traverse the data in portions or "pages" of objects. Pagination often implies *"fetching portions of data one by one"* in a loop.

In most cases users are **required to use at least some type of pagination** in order to get the expected results consistently. If the user does not apply any pagination, most methods will return the exchanges' default, which may start from the beginning of history or may be a subset of most recent objects. The default behaviour (without pagination) is exchange-specific! The means of pagination are often used with the following methods in particular:

- `fetchTrades`
- `fetchOHLCV`
- `fetchOrders`
- `fetchOpenOrders`
- `fetchClosedOrders`
- `fetchMyTrades`
- `fetchTransactions`
- `fetchDeposits`
- `fetchWithdrawals`

With methods returning lists of objects, exchanges may offer one or more types of pagination. CCXT unifies **date-based pagination** by default, with timestamps **in milliseconds** throughout the entire library.

#### Working With Datetimes and Timestamps

The set of methods for working with UTC dates and timestamps and for converting between them:

```JavaScript
exchange.parse8601 ('2018-01-01T00:00:00Z') == 1514764800000 // integer, Z = UTC
exchange.iso8601 (1514764800000) == '2018-01-01T00:00:00Z'   // iso8601 string
exchange.seconds ()      // integer UTC timestamp in seconds
exchange.milliseconds () // integer UTC timestamp in milliseconds
```

#### Date-based pagination

This is the type of pagination currently used throughout the CCXT Unified API. The user supplies a `since` timestamp **in milliseconds** (!) and a number to `limit` results. To traverse the objects of interest page by page, the user runs the following (below is pseudocode, it may require overriding some exchange-specific params, depending on the exchange in question):

```JavaScript
// JavaScript
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
            since = trades[trades.length - 1]['timestamp']
            allTrades = allTrades.concat (trades)
        } else {
            break
        }
    }
}
```

```Python
# Python
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
            since = orders[len(orders) - 1]['timestamp']
            all_orders += orders
        else:
            break
```

```PHP
// PHP
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
            $since = $trades[count($trades) - 1]['timestamp'];
            $all_trades = array_merge ($all_trades, $trades);
        } else {
            break;
        }
    }
}
```

#### id-based pagination

The user supplies a `from_id` of the object, from where the query should continue returning results, and a number to `limit` results. This is the default with some exchanges, however, this type is not unified (yet). To paginate objects based on their ids, the user would run the following:

```JavaScript
// JavaScript
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

```Python
# Python
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

```PHP
// PHP
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

#### Pagenumber-based (cursor) pagination

The user supplies a page number or an *initial "cursor"* value. The exchange returns a page of results and the *next "cursor"* value, to proceed from. Most of exchanges that implement this type of pagination will either return the next cursor within the response itself or will return the next cursor values within HTTP response headers.

See an example implementation here: https://github.com/ccxt/ccxt/blob/master/examples/py/gdax-fetch-my-trades-pagination.py

Upon each iteration of the loop the user has to take the next cursor and put it into the overrided params for the next query (on the following iteration):

```JavaScript
// JavaScript
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
            // not thread-safu and exchange-specific !
            page = exchange.last_json_response['cursor']
            allTrades.push (trades)
        } else {
            break
        }
    }
}
```

```Python
# Python
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
            # not thread-safu and exchange-specific !
            cursor = exchange.last_http_headers['CB-AFTER']
            all_orders += orders
        else:
            break
```

```PHP
// PHP
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
            // not thread-safu and exchange-specific !
            $start = $exchange->last_json_response['next'];
            $all_trades = array_merge ($all_trades, $trades);
        } else {
            break;
        }
    }
}
```

# Market Data

- [Order Book / Market Depth](https://github.com/ccxt/ccxt/wiki/Manual#order-book--market-depth)
  - [Market Price](https://github.com/ccxt/ccxt/wiki/Manual#market-price)
- [Price Tickers](https://github.com/ccxt/ccxt/wiki/Manual#price-tickers)
  - [Individually By Symbol](https://github.com/ccxt/ccxt/wiki/Manual#individually-by-symbol)
  - [All At Once](https://github.com/ccxt/ccxt/wiki/Manual#all-at-once)
- [OHLCV Candlestick Charts](https://github.com/ccxt/ccxt/wiki/Manual#ohlcv-candlestick-charts)
- [Public Trades](https://github.com/ccxt/ccxt/wiki/Manual#public-trades)

## Order Book

Exchanges expose information on open orders with bid (buy) and ask (sell) prices, volumes and other data. Usually there is a separate endpoint for querying current state (stack frame) of the *order book* for a particular market. An order book is also often called *market depth*. The order book information is used in the trading decision making process.

The method for fetching an order book for a particular symbol is named `fetchOrderBook` or `fetch_order_book`. It accepts a symbol and an optional dictionary with extra params (if supported by a particular exchange). The method for fetching the order book is called like shown below:

```JavaScript
// JavaScript
delay = 2000 // milliseconds = seconds * 1000
(async () => {
    for (symbol in exchange.markets) {
        console.log (await exchange.fetchOrderBook (symbol))
        await new Promise (resolve => setTimeout (resolve, delay)) // rate limit
    }
}) ()
```

```Python
# Python
import time
delay = 2 # seconds
for symbol in exchange.markets:
    print (exchange.fetch_order_book (symbol))
    time.sleep (delay) # rate limit
```

```PHP
// PHP
$delay = 2000000; // microseconds = seconds * 1000000
foreach ($exchange->markets as $symbol => $market) {
    var_dump ($exchange->fetch_order_book ($symbol));
    usleep ($delay); // rate limit
}
```

### Order Book Structure

The structure of a returned order book is as follows:

```JavaScript
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
    'timestamp': 1499280391811, // Unix Timestamp in milliseconds (seconds * 1000)
    'datetime': '2017-07-05T18:47:14.692Z', // ISO8601 datetime string with milliseconds
}
```

**The timestamp and datetime may be missing (`undefined/None/null`) if the exchange in question does not provide a corresponding value in the API response.**

Prices and amounts are floats. The bids array is sorted by price in descending order. The best (highest) bid price is the first element and the worst (lowest) bid price is the last element. The asks array is sorted by price in ascending order. The best (lowest) ask price is the first element and the worst (highest) ask price is the last element. Bid/ask arrays can be empty if there are no corresponding orders in the order book of an exchange.

Exchanges may return the stack of orders in various levels of details for analysis. It is either in full detail containing each and every order, or it is aggregated having slightly less detail where orders are grouped and merged by price and volume. Having greater detail requires more traffic and bandwidth and is slower in general but gives a benefit of higher precision. Having less detail is usually faster, but may not be  enough in some very specific cases.

### Notes On Order Book Structure

- `orderbook['timestamp']` is the time when the exchange generated this orderbook response (before replying it back to you). This may be missing (`undefined/None/null`), as documented in the Manual, not all exchanges provide a timestamp there. If it is defined, then it is the UTC timestamp **in milliseconds** since 1 Jan 1970 00:00:00.

### Market Depth

Some exchanges accept a dictionary of extra parameters to the `fetchOrderBook () / fetch_order_book ()` function. **All extra `params` are exchange-specific (non-unified)**. You will need to consult exchanges docs if you want to override a particular param, like the depth of the order book. You can get a limited count of returned orders or a desired level of aggregation (aka *market depth*) by specifying an limit argument and exchange-specific extra `params` like so:

```JavaScript
// JavaScript

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

```Python
# Python

import ccxt
# return up to ten bidasks on each side of the order book stack
limit = 10
ccxt.cex().fetch_order_book('BTC/USD', limit)
```

```PHP
// PHP

// instantiate the exchange by id
$exchange = '\\ccxt\\kraken';
$exchange = new $exchange ();
// up to ten orders on each side, for example
$limit = 20;
var_dump ($exchange->fetch_order_book ('BTC/USD', $limit));
```

The levels of detail or levels of order book aggregation are often number-labelled like L1, L2, L3...

- **L1**: less detail for quickly obtaining very basic info, namely, the market price only. It appears to look like just one order in the order book.
- **L2**: most common level of aggregation where order volumes are grouped by price. If two orders have the same price, they appear as one single order for a volume equal to their total sum. This is most likely the level of aggregation you need for the majority of purposes.
- **L3**: most detailed level with no aggregation where each order is separate from other orders. This LOD naturally contains duplicates in the output. So, if two orders have equal prices they are **not** merged together and it's up to the exchange's matching engine to decide on their priority in the stack. You don't really need L3 detail for successful trading. In fact, you most probably don't need it at all. Therefore some exchanges don't support it and always return aggregated order books.

If you want to get an L2 order book, whatever the exchange returns, use the `fetchL2OrderBook(symbol, limit, params)` or `fetch_l2_order_book(symbol, limit, params)` unified method for that.

### Market Price

In order to get current best price (query market price) and calculate bidask spread take first elements from bid and ask, like so:

```JavaScript
// JavaScript
let orderbook = exchange.fetchOrderBook (exchange.symbols[0])
let bid = orderbook.bids.length ? orderbook.bids[0][0] : undefined
let ask = orderbook.asks.length ? orderbook.asks[0][0] : undefined
let spread = (bid && ask) ? ask - bid : undefined
console.log (exchange.id, 'market price', { bid, ask, spread })
```

```Python
# Python
orderbook = exchange.fetch_order_book (exchange.symbols[0])
bid = orderbook['bids'][0][0] if len (orderbook['bids']) > 0 else None
ask = orderbook['asks'][0][0] if len (orderbook['asks']) > 0 else None
spread = (ask - bid) if (bid and ask) else None
print (exchange.id, 'market price', { 'bid': bid, 'ask': ask, 'spread': spread })
```

```PHP
// PHP
$orderbook = $exchange->fetch_order_book ($exchange->symbols[0]);
$bid = count ($orderbook['bids']) ? $orderbook['bids'][0][0] : null;
$ask = count ($orderbook['asks']) ? $orderbook['asks'][0][0] : null;
$spread = ($bid && $ask) ? $ask - $bid : null;
$result = array ('bid' => $bid, 'ask' => $ask, 'spread' => $spread);
var_dump ($exchange->id, 'market price', $result);
```

## Price Tickers

A price ticker contains statistics for a particular market/symbol for some period of time in recent past, usually last 24 hours. The methods for fetching tickers are:

```JavaScript
fetchTicker (symbol, params = {})   // for one ticker
fetchTickers (symbol, params = {})  // for all tickers at once
```

Check the `exchange.has['fetchTicker']` and `exchange.has['fetchTickers']` properties of the exchange instance to determine if the exchange in question does support these methods.

### Ticker structure

The structure of a ticker is as follows:

```JavaScript
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

### Notes On Ticker Structure

- The `bidVolume` is the volume (amount) of current best bid in the orderbook.
- The `askVolume` is the volume (amount) of current best ask in the orderbook.
- The `baseVolume` is the amount of base currency traded (bought or sold) in last 24 hours.
- The `quoteVolume` is the amount of quote currency traded (bought or sold) in last 24 hours.

**All prices in ticker structure are in quote currency. Some fields in a returned ticker structure may be undefined/None/null.**

```
base currency ↓
             BTC / USDT
             ETH / BTC
            DASH / ETH
                    ↑ quote currency
```

Timestamp and datetime are both Universal Time Coordinated (UTC) in milliseconds.

- `ticker['timestamp']` is the time when the exchange generated this response (before replying it back to you). This may be missing (`undefined/None/null`), as documented in the Manual, not all exchanges provide a timestamp there. If it is defined, then it is the UTC timestamp **in milliseconds** since 1 Jan 1970 00:00:00.
- `exchange.last_response_headers['Date']` is the date-time string of the last HTTP response received (from HTTP headers). The 'Date' parser should respect the timezone designated there. The precision of the date-time is 1 second, 1000 milliseconds. This date should be set by the exchange server when the message originated according to the following standards:
    - https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.18
    - https://tools.ietf.org/html/rfc1123#section-5.2.14
    - https://tools.ietf.org/html/rfc822#section-5

Although some exchanges do mix-in orderbook's top bid/ask prices into their tickers (and some even top bid/asks volumes) you should not treat a ticker as a `fetchOrderBook` replacement. The main purpose of a ticker is to serve statistical data, as such, treat it as "live 24h OHLCV". It is known that exchanges discourage frequent `fetchTicker` requests by imposing stricter rate limits on these queries. If you need a unified way to access bid/asks you should use `fetchL[123]OrderBook` family instead.

To get historical prices and volumes use the unified [`fetchOHLCV`](https://github.com/ccxt/ccxt/wiki/Manual#ohlcv-candlestick-charts) method where available.

Methods for fetching tickers:

- `fetchTicker (symbol[, params = {}])`, symbol is required, params are optional
- `fetchTickers ([symbols = undefined[, params = {}]])`, both arguments optional

### Individually By Symbol

To get the individual ticker data from an exchange for each particular trading pair or symbol call the `fetchTicker (symbol)`:

```JavaScript
// JavaScript
if (exchange.has['fetchTicker']) {
    console.log (await (exchange.fetchTicker ('BTC/USD'))) // ticker for BTC/USD
    let symbols = Object.keys (exchange.markets)
    let random = Math.floor (Math.random () * (symbols.length - 1))
    console.log (exchange.fetchTicker (symbols[random])) // ticker for a random symbol
}
```

```Python
# Python
import random
if (exchange.has['fetchTicker']):
    print(exchange.fetch_ticker('LTC/ZEC')) # ticker for LTC/ZEC
    symbols = list(exchange.markets.keys())
    print(exchange.fetch_ticker(random.choice(symbols))) # ticker for a random symbol
```

```PHP
// PHP (don't forget to set your timezone properly!)
if ($exchange->has['fetchTicker']) {
    var_dump ($exchange->fetch_ticker ('ETH/CNY')); // ticker for ETH/CNY
    $symbols = array_keys ($exchange->markets);
    $random = rand () % count ($symbols);
    var_dump ($exchange->fetch_ticker ($symbols[$random])); // ticker for a random symbol
}
```

### All At Once

Some exchanges (not all of them) also support fetching all tickers at once. See [their docs](https://github.com/ccxt/ccxt/wiki/Manual#exchanges) for details. You can fetch all tickers with a single call like so:

```JavaScript
// JavaScript
if (exchange.has['fetchTickers']) {
    console.log (await (exchange.fetchTickers ())) // all tickers indexed by their symbols
}
```

```Python
# Python
if (exchange.has['fetchTickers']):
    print(exchange.fetch_tickers()) # all tickers indexed by their symbols
```

```PHP
// PHP
if ($exchange->has['fetchTickers']) {
    var_dump ($exchange->fetch_tickers ()); // all tickers indexed by their symbols
}
```

Fetching all tickers requires more traffic than fetching a single ticker. Also, note that some exchanges impose higher rate-limits on subsequent fetches of all tickers (see their docs on corresponding endpoints for details). **The cost of fetchTickers call in terms of rate limit is often higher than average**. If you only need one ticker, fetching by a particular symbol is faster as well. You probably want to fetch all tickers only if you really need all of them and, most likely, you don't want to fetchTickers more frequently than once a minute or so.

Also, some exchanges may impose additional requirements on fetchTickers call, sometimes you can't fetch tickers for all symbols because of API limitations of the exchange in question. Some exchanges allow specifying a list of symbols in HTTP URL query params, however, because URL length is limited, and in extreme cases exchanges can have thousands of markets – a list of all their symbols simply would not fit in the URL, so it has to be a limited subset of their symbols. Sometimes, there are other reasons for requiring a list of symbols, and there may be a limit on the number of symbols you can fetch at once, but whatever the limitation, please, blame the exchange. To pass the symbols of interest to the exchange, once can simply supply a list of strings as the first argument to fetchTickers:

```JavaScript
//JavaScript
if (exchange.has['fetchTickers']) {
    console.log (await (exchange.fetchTickers ([ 'ETH/BTC', 'LTC/BTC' ]))) // listed tickers indexed by their symbols
}
```

```Python
# Python
if (exchange.has['fetchTickers']):
    print(exchange.fetch_tickers(['ETH/BTC', 'LTC/BTC'])) # listed tickers indexed by their symbols
```

```PHP
// PHP
if ($exchange->has['fetchTickers']) {
    var_dump ($exchange->fetch_tickers (array ('ETH/BTC', 'LTC/BTC'))); // listed tickers indexed by their symbols
}
```

Note that the list of symbols is not required in most cases, but you must add additional logic if you want to handle all possible limitations that might be imposed on the exchanges' side.

Like most methods of the Unified CCXT API, the last argument to fetchTickers is the `params` argument for overriding request parameters that are sent towards the exchange.

The structure of the returned value is as follows:

```JavaScript
{
    'info':    { ... }, // the original JSON response from the exchange as is
    'BTC/USD': { ... }, // a single ticker for BTC/USD
    'ETH/BTC': { ... }, // a ticker for ETH/BTC
    ...
}
```

A general solution for fetching all tickers from all exchanges (even the ones that don't have a corresponding API endpoint) is on the way, this section will be updated soon.

```
UNDER CONSTRUCTION
```

#### Async Mode / Concurrency

```
UNDER CONSTRUCTION
```

## OHLCV Candlestick Charts

```diff
- this is under heavy development right now, contributions appreciated
```

Most exchanges have endpoints for fetching OHLCV data, but some of them don't. The exchange boolean (true/false) property named `has['fetchOHLCV']` indicates whether the exchange supports candlestick data series or not.

The `fetchOHLCV` method is declared in the following way:

```
fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {})
```

You can call the unified `fetchOHLCV` / `fetch_ohlcv` method to get the list of OHLCV candles for a particular symbol like so:

```JavaScript
// JavaScript
let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms));
if (exchange.has.fetchOHLCV) {
    for (symbol in exchange.markets) {
        await sleep (exchange.rateLimit) // milliseconds
        console.log (await exchange.fetchOHLCV (symbol, '1m')) // one minute
    }
}
```

```Python
# Python
import time
if exchange.has['fetchOHLCV']:
    for symbol in exchange.markets:
        time.sleep (exchange.rateLimit / 1000) # time.sleep wants seconds
        print (symbol, exchange.fetch_ohlcv (symbol, '1d')) # one day
```

```PHP
// PHP
if ($exchange->has['fetchOHLCV']) {
    foreach ($exchange->markets as $symbol => $market) {
        usleep ($exchange->rateLimit * 1000); // usleep wants microseconds
        var_dump ($exchange->fetch_ohlcv ($symbol, '1M')); // one month
    }
}
```

To get the list of available timeframes for your exchange see the `timeframes` property. Note that it is only populated when `has['fetchOHLCV']` is true as well.

**There's a limit on how far back in time your requests can go.** Most of exchanges will not allow to query detailed candlestick history (like those for 1-minute and 5-minute timeframes) too far in the past. They usually keep a reasonable amount of most recent candles, like 1000 last candles for any timeframe is more than enough for most of needs. You can work around that limitation by continuously fetching (aka *REST polling*) latest OHLCVs and storing them in a CSV file or in a database.

**Note that the info from the last (current) candle may be incomplete until the candle is closed (until the next candle starts).**

Like with most other unified and implicit methods, the `fetchOHLCV` method accepts as its last argument an associative array (a dictionary) of extra `params`, which is used to override default values that are sent in requests to the exchanges. The contents of `params` are exchange-specific, consult the exchanges' API documentation for supported fields and values.

The `since` argument is an integer UTC timestamp **in milliseconds** (everywhere throughout the library with all unified methods).

If `since` is not specified the `fetchOHLCV` method will return the time range as is the default from the exchange itself.  This is not a bug. Some exchanges will return candles from the beginning of time, others will return most recent candles only, the exchanges' default behaviour is expected. Thus, without specifying `since` the range of returned candles will be exchange-specific. One should pass  the `since` argument to ensure getting precisely the history range needed.

### OHLCV Structure

The fetchOHLCV method shown above returns a list (a flat array) of OHLCV candles represented by the following structure:

```JavaScript
[
    [
        1504541580000, // UTC timestamp in milliseconds, integer
        4235.4,        // (O)pen price, float
        4240.6,        // (H)ighest price, float
        4230.0,        // (L)owest price, float
        4230.7,        // (C)losing price, float
        37.72941911    // (V)olume (in terms of the base currency), float
    ],
    ...
]
```

The list of candles is returned sorted in ascending (historical) order, oldest candle first, most recent candle last.

### OHLCV Emulation

Some exchanges don't offer any OHLCV method, and for those, the ccxt library will emulate OHLCV candles from [Public Trades](https://github.com/ccxt/ccxt/wiki/Manual#trades-executions-transactions). In that case you will see `exchange.has['fetchOHLCV'] = 'emulated'`. However, because the trade history is usually very limited, the emulated fetchOHLCV methods cover most recent info only and should only be used as a fallback, when no other option is available.

**WARNING: the fetchOHLCV emulation is experimental!**

## Trades, Executions, Transactions

```diff
- this is under heavy development right now, contributions appreciated
```

You can call the unified `fetchTrades` / `fetch_trades` method to get the list of most recent trades for a particular symbol. The `fetchTrades` method is declared in the following way:

```
async fetchTrades (symbol, since = undefined, limit = undefined, params = {})
```

For example, if you want to print recent trades for all symbols one by one sequentially (mind the rateLimit!) you would do it like so:

```JavaScript
// JavaScript
if (exchange.has['fetchTrades']) {
    let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms));
    for (symbol in exchange.markets) {
        await sleep (exchange.rateLimit) // milliseconds
        console.log (await exchange.fetchTrades (symbol))
    }
}
```

```Python
# Python
import time
if exchange.has['fetchTrades']:
    for symbol in exchange.markets:  # ensure you have called loadMarkets() or load_markets() method.
        time.sleep (exchange.rateLimit / 1000)  # time.sleep wants seconds
        print (symbol, exchange.fetch_trades (symbol))
```

```PHP
// PHP
if ($exchange->has['fetchTrades']) {
    foreach ($exchange->markets as $symbol => $market) {
        usleep ($exchange->rateLimit * 1000); // usleep wants microseconds
        var_dump ($exchange->fetch_trades ($symbol));
    }
}
```

The fetchTrades method shown above returns an ordered list of trades (a flat array, sorted by timestamp in ascending order, oldest trade first, most recent trade last). A list of trades is represented by the following structure:

```JavaScript
[
    {
        'info':       { ... },                  // the original decoded JSON as is
        'id':        '12345-67890:09876/54321', // string trade id
        'timestamp':  1502962946216,            // Unix timestamp in milliseconds
        'datetime':  '2017-08-17 12:42:48.000', // ISO8601 datetime with milliseconds
        'symbol':    'ETH/BTC',                 // symbol
        'order':     '12345-67890:09876/54321', // string order id or undefined/None/null
        'type':      'limit',                   // order type, 'market', 'limit' or undefined/None/null
        'side':      'buy',                     // direction of the trade, 'buy' or 'sell'
        'price':      0.06917684,               // float price in quote currency
        'amount':     1.5,                      // amount of base currency
    },
    ...
]
```

Most exchanges return most of the above fields for each trade, though there are exchanges that don't return the type, the side, the trade id or the order id of the trade. Most of the time you are guaranteed to have the timestamp, the datetime, the symbol, the price and the amount of each trade.

The second optional argument `since` reduces the array by timestamp, the third `limit` argument reduces by number (count) of returned items.

If the user does not specify `since`, the `fetchTrades` method will return the default range of public trades from the exchange. The default set is exchange-specific, some exchanges will return trades starting from the date of listing a pair on the exchange, other exchanges will return a reduced set of trades (like, last 24 hours, last 100 trades, etc). If the user wants precise control over the timeframe, the user is responsible for specifying the `since` argument.

Most of unified methods will return either a single object or a plain array (a list) of objects (trades). However, very few exchanges (if any at all) will return all trades at once. Most often their APIs `limit` output to a certain number of most recent objects. **YOU CANNOT GET ALL OBJECTS SINCE THE BEGINNING OF TIME TO THE PRESENT MOMENT IN JUST ONE CALL**. Practically, very few exchanges will tolerate or allow that.

To fetch historical trades, the user will need to traverse the data in portions or "pages" of objects. Pagination often implies *"fetching portions of data one by one"* in a loop.

In most cases users are **required to use at least some type of pagination** in order to get the expected results consistently.

On the other hand, **some exchanges don't support pagination for public trades at all**. In general the exchanges will provide just the most recent trades.

The `fetchTrades ()` / `fetch_trades()` method also accepts an optional `params` (assoc-key array/dict, empty by default) as its fourth argument. You can use it to pass extra params to method calls or to override a particular default value (where supported by the exchange). See the API docs for your exchange for more details.

```
UNDER CONSTRUCTION
```

# Trading

In order to be able to access your user account, perform algorithmic trading by placing market and limit orders, query balances, deposit and withdraw funds and so on, you need to obtain your API keys for authentication from each exchange you want to trade with. They usually have it available on a separate tab or page within your user account settings. API keys are exchange-specific and cannnot be interchanged under any circumstances.

## Authentication

Authentication with all exchanges is handled automatically if provided with proper API keys. The process of authentication usually goes through the following pattern:

1. Generate new nonce. A nonce is an integer, often a Unix Timestamp in seconds or milliseconds (since epoch January 1, 1970). The nonce should be unique to a particular request and constantly increasing, so that no two requests share the same nonce. Each next request should have greater nonce than the previous request. **The default nonce is a 32-bit Unix Timestamp in seconds.**
2. Append public apiKey and nonce to other endpoint params, if any, then serialize the whole thing for signing.
3. Sign the serialized params using HMAC-SHA256/384/512 or MD5 with your secret key.
4. Append the signature in Hex or Base64 and nonce to HTTP headers or body.

This process may differ from exchange to exchange. Some exchanges may want the signature in a different encoding, some of them vary in header and body param names and formats, but the general pattern is the same for all of them.

**You should not share the same API keypair across multiple instances of an exchange running simultaneously, in separate scripts or in multiple threads. Using the same keypair from different instances simultaneously may cause all sorts of unexpected behaviour.**

The authentication is already handled for you, so you don't need to perform any of those steps manually unless you are implementing a new exchange class. The only thing you need for trading is the actual API key pair.

## API Keys Setup

The API credentials usually include the following:

- `apiKey`. This is your public API Key and/or Token. This part is *non-secret*, it is included in your request header or body and sent over HTTPS in open text to identify your request. It is often a string in Hex or Base64 encoding or an UUID identifier.
- `secret`. This is your private key. Keep it secret, don't tell it to anybody. It is used to sign your requests locally before sending them to exchanges. The secret key does not get sent over the internet in the request-response process and should not be published or emailed. It is used together with the nonce to generate a cryptographically strong signature. That signature is sent with your public key to authenticate your identity. Each request has a unique nonce and therefore a unique cryptographic signature.
- `uid`. Some exchanges (not all of them) also generate a user id or *uid* for short. It can be a string or numeric literal. You should set it, if that is explicitly required by your exchange. See [their docs](https://github.com/ccxt/ccxt/wiki/Manual#exchanges) for details.
- `password`. Some exchanges (not all of them) also require your password/phrase for trading. You should set this string, if that is explicitly required by your exchange. See [their docs](https://github.com/ccxt/ccxt/wiki/Manual#exchanges) for details.

In order to create API keys find the API tab or button in your user settings on the exchange website. Then create your keys and copy-paste them to your config file. Your config file permissions should be set appropriately, unreadable to anyone except the owner.

**Remember to keep your apiKey and secret key safe from unauthorized use, do not send or tell it to anybody. A leak of the secret key or a breach in security can cost you a fund loss.**

To set up an exchange for trading just assign the API credentials to an existing exchange instance or pass them to exchange constructor upon instantiation, like so:

```JavaScript
// JavaScript

const ccxt = require ('ccxt')

// any time
let kraken = new ccxt.kraken ()
kraken.apiKey = 'YOUR_KRAKEN_API_KEY'
kraken.secret = 'YOUR_KRAKEN_SECRET_KEY'

// upon instantiation
let okcoinusd = new ccxt.okcoinusd ({
    apiKey: 'YOUR_OKCOIN_API_KEY',
    secret: 'YOUR_OKCOIN_SECRET_KEY',
})

// from variable id
const exchangeId = 'binance'
    , exchangeClass = ccxt[exchangeId]
    , exchange = new exchangeClass ({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        'timeout': 30000,
        'enableRateLimit': true,
    })
```

```Python
# Python

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
    'timeout': 30000,
    'enableRateLimit': True,
})
```

```PHP
// PHP

include 'ccxt.php'

// any time
$quoinex = new \ccxt\quoinex ();
$quoinex->apiKey = 'YOUR_QUOINE_API_KEY';
$quoinex->secret = 'YOUR_QUOINE_SECRET_KEY';

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
    'timeout' => 30000,
    'enableRateLimit' => true,
));
```

Note that your private requests will fail with an exception or error if you don't set up your API credentials before you start trading. To avoid character escaping **always write your credentials in single quotes**, not double quotes (`'VERY_GOOD'`, `"VERY_BAD"`).

## Querying Account Balance

To query for balance and get the amount of funds available for trading or funds locked in orders, use the `fetchBalance` method:

```JavaScript
fetchBalance (params = {})
```

### Balance Structure

The returned balance structure is as follows:

```JavaScript
{
    'info':  { ... },    // the original untouched non-parsed reply with details

    //-------------------------------------------------------------------------
    // indexed by availability of funds first, then by currency

    'free':  {           // money, available for trading, by currency
        'BTC': 321.00,   // floats...
        'USD': 123.00,
        ...
    },

    'used':  { ... },    // money on hold, locked, frozen, or pending, by currency

    'total': { ... },    // total (free + used), by currency

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

Some exchanges may not return full balance info. Many exchanges do not return balances for your empty or unused accounts. In that case some currencies may be missing in returned balance structure.

```JavaScript
// JavaScript
(async () => {
    console.log (await exchange.fetchBalance ())
}) ()
```

```Python
# Python
print (exchange.fetch_balance ())
```

```PHP
// PHP
var_dump ($exchange->fetch_balance ());
```

### Balance inference

Some exchanges do not return the full set of balance information from their API. Those will only return just the `free` or just the `total` funds, i.e. funds `used` on orders unknown. In such cases ccxt will try to obtain the missing data from [.orders cache](#orders-cache) and will guess complete balance info from what is known for sure. However, in rare cases the available info may not be enough to deduce the missing part, thus, **the user shoud be aware of the possibility of not getting complete balance info from less sophisticated exchanges**.

## Orders

```diff
- this part of the unified API is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

### Querying Orders

Most of the time you can query orders by an id or by a symbol, though not all exchanges offer a full and flexible set of endpoints for querying orders. Some exchanges might not have a method for fetching recently closed orders, the other can lack a method for getting an order by id, etc. The ccxt library will target those cases by making workarounds where possible.

The list of methods for querying orders consists of the following:

- `fetchOrder (id, symbol = undefined, params = {})`
- `fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`
- `fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`
- `fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {})`

Note that the naming of those methods indicates if the method returns a single order or multiple orders (an array/list of orders). The `fetchOrder()` method requires a mandatory order id argument (a string). Some exchanges also require a symbol to fetch an order by id, where order ids can intersect with various trading pairs. Also, note that all other methods above return an array (a list) of orders. Most of them will require a symbol argument as well, however, some exchanges allow querying with a symbol unspecified (meaning *all symbols*).

The library will throw a NotSupported exception if a user calls a method that is not available from the exchange or is not implemented in ccxt.

To check if any of the above methods are available, look into the `.has` property of the exchange:

```JavaScript
// JavaScript
'use strict';

const ccxt = require ('ccxt')
const id = 'poloniex'
exchange = new ccxt[id] ()
console.log (exchange.has)
```

```Python
# Python
import ccxt
id = 'cryptopia'
exchange = getattr(ccxt, id) ()
print(exchange.has)
```

```PHP
// PHP
$exchange = new \ccxt\liqui ();
print_r ($exchange->has); // or var_dump
```

A typical structure of the `.has` property usually contains the following flags corresponding to order API methods for querying orders:

```JavaScript
exchange.has = {

    // ... other flags ...

    'fetchOrder': true, // available from the exchange directly and implemented in ccxt
    'fetchOrders': false, // not available from the exchange or not implemented in ccxt
    'fetchOpenOrders': true,
    'fetchClosedOrders': 'emulated', // not available from the exchange, but emulated in ccxt

    // ... other flags ...

}
```

The meanings of boolean `true` and `false` are obvious. A string value of `emulated` means that particular method is missing in the exchange API and ccxt will workaround that where possible by adding a caching layer, the `.orders` cache. The next section describes the inner workings of the `.orders` cache, one has to understand it to do order management with ccxt effectively.

#### Querying Multiple Orders And Trades

All methods returning lists of trades and lists of orders, accept the second `since` argument and the third `limit` argument:

- `fetchTrades` (public)
- `fetchMyTrades` (private)
- `fetchOrders`
- `fetchOpenOrders`
- `fetchClosedOrders`

The second  argument `since` reduces the array by timestamp, the third `limit` argument reduces by number (count) of returned items.

If the user does not specify `since`, the `fetchTrades/fetchOrders` method will return the default set from the exchange. The default set is exchange-specific, some exchanges will return trades or recent orders starting from the date of listing a pair on the exchange, other exchanges will return a reduced set of trades or orders (like, last 24 hours, last 100 trades, first 100 orders, etc). If the user wants precise control over the timeframe, the user is responsible for specifying the `since` argument.

**NOTE: not all exchanges provide means for filtering the lists of trades and orders by starting time, so, the support for `since ` and `limit` is exchange-specific. However, most exchanges do provide at least some alternative for "pagination" and "scrolling" which can be overrided with extra `params` argument.**


#### `.orders` cache

Some exchanges do not have a method for fetching closed orders or all orders. They will offer just the `fetchOpenOrders` endpoint, sometimes they are also generous to offer a `fetchOrder` endpoint as well. This means that they don't have any methods for fetching the order history. The ccxt library will try to emulate the order history for the user by keeping the cached .orders property containing all orders issued within a particular exchange class instance.

Whenever a user creates a new order or cancels an existing open order or does some other action that would alter the order status, the ccxt library will remember the entire order info in its cache. Upon a subsequent call to an emulated `fetchOrder`, `fetchOrders` or `fetchClosedOrders` method, the exchange instance will send a single request to **`fetchOpenOrders`** and will compare currently fetched open orders with the orders stored in cache previously. The ccxt library will check each cached order and will try to match it with a corresponding fetched open order. When the cached order isn't present in the open orders fetched from the exchange anymore, the library marks the cached order as `closed` (filled). The call to a `fetchOrder`, `fetchOrders`, `fetchClosedOrders` will then return the updated orders from `.orders` cache to the user.

The same logic can be put shortly: *if a cached order is not found in fetched open orders it isn't open anymore, therefore, closed*. This makes the library capable of tracking the order status and order history even with exchanges that don't have that functionality in their API natively. This is true for all methods that query orders or manipulate (place, cancel or edit) orders in any way.

In most cases the `.orders` cache will work transparently for the user. Most often the exchanges themselves have a sufficient set of methods. However, with some exchanges not having a complete API, the `.orders` cache has the following known limitations:

- If the user does not save the `.orders` cache between program runs and does not restore it upon launching a new run, the `.orders` cache will be lost, for obvious reasons. Therefore upon a call to fetchClosedOrders later on a different run, the exchange instance will return an empty list of orders. Without a properly restored cache a fresh new instance of the exchange won't be able to know anything about the orders that were closed and canceled (no history of orders).
- If the API keypair is shared across multiple exchange instances (e.g. when the user accesses the same exchange account in a multithreaded environment or in simultaneously launched separate scripts). Each particular instance would not be able to know anything about the orders created or canceled by other instances. This means that the order cache is not shared, and, in general, the same API keypair should not be shared across multiple instances accessing the private API. Otherwise it will cause side-effects with nonces and cached data falling out of sync.
- If the order was placed or canceled from outside of ccxt (on the exchange's website or by other means), the new order status won't arrive to the cache and ccxt won't be able to return it properly later.
- If an order's cancelation request bypasses ccxt then the library will not be able to find the order in the list of open orders returned from a subsequent call to `fetchOpenOrders()`. Thus the library will mark the cached order with a `'closed'` status.
- When `fetchOrder(id)` is emulated, the library will not be able to return a specific order, if it was not cached previously or if a change of the order' status was done bypassing ccxt. In that case the library will throw an `OrderNotFound` exception.
- If an unhandled error leads to a crash of the application and the `.orders` cache isn't saved and restored upon restart, the cache will be lost. Handling the exceptions properly is the responsibility of the user. One has to pay **extra care** when implementing proper [error handling](#error-handling), otherwise the `.orders` cache may fall out of sync.

*Note: the order cache functionality is to be reworked soon to obtain the order statuses from private trades history, where available. This is a work in progress, aimed at adding full-featured support for order fees, costs and other info. More about it here: https://github.com/ccxt/ccxt/issues/569*.

#### Purging Cached Orders

With some long-running instances it might be critical to free up used resources when they aren't needed anymore. Because in active trading the `.orders` cache can grow pretty big, the ccxt library offers the `purgeCachedOrders/purge_cached_orders` method for clearing old non-open orders from cache where `(order['timestamp'] < before) && (order['status'] != 'open')` and freeing used memory for other purposes. The purging method accepts one single argument named `before`:

```JavaScript
// JavaScript

// keep last 24 hours of history in cache
before = exchange.milliseconds () - 24 * 60 * 60 * 1000

// purge all closed and canceled orders "older" or issued "before" that time
exchange.purgeCachedOrders (before)
```

```Python
# Python

# keep last hour of history in cache
before = exchange.milliseconds () - 1 * 60 * 60 * 1000

# purge all closed and canceled orders "older" or issued "before" that time
exchange.purge_cached_orders (before)
```

```PHP
// PHP

// keep last 24 hours of history in cache
$before = $exchange->milliseconds () - 24 * 60 * 60 * 1000;

// purge all closed and canceled orders "older" or issued "before" that time
$exchange->purge_cached_orders ($before);

```

#### By Order Id

To get the details of a particular order by its id, use the fetchOrder / fetch_order method. Some exchanges also require a symbol even when fetching a particular order by id.

The signature of the fetchOrder/fetch_order method is as follows:

```JavaScript
if (exchange.has['fetchOrder']) {
    //  you can use the params argument for custom overrides
    let order = await exchange.fetchOrder (id, symbol = undefined, params = {})
}
```

**Some exchanges don't have an endpoint for fetching an order by id, ccxt will emulate it where possible.** For now it may still be missing here and there, as this is a work in progress.

You can pass custom overrided key-values in the additional params argument to supply a specific order type, or some other setting if needed.

Below are examples of using the fetchOrder method to get order info from an authenticated exchange instance:

```JavaScript
// JavaScript
(async function () {
    const order = await exchange.fetchOrder (id)
    console.log (order)
}) ()
```

```Python
# Python 2/3 (synchronous)
if exchange.has['fetchOrder']:
    order = exchange.fetch_order(id)
    print(order)

# Python 3.5+ asyncio (asynchronous)
import asyncio
import ccxt.async_support as ccxt
if exchange.has['fetchOrder']:
    order = asyncio.get_event_loop().run_until_complete(exchange.fetch_order(id))
    print(order)
```

```PHP
// PHP
if ($exchange->has['fetchOrder']) {
    $order = $exchange->fetch_order ($id);
    var_dump ($order);
}
```

#### All Orders

```JavaScript
if (exchange.has['fetchOrders'])
    exchange.fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {})
```

**Some exchanges don't have an endpoint for fetching all orders, ccxt will emulate it where possible.** For now it may still be missing here and there, as this is a work in progress.

#### Open Orders

```JavaScript
if (exchange.has['fetchOpenOrders'])
    exchange.fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {})
```

#### Closed Orders

Do not confuse *closed orders* with *trades* aka *fills* ! An order can be closed (filled) with multiple opposing trades! So, a *closed order* is not the same as a *trade*. In general, the order does not have a `fee` at all, but each particular user trade does have `fee`, `cost` and other properties. However, many exchanges propagate those properties to the orders as well.

**Some exchanges don't have an endpoint for fetching closed orders, ccxt will emulate it where possible.** For now it may still be missing here and there, as this is a work in progress.

```JavaScript
if (exchange.has['fetchClosedOrders'])
    exchange.fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {})
```

### Order Structure

Most of methods returning orders within ccxt unified API will usually yield an order structure as described below:

```JavaScript
{
    'id':                '12345-67890:09876/54321', // string
    'datetime':          '2017-08-17 12:42:48.000', // ISO8601 datetime of 'timestamp' with milliseconds
    'timestamp':          1502962946216, // order placing/opening Unix timestamp in milliseconds
    'lastTradeTimestamp': 1502962956216, // Unix timestamp of the most recent trade on this order
    'status':     'open',         // 'open', 'closed', 'canceled'
    'symbol':     'ETH/BTC',      // symbol
    'type':       'limit',        // 'market', 'limit'
    'side':       'buy',          // 'buy', 'sell'
    'price':       0.06917684,    // float price in quote currency
    'amount':      1.5,           // ordered amount of base currency
    'filled':      1.1,           // filled amount of base currency
    'remaining':   0.4,           // remaining amount to fill
    'cost':        0.076094524,   // 'filled' * 'price' (filling price used where available)
    'trades':    [ ... ],         // a list of order trades/executions
    'fee': {                      // fee info, if available
        'currency': 'BTC',        // which currency the fee is (usually quote)
        'cost': 0.0009,           // the fee amount in that currency
        'rate': 0.002,            // the fee rate (if available)
    },
    'info': { ... },              // the original unparsed order structure as is
}
```

- The work on `'fee'` info is still in progress, fee info may be missing partially or entirely, depending on the exchange capabilities.
- The `fee` currency may be different from both traded currencies (for example, an ETH/BTC order with fees in USD).
- The `lastTradeTimestamp` timestamp may have no value and may be `undefined/None/null` where not supported by the exchange or in case of an open order (an order that has not been filled nor partially filled yet).
- The `lastTradeTimestamp`, if any, designates the timestamp of the last trade, in case the order is filled fully or partially, otherwise `lastTradeTimestamp` is `undefined/None/null`.
- Order `status` prevails or has precedence over the `lastTradeTimestamp`.
- The `cost` of an order is: `{ filled * price }`
- The `cost` of an order means the total *quote* volume of the order (whereas the `amount` is the *base* volume). The value of `cost` should be as close to the actual most recent known order cost as possible. The `cost` field itself is there mostly for convenience and can be deduced from other fields.

### Placing Orders

To place an order you will need the following information:

- `symbol`, a string literal symbol of the market you wish to trade on, like `BTC/USD`, `ZEC/ETH`, `DOGE/DASH`, etc... Make sure the symbol in question exists with the target exchange and is available for trading.
- `side`, a string literal for the direction of your order, `buy` or `sell`. When you place a buy order you give quote currency and receive base currency. For example, buying `BTC/USD` means that you will receive bitcoins for your dollars. When you are selling `BTC/USD` the outcome is the opposite and you receive dollars for your bitcoins.
- `type`, a string literal type of order, **ccxt currently unifies `market` and `limit` orders only**, see https://github.com/ccxt/ccxt/wiki/Manual#custom-order-params and https://github.com/ccxt/ccxt/wiki/Manual#other-order-types
- `amount`, how much of currency you want to trade. This usually refers to base currency of the trading pair symbol, though some exchanges require the amount in quote currency and a few of them require base or quote amount depending on the side of the order. See their API docs for details.
- `price`, how much quote currency you are willing to pay for a trade lot of base currency (for limit orders only)

A successful call to a unified method for placing market or limit orders returns the following structure:

```JavaScript
{
    'id': 'string',  // order id
    'info': { ... }, // decoded original JSON response from the exchange as is
}
```

- **Some exchanges will allow to trade with limit orders only.** See [their docs](https://github.com/ccxt/ccxt/wiki/Manual#exchanges) for details.

#### Market Orders

Market price orders are also known as *spot price orders*, *instant orders* or simply *market orders*. A market order gets executed immediately. The matching engine of the exchange closes the order (fulfills it) with one or more transactions from the top of the order book stack.

The exchange will close your market order for the best price available. You are not guaranteed though, that the order will be executed for the price you observe prior to placing your order. There can be a slight change of the price for the traded market while your order is being executed, also known as *price slippage*. The price can slip because of networking roundtrip latency, high loads on the exchange, price volatility and other factors. When placing a market order you don't need to specify the price of the order.

```
// camelCaseNotation
exchange.createMarketSellOrder (symbol, amount[, params])
exchange.createMarketBuyOrder (symbol, amount[, params])

// underscore_notation
exchange.create_market_sell_order (symbol, amount[, params])
exchange.create_market_buy_order (symbol, amount[, params])

// using general createOrder, type = 'market' and side = 'buy' or 'sell'
exchange.createOrder (symbol, 'market', 'sell', amount, ...)
exchange.create_order (symbol, 'market', 'buy', amount, ...)
```

**Note, that some exchanges will not accept market orders (they allow limit orders only).** In order to detect programmatically if the exchange in question does support market orders or not, you can use the `.has['createMarketOrder']` exchange property:

```JavaScript
// JavaScript
if (exchange.has['createMarketOrder']) {
    ...
}
```

```Python
# Python
if exchange.has['createMarketOrder']:
    ...
```

```PHP
// PHP
if ($exchange->has['createMarketOrder']) {
    ...
}
```

##### Market Buys

In general, when placing a `market buy` or `market sell` order the user has to specify just the amount of the base currency to buy or sell. However, with some exchanges market buy orders implement a different approach to calculating the value of the order.

Suppose you're trading BTC/USD and the current market price for BTC is over 9000 USD. For a market buy or market sell you could specify an `amount` of 2 BTC and that would result in _plus or minus_ 18000 USD (more or less ;)) on your account, depending on the side of the order.

**With market buys some exchanges require the total cost of the order in the quote currency!** The logic behind it is simple, instead of taking the amount of base currency to buy or sell some exchanges operate with _"how much quote currency you want to spend on buying in total"_.

To place a market buy order with those exchanges you would not specify an amount of 2 BTC, instead you should somehow specify the total cost of the order, that is, 18000 USD in this example. The exchanges that treat `market buy` orders in this way have an exchange-specific option `createMarketBuyOrderRequiresPrice` that allows specifying the total cost of a `market buy` order in two ways.

The first is the default and if you specify the `price` along with the `amount` the total cost of the order would be calculated inside the lib from those two values with a simple multiplication (`cost = amount * price`). The resulting `cost` would be the amount in USD quote currency that will be spent on this particular market buy order.

```JavaScript
// this example is oversimplified and doesn't show all the code that is
// required to handle the errors and exchange metadata properly
// it shows just the concept of placing a market buy order

const exchange = new ccxt.cex ({
    'apiKey': YOUR_API_KEY,
    'secret': 'YOUR_SECRET',
    'enableRateLimit': true,
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
})
```

The second alternative is useful in cases when the user wants to calculate and specify the resulting total cost of the order himself. That can be done by setting the `createMarketBuyOrderRequiresPrice` option to `false` to switch it off:

```JavaScript
const exchange = new ccxt.cex ({
    'apiKey': YOUR_API_KEY,
    'secret': 'YOUR_SECRET',
    'enableRateLimit': true,
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
})
```

More about it:

- https://github.com/ccxt/ccxt/issues/564#issuecomment-347458566
- https://github.com/ccxt/ccxt/issues/4914#issuecomment-478199357
- https://github.com/ccxt/ccxt/issues/4799#issuecomment-470966769
- https://github.com/ccxt/ccxt/issues/5197#issuecomment-496270785

##### Emulating Market Orders With Limit Orders

It is also possible to emulate a `market` order with a `limit` order.

**WARNING this method can be risky due to high volatility, use it at your own risk and only use it when you know really well what you're doing!**

Most of the time a `market sell` can be emulated with a `limit sell` at a very low price – the exchange will automatically make it a taker order for market price (the price that is currently in your best interest from the ones that are available in the order book). When the exchange detects that you're selling for a very low price it will automatically offer you the best buyer price available from the order book. That is effectively the same as placing a market sell order. Thus market orders can be emulated with limit orders (where missing).

The opposite is also true – a `market buy` can be emulated with a `limit buy` for a very high price. Most exchanges will again close your order for best available price, that is, the market price.

However, you should never rely on that entirely, **ALWAYS test it with a small amount first!** You can try that in their web interface first to verify the logic. You can sell the minimal amount at a specified limit price (an affordable amount to lose, just in case) and then check the actual filling price in trade history.

#### Limit Orders

Limit price orders are also known as *limit orders*. Some exchanges accept limit orders only. Limit orders require a price (rate per unit) to be submitted with the order. The exchange will close limit orders if and only if market price reaches the desired level.

```
// camelCaseStyle
exchange.createLimitBuyOrder (symbol, amount, price[, params])
exchange.createLimitSellOrder (symbol, amount, price[, params])

// underscore_style
exchange.create_limit_buy_order (symbol, amount, price[, params])
exchange.create_limit_sell_order (symbol, amount, price[, params])
```

#### Custom Order Params

Some exchanges allow you to specify optional parameters for your order. You can pass your optional parameters and override your query with an associative array using the `params` argument to your unified API call. All custom params are exchange-specific, of course, and aren't interchangeable, do not expect those custom params for one exchange to work with another exchange.

```JavaScript
// JavaScript
// use a custom order type
bitfinex.createLimitSellOrder ('BTC/USD', 1, 10, { 'type': 'trailing-stop' })
```

```Python
# Python
# add a custom order flag
kraken.create_market_buy_order('BTC/USD', 1, {'trading_agreement': 'agree'})
```

```PHP
// PHP
// add custom user id to your order
$hitbtc->create_order ('BTC/USD', 'limit', 'buy', 1, 3000, array ('clientOrderId' => '123'));
```

#### Other Order Types

The `type` can be either `limit` or `market`, if you want a `stopLimit` type, use params overrides, as described here: https://github.com/ccxt/ccxt/wiki/Manual#overriding-unified-api-params.

The following is a generic example for overriding the order type, however, you must read the docs for the exchange in question in order to specify proper arguments and values. Order types other than `limit` or `market` are currently not unified, therefore for other order types one has to override the unified params as shown below.

```JavaScript
const symbol = 'ETH/BTC'
const type = 'limit' // or 'market', other types aren't unified yet
const side = 'sell'
const amount = 123.45 // your amount
const price = 54.321 // your price
// overrides
const params = {
    'stopPrice': 123.45, // your stop price
    'type': 'stopLimit',
}
const order = await exchange.createOrder (symbol, type, side, amount, price, params)
```

```Python
symbol = 'ETH/BTC'
type = 'limit'  # or 'market', other types aren't unified yet
side = 'sell'
amount = 123.45  # your amount
price = 54.321  # your price
# overrides
params = {
    'stopPrice': 123.45,  # your stop price
    'type': 'stopLimit',
}
order = exchange.create_order(symbol, type, side, amount, price, params)
```

```PHP
$symbol = 'ETH/BTC';
$type = 'limit'; // or 'market', other types aren't unified yet
$side = 'sell';
$amount = 123.45; // your amount
$price = 54.321; // your price
// overrides
$params = {
    'stopPrice': 123.45, // your stop price
    'type': 'stopLimit',
}
$order = $exchange->create_order ($symbol, $type, $side, $amount, $price, $params);
```

### Canceling Orders

To cancel an existing order pass the order id to `cancelOrder (id, symbol, params) / cancel_order (id, symbol, params)` method. Note, that some exchanges require a second symbol parameter even to cancel a known order by id. The usage is shown in the following examples:

```JavaScript
// JavaScript
exchange.cancelOrder ('1234567890') // replace with your order id here (a string)
```

```Python
# Python
exchange.cancel_order ('1234567890') # replace with your order id here (a string)
```

```PHP
// PHP
$exchange->cancel_order ('1234567890'); // replace with your order id here (a string)
```

#### Exceptions on order canceling

The `cancelOrder()` is usually used on open orders only. However, it may happen that your order gets executed (filled and closed)
before your cancel-request comes in, so a cancel-request might hit an already-closed order.

A cancel-request might also throw a `NetworkError` indicating that the order might or might not have been canceled successfully and whether you need to retry or not. Consecutive calls to `cancelOrder()` may hit an already canceled order as well.

As such, `cancelOrder()` can throw an `OrderNotFound` exception in these cases:
- canceling an already-closed order
- canceling an already-canceled order

## Personal Trades

```
- this part of the unified API is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

### How Orders Are Related To Trades

A trade is also often called `a fill`. Each trade is a result of order execution. Note, that orders and trades have a one-to-many relationship: an execution of one order may result in several trades. However, when one order matches another opposing order, the pair of two matching orders yields one trade. Thus, when an order matches multiple opposing orders, this yields multiple trades, one trade per each pair of matched orders.

To put it shortly, an order can contain *one or more* trades. Or, in other words, an order can be *filled* with one or more trades.

For example, an orderbook can have the following orders (whatever trading symbol or pair it is):

```
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

All specific numbers above aren't real, this is just to illustrate the way orders and trades are related in general.

A seller decides to place a sell limit order on the ask side for a price of 0.700 and an amount of 150.

```
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

As the price and amount of the incoming sell (ask) order cover more than one bid order (orders `b` and `i`), the following sequence of events usually happens within an exchange engine very quickly, but not immediately:

1. Order `b` is matched against the incoming sell because their prices intersect. Their volumes *"mutually annihilate"* each other, so, the bidder gets 100 for a price of 0.800. The seller (asker) will have his sell order partially filled by bid volume 100 for a price of 0.800. Note that for the filled part of the order the seller gets a better price than he asked for initially. He asked for 0.7 at least but got 0.8 instead which is even better for the seller. Most conventional exchanges fill orders for the best price available.

2. A trade is generated for the order `b` against the incoming sell order. That trade *"fills"* the entire order `b` and most of the sell order. One trade is generated per each pair of matched orders, whether the amount was filled completely or partially. In this example the seller amount (100) fills order `b` completely (closes the order `b`) and also fills the selling order partially (leaves it open in the orderbook).

3. Order `b` now has a status of `closed` and a filled volume of 100. It contains one trade against the selling order. The selling order has an `open` status and a filled volume of 100. It contains one trade against order `b`. Thus each order has just one fill-trade so far.

4. The incoming sell order has a filled amount of 100 and has yet to fill the remaining amount of 50 from its initial amount of 150 in total.

The intermediate state of the orderbook is now (order `b` is `closed` and is not in the orderbook anymore):

```
    | price  | amount
----|----------------  ↓
  a |  1.200 | 200     ↓
  s |  1.100 | 300     ↓
  k |  0.900 | 100     ↓
----|----------------  ↓ sell remaining 50 for 0.700
  i |  0.700 | 200     -----------------------------
  d |  0.500 | 100
```

5. Order `i` is matched against the remaining part of incoming sell, because their prices intersect. The amount of buying order `i` which is 200 completely annihilates the remaining sell amount of 50. The order `i` is filled partially by 50, but the rest of its volume, namely the remaining amount of 150 will stay in the orderbook. The selling order, however, is fulfilled completely by this second match.

6. A trade is generated for the order `i` against the incoming sell order. That trade partially fills order `i`. And completes the filling of the sell order. Again, this is just one trade for a pair of matched orders.

7. Order `i` now has a status of `open`, a filled amount of 50, and a remaining amount of 150. It contains one filling trade against the selling order. The selling order has a `closed` status now and it has completely filled its total initial amount of 150. However, it contains two trades, the first against order `b` and the second against order `i`. Thus each order can have one or more filling trades, depending on how their volumes were matched by the exchange engine.

After the above sequence takes place, the updated orderbook will look like this.

```
    | price  | amount
----|----------------
  a |  1.200 | 200
  s |  1.100 | 300
  k |  0.900 | 100
----|----------------
  i |  0.700 | 150
  d |  0.500 | 100
```

Notice that the order `b` has disappeared, the selling order also isn't there. All closed and fully-filled orders disappear from the orderbook. The order `i` which was filled partially and still has a remaining volume and an `open` status, is still there.


### Personal Trades

Most of unified methods will return either a single object or a plain array (a list) of objects (trades). However, very few exchanges (if any at all) will return all trades at once. Most often their APIs `limit` output to a certain number of most recent objects. **YOU CANNOT GET ALL OBJECTS SINCE THE BEGINNING OF TIME TO THE PRESENT MOMENT IN JUST ONE CALL**. Practically, very few exchanges will tolerate or allow that.

To fetch historical trades, the user will need to traverse the data in portions or "pages" of objects. Pagination often implies *"fetching portions of data one by one"* in a loop.

In most cases users are **required to use at least some type of pagination** in order to get the expected results consistently.

```JavaScript
// JavaScript
// fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {})

if (exchange.has['fetchMyTrades']) {
    const trades = await exchange.fetchMyTrades (symbol, since, limit, params)
}
```

```Python
# Python
# fetch_my_trades (symbol = None, since = None, limit = None, params = {})

if exchange.has['fetchMyTrades']:
    exchange.fetch_my_trades (symbol = None, since = None, limit = None, params = {})
```

```PHP
// PHP
// fetch_my_trades ($symbol = null, $since = null, $limit = null, $params = array ())

if ($exchange->has['fetchMyTrades']) {
    $trades = $exchange->fetch_my_trades ($symbol, $since, $limit, $params);
}
```

Returns ordered array `[]` of trades (most recent trade last).

#### Trade structure

```JavaScript
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
    'cost':         0.10376526,                 // total cost (including fees), `price * amount`
    'fee':          {                           // provided by exchange or calculated by ccxt
        'cost':  0.0015,                        // float
        'currency': 'ETH',                      // usually base currency for buys, quote currency for sells
        'rate': 0.002,                          // the fee rate (if available)
    },
}
```

- The work on `'fee'` info is still in progress, fee info may be missing partially or entirely, depending on the exchange capabilities.
- The `fee` currency may be different from both traded currencies (for example, an ETH/BTC order with fees in USD).
- The `cost` of the trade means `amount * price`. It is the total *quote* volume of the trade (whereas `amount` is the *base* volume). The cost field itself is there mostly for convenience and can be deduced from other fields.

### Trades By Order Id

```UNDER CONSTRUCTION```

## Funding Your Account

```diff
- this part of the unified API is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

### Deposit

In order to deposit funds to an exchange you must get an address from the exchange for the currency you want to deposit there. Most of exchanges will create and manage those addresses for the user. Some exchanges will also allow the user to create new addresses for deposits. Some of exchanges require a new deposit address to be created for each new deposit.

The address for depositing can be either an already existing address that was created previously with the exchange or it can be created upon request. In order to see which of the two methods are supported, check the `exchange.has['fetchDepositAddress']` and `exchange.has['createDepositAddress']` properties. Both methods return an [address structure](#address-structure)

```JavaScript
fetchDepositAddress (code, params = {})
createDepositAddress (code, params = {})
```

- `code` is the unified currency code (uppercase string)
- `params` contains optional extra overrides

Some exchanges may also have a method for fetching multiple deposit addresses at once or all of them at once:

```JavaScript
fetchDepositAddresses (codes = undefined, params = {})
```

Depending on the exchange it may or may not require a list of unified currency `codes` in the first argument.
The `fetchDepositAddresses` method returns an array of address structures.

#### Address structure

The address structures returned from `fetchDepositAddress`, `fetchDepositAddresses` and `createDepositAddress` look like this:

```JavaScript
{
    'currency': currency, // currency code
    'address': address,   // address in terms of requested currency
    'tag': tag,           // tag / memo / paymentId for particular currencies (XRP, XMR, ...)
    'info': response,     // raw unparsed data as returned from the exchange
}
```

With certain currencies, like AEON, BTS, GXS, NXT, SBD, STEEM, STR, XEM, XLM, XMR, XRP, an additional argument `tag` is usually required by exchanges. Other currencies will have the `tag` set to `undefined / None / null`. The tag is a memo or a message or a payment id that is attached to a withdrawal transaction. The tag is mandatory for those currencies and it identifies the recipient user account.

Be careful when specifying the `tag` and the `address`. The `tag` is **NOT an arbitrary user-defined string** of your choice! You cannot send user messages and comments in the `tag`. The purpose of the `tag` field is to address your wallet properly, so it must be correct. You should only use the `tag` received from the exchange you're working with, otherwise your transaction might never arrive to its destination.

### Withdraw

```JavaScript
// JavaScript
exchange.withdraw (code, amount, address, tag = undefined, params = {})
```

```Python
# Python
exchange.withdraw(code, amount, address, tag=None, params={})
```

```PHP
// PHP
$exchange->withdraw ($code, $amount, $address, $tag = null, $params = array ())
```

The `code` is the currency code (usually three or more uppercase letters, but can be different in some cases).

The withdraw method returns a dictionary containing the withdrawal id, which is usually the txid of the onchain transaction itself, or an internal *withdrawal request id* registered within the exchange. The returned value looks as follows:

```JavaScript
{
    'info' { ... },      // unparsed reply from the exchange, as is
    'id': '12345567890', // string withdrawal id, if any
}
```

Some exchanges require a manual approval of each withdrawal by means of 2FA (2-factor authentication). In order to approve your withdrawal you usually have to either click their secret link in your email inbox or enter a Google Authenticator code or an Authy code on their website to verify that withdrawal transaction was requested intentionally.

In some cases you can also use the withdrawal id to check withdrawal status later (whether it succeeded or not) and to submit 2FA confirmation codes, where this is supported by the exchange. See [their docs](https://github.com/ccxt/ccxt/wiki/Manual#exchanges) for details.

### Transactions

#### Transaction Structure

```JavaScript
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
    'type':     'deposit',   // or 'withdrawal', string
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

##### Notes On Transaction Structure

- `addressFrom` or `addressTo` may be `undefined/None/null`, if the exchange in question does not specify all sides of the transaction
- The semantics of the `address` field is exchange-specific. In some cases it can contain the address of the sender, in other cases it may contain the address of the receiver. The actual value depends on the exchange.
- The `updated` field is the UTC timestamp in milliseconds of the most recent change of status of that funding operation, be it `withdrawal` or `deposit`. It is necessary if you want to track your changes in time, beyond a static snapshot. For example, if the exchange in question reports `created_at` and `confirmed_at` for a transaction, then the `updated` field will take the value of `Math.max (created_at, confirmed_at)`, that is, the timestamp of the most recent change of the status.
- The `updated` field may be `undefined/None/null` in certain exchange-specific cases.
- The `fee` substructure may be missing, if not supplied within the reply coming from the exchange.
- The `comment` field may be `undefined/None/null`, otherwise it will contain a message or note defined by the user upon creating the transaction.
- Be careful when handling the `tag` and the `address`. The `tag` is **NOT an arbitrary user-defined string** of your choice! You cannot send user messages and comments in the `tag`. The purpose of the `tag` field is to address your wallet properly, so it must be correct. You should only use the `tag` received from the exchange you're working with, otherwise your transaction might never arrive to its destination.


#### Deposits

```JavaScript
// JavaScript
// fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {})

if (exchange.has['fetchDeposits']) {
    const deposits = await exchange.fetchDeposits (code, since, limit, params)
} else {
    throw new Error (exchange.id + ' does not have the fetchDeposits method')
}
```

```Python
# Python
# fetch_deposits(code = None, since = None, limit = None, params = {})

if exchange.has['fetchDeposits']:
    deposits = exchange.fetch_deposits(code, since, limit, params)
else:
    raise Exception (exchange.id + ' does not have the fetch_deposits method')
```

```PHP
// PHP
// fetch_deposits ($code = null, $since = null, $limit = null, $params = {})

if ($exchange->has['fetchDeposits']) {
    $deposits = $exchange->fetch_deposits ($code, $since, $limit, $params);
} else {
    throw new Exception ($exchange->id . ' does not have the fetch_deposits method');
}
```

#### Withdrawals

```JavaScript
// JavaScript
// fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {})

if (exchange.has['fetchWithdrawals']) {
    const withdrawals = await exchange.fetchWithdrawals (code, since, limit, params)
} else {
    throw new Error (exchange.id + ' does not have the fetchWithdrawals method')
}
```

```Python
# Python
# fetch_withdrawals(code = None, since = None, limit = None, params = {})

if exchange.has['fetchWithdrawals']:
    withdrawals = exchange.fetch_withdrawals(code, since, limit, params)
else:
    raise Exception (exchange.id + ' does not have the fetch_withdrawals method')
```

```PHP
// PHP
// fetch_withdrawals ($code = null, $since = null, $limit = null, $params = {})

if ($exchange->has['fetchWithdrawals']) {
    $withdrawals = $exchange->fetch_withdrawals ($code, $since, $limit, $params);
} else {
    throw new Exception ($exchange->id . ' does not have the fetch_withdrawals method');
}
```

#### All Transactions

```JavaScript
// JavaScript
// fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {})

if (exchange.has['fetchTransactions']) {
    const transactions = await exchange.fetchTransactions (code, since, limit, params)
} else {
    throw new Error (exchange.id + ' does not have the fetchTransactions method')
}
```

```Python
# Python
# fetch_transactions(code = None, since = None, limit = None, params = {})

if exchange.has['fetchTransactions']:
    transactions = exchange.fetch_transactions(code, since, limit, params)
else:
    raise Exception (exchange.id + ' does not have the fetch_transactions method')
```

```PHP
// PHP
// fetch_transactions ($code = null, $since = null, $limit = null, $params = {})

if ($exchange->has['fetchTransactions']) {
    $transactions = $exchange->fetch_transactions ($code, $since, $limit, $params);
} else {
    throw new Exception ($exchange->id . ' does not have the fetch_transactions method');
}
```
## Fees

**This section of the Unified CCXT API is under development.**

Fees are often grouped into two categories:

- Trading fees. Trading fee is the amount payable to the exchange, usually a percentage of volume traded (filled)).
- Funding fees. The amount payable to the exchange upon depositing and withdrawing as well as the underlying crypto transaction fees (tx fees).

Because the fee structure can depend on the actual volume of currencies traded by the user, the fees can be account-specific. Methods to work with account-specific fees:

```Javascript
fetchFees (params = {})
fetchTradingFees (params = {})
fetchFundingFees (params = {})
```

The fee methods will return a unified fee structure, which is often present with orders and trades as well. The fee structure is a common format for representing the fee info throughout the library. Fee structures are usually indexed by market or currency.

Because this is still a work in progress, some or all of methods and info described in this section may be missing with this or that exchange.

**DO NOT use the `.fees` property as most often it contains the predefined/hardcoded info, which is now deprecated. Actual fees should only be accessed from markets and currencies.**

### Fee Structure

```Javascript
{
    'type': takerOrMaker,
    'currency': 'BTC', // the unified fee currency code
    'rate': percentage, // the fee rate, 0.05% = 0.0005, 1% = 0.01, ...
    'cost': feePaid, // the fee cost (amount * fee rate)
}
```

### Exchange Status

The exchange status describes the latest known information on the availability of the exchange API. This information is either hardcoded into the exchange class or fetched live directly from the exchange API. The `fetchStatus(params = {})` method can be used to get this information. The status returned by `fetchStatus` is one of:

- Hardcoded into the exchange class, e.g. if the API has been broken or shutdown.
- Updated using the exchange ping or `fetchTime` endpoint to see if its alive
- Updated using the dedicated exchange API status endpoint.

```Javascript
fetchStatus(params = {})
 ```

#### Exchange Status Structure

The `fetchStatus()` method will return a status structure like shown below:

```Javascript
{
    'status': 'ok', // 'ok', 'shutdown', 'error', 'maintenance'
    'updated': undefined, // integer, last updated timestamp in milliseconds if updated via the API
    'eta': undefined, // when the maintenance or outage is expected to end
    'url': undefined, // a link to a GitHub issue or to an exchange post on the subject
}
```

The possible values in the `status` field are:

- `'ok'` means the exchange API is fully operational
- `'shutdown`' means the exchange was closed, and the `updated` field should contain the datetime of the shutdown
- `'error'` means that either the exchange API is broken, or the implementation of the exchange in CCXT is broken
- `'maintenance'` means regular maintenance, and the `eta` field should contain the datetime when the exchange is expected to be operational again

### Trading Fees

Trading fees are properties of markets. Most often trading fees are loaded into the markets by the `fetchMarkets` call. Sometimes, however, the exchanges serve fees from different endpoints.

The `calculateFee` method can be used to precalculate trading fees that will be paid. **WARNING! This method is experimental, unstable and may produce incorrect results in certain cases**. You should only use it with caution. Actual fees may be different from the values returned from `calculateFee`, this is just for precalculation.  Do not rely on precalculated values, because market conditions change frequently. It is difficult to know in advance whether your order will be a market taker or maker.

```Javascript
    calculateFee (symbol, type, side, amount, price, takerOrMaker = 'taker', params = {})
```

The `calculateFee` method will return a unified fee structure with precalculated fees for an order with specified params.

Accessing trading fee rates should be done via the `.markets` property, like so:

```Javascript
exchange.markets['ETH/BTC']['taker'] // taker fee rate for ETH/BTC
exchange.markets['BTC/USD']['maker'] // maker fee rate for BTC/USD
```

Maker fees are paid when you provide liquidity to the exchange i.e. you *market-make* an order and someone else fills it. Maker fees are usually lower than taker fees. Similarly, taker fees are paid when you *take* liquidity from the exchange and fill someone else's order.

### Funding Fees

Funding fees are properties of currencies (account balance).

Accessing funding fee rates should be done via the `.currencies` property. This aspect is not unified yet and is subject to change.

```Javascript
exchange.currencies['ETH']['fee'] // tx/withdrawal fee rate for ETH
exchange.currencies['BTC']['fee'] // tx/withdrawal fee rate for BTC
```

## Ledger

```UNDER CONSTRUCTION```

Some exchanges provide additional endpoints for fetching the all-in-one ledger history. The ledger is simply the history of changes, actions done by the user or operations that altered the user's balance in any way, that is, the history of movements of all funds from/to all accounts of the user. That includes deposits and withdrawals (funding), amounts incoming and outcoming in result of a trade or an order, trading fees, transfers between accounts, rebates, cashbacks and other types of events that are subject to accounting.

```JavaScript
async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {})
```

Some exchanges don't allow to fetch all ledger entries for all assets at once, those require the `code` argument to be supplied to `fetchLedger` method.

### Ledger Entry Structure

```JavaScript
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
    'fee': {                                // object or or undefined
        'cost': 54.321,                     // absolute number on top of the amount
        'currency': 'ETH',                  // string, unified currency code, 'ETH', 'USDT'...
    },
    'info': { ... },                        // raw ledger entry as is from the exchange
}
```

### Notes on Ledger Entry Structure

The type of the ledger entry is the type of the operation associated with it. If the amount comes due to a sell order, then it is associated with a corresponding trade type ledger entry, and the referenceId will contain associated trade id (if the exchange in question provides it). If the amount comes out due to a withdrawal, then is is associated with a corresponding transaction.

- `trade`
- `transaction`
- `fee`
- `rebate`
- `cashback`
- `referral`
- `transfer`
- `whatever`
- ...

The `referenceId` field holds the id of the corresponding event that was registered by adding a new item to the ledger.

The `status` field is there to support for exchanges that include pending and canceled changes in the ledger. The ledger naturally represents the actual changes that have taken place, therefore the status is `'ok'` in most cases.

The ledger entry type can be associated with a regular trade or a funding transaction (deposit or withdrawal) or an internal `transfer` between two accounts of the same user. If the ledger entry is associated with an internal transfer, the `account` field will contain the id of the account that is being altered with the ledger entry in question. The `referenceAccount` field will contain the id of the opposite account the funds are transferred to/from, depending on the `direction` (`'in'` or `'out'`).

## Overriding The Nonce

**The default nonce is a 32-bit Unix Timestamp in seconds. You should override it with a milliseconds-nonce if you want to make private requests more frequently than once per second! Most exchanges will throttle your requests if you hit their rate limits, read [API docs for your exchange](https://github.com/ccxt/ccxt/wiki/Exchanges) carefully!**

In case you need to reset the nonce it is much easier to create another pair of keys for using with private APIs. Creating new keys and setting up a fresh unused keypair in your config is usually enough for that.

In some cases you are unable to create new keys due to lack of permissions or whatever. If that happens you can still override the nonce. Base market class has the following methods for convenience:

- `seconds ()`: returns a Unix Timestamp in seconds.
- `milliseconds ()`: same in milliseconds (ms = 1000 * s, thousandths of a second).
- `microseconds ()`: same in microseconds (μs = 1000 * ms, millionths of a second).

There are exchanges that confuse milliseconds with microseconds in their API docs, let's all forgive them for that, folks. You can use methods listed above to override the nonce value. If you need to use the same keypair from multiple instances simultaneously use closures or a common function to avoid nonce conflicts. In Javascript you can override the nonce by providing a `nonce` parameter to the exchange constructor or by setting it explicitly on exchange object:

```JavaScript
// JavaScript

// A: custom nonce redefined in constructor parameters
let nonce = 1
let kraken1 = new ccxt.kraken ({ nonce: () => nonce++ })

// B: nonce redefined explicitly
let kraken2 = new ccxt.kraken ()
kraken2.nonce = function () { return nonce++ } // uses same nonce as kraken1

// C: milliseconds nonce
let kraken3 = new ccxt.kraken ({
    nonce: function () { return this.milliseconds () },
})

// D: newer ES syntax
let kraken4 = new ccxt.kraken ({
    nonce () { return this.milliseconds () },
})
```

In Python and PHP you can do the same by subclassing and overriding nonce function of a particular exchange class:

```Python
# Python

# A: the shortest
gdax = ccxt.gdax({'nonce': ccxt.Exchange.milliseconds})

# B: custom nonce
class MyKraken(ccxt.kraken):
    n = 1
    def nonce(self):
        return self.n += 1

# C: milliseconds nonce
class MyBitfinex(ccxt.bitfinex):
    def nonce(self):
        return self.milliseconds()

# D: milliseconds nonce inline
hitbtc = ccxt.hitbtc({
    'nonce': lambda: int(time.time() * 1000)
})

# E: milliseconds nonce
acx = ccxt.acx({'nonce': lambda: ccxt.Exchange.milliseconds()})
```

```PHP
// PHP

// A: custom nonce value
class MyOKCoinUSD extends \ccxt\okcoinusd {
    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array ('i' => 1), $options));
    }
    public function nonce () {
        return $this->i++;
    }
}

// B: milliseconds nonce
class MyZaif extends \ccxt\zaif {
    public function __construct ($options = array ()) {
        parent::__construct (array_merge (array ('i' => 1), $options));
    }
    public function nonce () {
        return $this->milliseconds ();
    }
}
```

# Error Handling

The error handling with CCXT is done with the exception mechanism that is natively available with all languages.

To handle the errors you should add a `try` block around the call to a unified method and catch the exceptions like you would normally do with your language:

```JavaScript
// JavaScript

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
        // ...
    } else if (e instanceof ccxt.ExchangeError) {
        console.log (exchange.id, 'fetchTicker failed due to exchange error:', e.message)
        // retry or whatever
        // ...
    } else {
        console.log (exchange.id, 'fetchTicker failed with:', e.message)
        // retry or whatever
        // ...
    }
}
```

```Python
# Python

# try to call a unified method
try:
    response = await exchange.fetch_order_book('ETH/BTC')
    print(response)
except ccxt.NetworkError as e:
    print(exchange.id, 'fetch_order_book failed due to a network error:', str(e))
    # retry or whatever
    # ...
except ccxt.ExchangeError as e:
    print(exchange.id, 'fetch_order_book failed due to exchange error:', str(e))
    # retry or whatever
    # ...
except Exception as e:
    print(exchange.id, 'fetch_order_book failed with:', str(e))
    # retry or whatever
    # ...
```

```PHP
// PHP

// try to call a unified method
try {
    $response = $exchange->fetch_trades('ETH/BTC');
    print_r($response);
} catch (\ccxt\NetworkError $e) {
    echo $exchange->id . ' fetch_trades failed due to a network error: ' . $e->getMessage () . "\n";
    // retry or whatever
    // ...
} catch (\ccxt\ExchangeError $e) {
    echo $exchange->id . ' fetch_trades failed due to exchange error: ' . $e->getMessage () . "\n";
    // retry or whatever
    // ...
} catch (Exception $e) {
    echo $exchange->id . ' fetch_trades failed with: ' . $e->getMessage () . "\n";
    // retry or whatever
    // ...
}
```

## Exception Hierarchy

All exceptions are derived from the base BaseError exception, which, in its turn, is defined in the ccxt library like so:

```JavaScript
// JavaScript
class BaseError extends Error {
    constructor () {
        super ()
        // a workaround to make `instanceof BaseError` work in ES5
        this.constructor = BaseError
        this.__proto__   = BaseError.prototype
    }
}
```

```Python
# Python
class BaseError (Exception):
    pass
```

```PHP
// PHP
class BaseError extends \Exception {}
```

Below is an outline of exception inheritance hierarchy:

```
+ BaseError
|
+---+ ExchangeError
|   |
|   +---+ AuthenticationError
|   |   |
|   |   +---+ PermissionDenied
|   |   |
|   |   +---+ AccountSuspended
|   |
|   +---+ ArgumentsRequired
|   |
|   +---+ BadRequest
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
+---+ NetworkError (recoverable)
    |
    +---+ DDoSProtection
    |
    +---+ ExchangeNotAvailable
    |
    +---+ InvalidNonce
    |
    +---+ RequestTimeout
```

The `BaseError` class is a generic error class for all sorts of errors, including accessibility and request/response mismatch. Users should catch this exception at the very least, if no error differentiation is required.

## ExchangeError

This exception is thrown when an exchange server replies with an error in JSON. Possible reasons:

  - endpoint is switched off by the exchange
  - symbol not found on the exchange
  - required parameter is missing
  - the format of parameters is incorrect
  - an exchange replies with an unclear answer

Other exceptions derived from `ExchangeError`:

  - `NotSupported`: This exception is raised if the endpoint is not offered/not supported by the exchange API.
  - `AuthenticationError`: Raised when an exchange requires one of the API credentials that you've missed to specify, or when there's a mistake in the keypair or an outdated nonce. Most of the time you need `apiKey` and `secret`, sometimes you also need `uid` and/or `password`.
  - `PermissionDenied`: Raised when there's no access for specified action or insufficient permissions on the specified `apiKey`.
  - `InsufficientFunds`: This exception is raised when you don't have enough currency on your account balance to place an order.
  - `InvalidAddress`: This exception is raised upon encountering a bad funding address or a funding address shorter than `.minFundingAddressLength` (10 characters by default) in a call to `fetchDepositAddress`, `createDepositAddress` or `withdraw`.
  - `InvalidOrder`: This exception is the base class for all exceptions related to the unified order API.
  - `OrderNotFound`: Raised when you are trying to fetch or cancel a non-existent order.

## NetworkError

All errors related to networking are usually recoverable, meaning that networking problems, traffic congestion, unavailability is usually time-dependent. Making a retry later is usually enough to recover from a NetworkError, but if it doesn't go away, then it may indicate some persistent problem with the exchange or with your connection.

### DDoSProtection

This exception is thrown in either of two cases:

- when Cloudflare or Incapsula rate limiter restrictions are enforced per user or region/location
- when the exchange restricts user access for requesting the endpoints in question too frequently

In addition to default error handling, the ccxt library does a case-insensitive search in the response received from the exchange for one of the following keywords:

  - `cloudflare`
  - `incapsula`
  - `overload`
  - `ddos`

### RequestTimeout

This exception is raised when the connection with the exchange fails or data is not fully received in a specified amount of time. This is controlled by the `timeout` option. When a `RequestTimeout` is raised, the user doesn't know the outcome of a request (whether it was accepted by the exchange server or not).

Thus it's advised to handle this type of exception in the following manner:

- for fetching requests it is safe to retry the call
- for a request to `cancelOrder` a user is required to retry the same call the second time. If instead of a retry a user calls a `fetchOrder`, `fetchOrders`, `fetchOpenOrders` or `fetchClosedOrders` right away without a retry to call `cancelOrder`, this may cause the [`.orders` cache](#orders-cache) to fall out of sync. A subsequent retry to `cancelOrder` will return one of the following possible results:
  - a request is completed successfully, meaning the order has been properly canceled now
  - an `OrderNotFound` exception is raised, which means the order was either already canceled on the first attempt or has been executed (filled and closed) in the meantime between the two attempts. Note, that the order will still have an `'open'` status in the `.orders` cache. To determine the actual order status you'll need to call `fetchOrder` to update the cache properly (where available from the exchange). If the `fetchOrder` method is `'emulated'` the ccxt library will mark the order as `'closed'`. The user has to call `fetchBalance` and set the order status to `'canceled'` manually if the balance hasn't changed (a trade didn't not occur).
- if a request to `createOrder` fails with a `RequestTimeout` the user should:
  - update the `.orders` cache with a call to `fetchOrders`, `fetchOpenOrders`, `fetchClosedOrders` to check if the request to place the order has succeeded and the order is now open
  - if the order is not `'open'` the user should `fetchBalance` to check if the balance has changed since the order was created on the first run and then was filled and closed by the time of the second check. Note that `fetchBalance` relies on the `.orders` cache for [balance inference](#balance-inference) and thus should only be called after updating the cache!

### ExchangeNotAvailable

The ccxt library throws this error if it detects any of the following keywords in response:

  - `offline`
  - `unavailable`
  - `busy`
  - `retry`
  - `wait`
  - `maintain`
  - `maintenance`
  - `maintenancing`

### InvalidNonce

Raised when your nonce is less than the previous nonce used with your keypair, as described in the [Authentication](https://github.com/ccxt/ccxt/wiki/Manual#authentication) section. This type of exception is thrown in these cases (in order of precedence for checking):

  - You are not rate-limiting your requests or sending too many of them too often.
  - Your API keys are not fresh and new (have been used with some different software or script already, just always create a new keypair when you add this or that exchange).
  - The same keypair is shared across multiple instances of the exchange class (for example, in a multithreaded environment or in separate processes).
  - Your system clock is out of synch. System time should be synched with UTC in a non-DST timezone at a rate of once every ten minutes or even more frequently because of the clock drifting. **Enabling time synch in Windows is usually not enough!** You have to set it up with the OS Registry (Google *"time synch frequency"* for your OS).

# Troubleshooting

In case you experience any difficulty connecting to a particular exchange, do the following in order of precedence:

- Make sure that you have the most recent version of ccxt.
- Check the [CHANGELOG](https://github.com/ccxt/ccxt/blob/master/CHANGELOG.md) for recent updates.
- Turn `verbose = true` to get more detail about it.
- Python people can turn on DEBUG logging level with a standard pythonic logger, by adding these two lines to the beginning of their code:
  ```Python
  import logging
  logging.basicConfig(level=logging.DEBUG)
  ```
- Use verbose mode to make sure that the used API credentials correspond to the keys you intend to use. Make sure there's no confusion of keypairs.
- **Try a fresh new keypair if possible.**
- Check the permissions on the keypair with the exchange website!
- If it is a Cloudflare protection error, try these examples:
  - https://github.com/ccxt/ccxt/blob/master/examples/js/bypass-cloudflare.js
  - https://github.com/ccxt/ccxt/blob/master/examples/py/bypass-cloudflare.py
  - https://github.com/ccxt/ccxt/blob/master/examples/py/bypass-cloudflare-with-cookies.py
- Check your nonce. If you used your API keys with other software, you most likely should [override your nonce function](#overriding-the-nonce) to match your previous nonce value. A nonce usually can be easily reset by generating a new unused keypair. If you are getting nonce errors with an existing key, try with a new API key that hasn't been used yet.
- Check your request rate if you are getting nonce errors. Your private requests should not follow one another quickly. You should not send them one after another in a split second or in short time. The exchange will most likely ban you if you don't make a delay before sending each new request. In other words, you should not hit their rate limit by sending unlimited private requests too frequently. Add a delay to your subsequent requests or enable the built-in rate-limiter, like shown in the long-poller [examples](https://github.com/ccxt/ccxt/tree/master/examples), also [here](https://github.com/ccxt/ccxt/wiki/Manual#order-book--market-depth).
- Read the [docs for your exchange](https://github.com/ccxt/ccxt/wiki/Exchanges) and compare your verbose output to the docs.
- Check your connectivity with the exchange by accessing it with your browser.
- Check your connection with the exchange through a proxy. Read the [Proxy](https://github.com/ccxt/ccxt/wiki/Install#proxy) section for more details.
- Try accesing the exchange from a different computer or a remote server, to see if this is a local or global issue with the exchange.
- Check if there were any news from the exchange recently regarding downtime for maintenance. Some exchanges go offline for updates regularly (like once a week).

## Notes

- Use the `verbose = true` option or instantiate your troublesome exchange with `new ccxt.exchange ({ 'verbose': true })` to see the HTTP requests and responses in details. The verbose output will also be of use for us to debug it if you submit an issue on GitHub.
- Use DEBUG logging in Python!
- As written above, some exchanges are not available in certain countries. You should use a proxy or get a server somewhere closer to the exchange.
- If you are getting authentication errors or *'invalid keys'* errors, those are most likely due to a nonce issue.
- Some exchanges do not state it clearly if they fail to authenticate your request. In those circumstances they might respond with an exotic error code, like HTTP 502 Bad Gateway Error or something that's even less related to the actual cause of the error.
- ...

```UNDER CONSTRUCTION```
