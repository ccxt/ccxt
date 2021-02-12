# CCXT – CryptoCurrency eXchange Trading Library

[![Build Status](https://travis-ci.com/ccxt/ccxt.svg?branch=master)](https://travis-ci.com/ccxt/ccxt) [![npm](https://img.shields.io/npm/v/ccxt.svg)](https://npmjs.com/package/ccxt) [![PyPI](https://img.shields.io/pypi/v/ccxt.svg)](https://pypi.python.org/pypi/ccxt) [![NPM Downloads](https://img.shields.io/npm/dy/ccxt.svg)](https://www.npmjs.com/package/ccxt) [![Discord](https://img.shields.io/discord/690203284119617602?logo=discord&logoColor=white)](https://discord.gg/dhzSKYU) [![Supported Exchanges](https://img.shields.io/badge/exchanges-124-blue.svg)](https://github.com/ccxt/ccxt/wiki/Exchange-Markets) [![Open Collective](https://opencollective.com/ccxt/backers/badge.svg)](https://opencollective.com/ccxt)
[![Twitter Follow](https://img.shields.io/twitter/follow/ccxt_official.svg?style=social&label=CCXT)](https://twitter.com/ccxt_official)

A JavaScript / Python / PHP library for cryptocurrency trading and e-commerce with support for many bitcoin/ether/altcoin exchange markets and merchant APIs.

### [Install](#install) · [Usage](#usage) · [Manual](https://github.com/ccxt/ccxt/wiki) · [FAQ](https://github.com/ccxt/ccxt/wiki/FAQ) · [Examples](https://github.com/ccxt/ccxt/tree/master/examples) · [Contributing](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) · [Social](#social) · [CCXT Pro](https://ccxt.pro)

The **CCXT** library is used to connect and trade with cryptocurrency exchanges and payment processing services worldwide. It provides quick access to market data for storage, analysis, visualization, indicator development, algorithmic trading, strategy backtesting, bot programming, and related software engineering.

It is intended to be used by **coders, developers, technically-skilled traders, data-scientists and financial analysts** for building trading algorithms.

Current feature list:

- support for many cryptocurrency exchanges — more coming soon
- fully implemented public and private APIs
- optional normalized data for cross-exchange analytics and arbitrage
- an out of the box unified API that is extremely easy to integrate
- works in Node 7.6+, Python 3, PHP 5.4+, and web browsers

## Sponsored Promotion

[![AAX – The world's first crypto exchange powered by LSEG Technology](https://user-images.githubusercontent.com/1294454/106508373-5fa30000-64dd-11eb-9e25-e7ed141938e3.png)](https://www.aaxpro.com/en-US/ad-sign-up/?utm_source=ccxt&utm_medium=banner&utm_campaign=futures)

[![Pionex – The biggest Binance Broker that provides 12 free crypto trading bots](https://user-images.githubusercontent.com/1294454/106110516-e2cdfa00-615b-11eb-9c70-9a9639f28673.png)](https://www.pionex.com/en-US/sign?r=8wSFCbNk&utm_source=ad&utm_medium=banner&utm_campaign=ccxt-1)

[![CCXT Pro – A JavaScript / Python / PHP cryptocurrency exchange trading WebSocket API for professionals](https://user-images.githubusercontent.com/1294454/106092533-865ce180-613f-11eb-8d67-0830771fde32.png)](https://ccxt.pro)

## See Also

- <sub>[![Quadency](https://user-images.githubusercontent.com/1294454/69334382-a0618100-0c6b-11ea-9ba9-40aa97440cfa.png)](https://quadency.com?utm_source=ccxt)</sub>&nbsp; **[Quadency](https://quadency.com?utm_source=ccxt)**&nbsp;&mdash;&nbsp;trading automation terminal for leading exchanges with streaming APIs + Python IDE.
- <sub>[![TabTrader](https://user-images.githubusercontent.com/1294454/66755907-9c3e8880-eea1-11e9-846e-0bff349ceb87.png)](https://tab-trader.com/?utm_source=ccxt)</sub>&nbsp; **[TabTrader](https://tab-trader.com/?utm_source=ccxt)**&nbsp;&mdash;&nbsp;trading on all exchanges in one app. Avaliable on [Android](https://play.google.com/store/apps/details?id=com.tabtrader.android&referrer=utm_source%3Dccxt) and [iOS](https://itunes.apple.com/app/apple-store/id1095716562?mt=8).
- <sub>[![Pionex](https://user-images.githubusercontent.com/1294454/106112806-c2ec0580-615e-11eb-870c-0b7aef021db2.png)](https://www.pionex.com/en-US/sign?r=8wSFCbNk&utm_source=ad&utm_medium=banner&utm_campaign=ccxt-2)</sub>&nbsp; **[Pionex](https://www.pionex.com/en-US/sign?r=8wSFCbNk&utm_source=ad&utm_medium=banner&utm_campaign=ccxt-2)**&nbsp;&mdash;&nbsp;6 grid bots, spot-futures arb bot, smart trade and DCA bots. Free for [Android](https://play.google.com/store/apps/details?id=com.pionex.client&referrer=utm_source%3Dccxt) and [iOS](https://apps.apple.com/us/app/pionex/id1485348891?pt=ccxt&ct=inline)!
- <sub>[![AAX](https://user-images.githubusercontent.com/1294454/106509642-ef957980-64de-11eb-92e0-8323cda7874e.png)](https://www.aaxpro.com/en-US/ad-sign-up/?utm_source=ccxt&utm_medium=one-liner&utm_campaign=futures)</sub>&nbsp; **[AAX](https://www.aaxpro.com/en-US/ad-sign-up/?utm_source=ccxt&utm_medium=one-liner&utm_campaign=futures)**&nbsp;&mdash;&nbsp;trade bitcoin futures with fees as low as 0.02% and up to 100x leverage!


## Certified Cryptocurrency Exchanges


| logo                                                                                                                                                                               | id            | name                                                                        | ver | doc                                                                | certified                                                                                                                   | pro                                                                          |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|-----------------------------------------------------------------------------|:---:|:------------------------------------------------------------------:|-----------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| [![aax](https://user-images.githubusercontent.com/1294454/104140087-a27f2580-53c0-11eb-87c1-5d9e81208fe9.jpg)](https://www.aaxpro.com/invite/sign-up?inviteCode=JXGm5Fy7R2MB)      | aax           | [AAX](https://www.aaxpro.com/invite/sign-up?inviteCode=JXGm5Fy7R2MB)        | 2   | [API](https://www.aaxpro.com/apidoc/index.html)                    | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) |                                                                              |
| [![binance](https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg)](https://www.binance.com/?ref=10205187)                           | binance       | [Binance](https://www.binance.com/?ref=10205187)                            | *   | [API](https://binance-docs.github.io/apidocs/spot/en)              | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitfinex](https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg)](https://www.bitfinex.com/?refcode=P61eYxFL)                     | bitfinex      | [Bitfinex](https://www.bitfinex.com/?refcode=P61eYxFL)                      | 1   | [API](https://docs.bitfinex.com/v1/docs)                           | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bittrex](https://user-images.githubusercontent.com/51840849/87153921-edf53180-c2c0-11ea-96b9-f2a9a95a455b.jpg)](https://bittrex.com/Account/Register?referralCode=1ZE-G0G-M3B)  | bittrex       | [Bittrex](https://bittrex.com/Account/Register?referralCode=1ZE-G0G-M3B)    | 3   | [API](https://bittrex.github.io/api/v3)                            | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitvavo](https://user-images.githubusercontent.com/1294454/83165440-2f1cf200-a116-11ea-9046-a255d09fb2ed.jpg)](https://bitvavo.com/?a=24F34952F7)                               | bitvavo       | [Bitvavo](https://bitvavo.com/?a=24F34952F7)                                | 2   | [API](https://docs.bitvavo.com/)                                   | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bytetrade](https://user-images.githubusercontent.com/1294454/67288762-2f04a600-f4e6-11e9-9fd6-c60641919491.jpg)](https://www.byte-trade.com)                                    | bytetrade     | [ByteTrade](https://www.byte-trade.com)                                     | *   | [API](https://docs.byte-trade.com/#description)                    | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) |                                                                              |
| [![currencycom](https://user-images.githubusercontent.com/1294454/83718672-36745c00-a63e-11ea-81a9-677b1f789a4d.jpg)](https://currency.com/trading/signup?c=362jaimv&pid=referral) | currencycom   | [Currency.com](https://currency.com/trading/signup?c=362jaimv&pid=referral) | 1   | [API](https://currency.com/api)                                    | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![eterbase](https://user-images.githubusercontent.com/1294454/82067900-faeb0f80-96d9-11ea-9f22-0071cfcb9871.jpg)](https://eterbase.exchange/invite/1wjjh4Pe)                      | eterbase      | [Eterbase](https://eterbase.exchange/invite/1wjjh4Pe)                       | 1   | [API](https://developers.eterbase.exchange)                        | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) |                                                                              |
| [![ftx](https://user-images.githubusercontent.com/1294454/67149189-df896480-f2b0-11e9-8816-41593e17f9ec.jpg)](https://ftx.com/#a=1623029)                                          | ftx           | [FTX](https://ftx.com/#a=1623029)                                           | *   | [API](https://github.com/ftexchange/ftx)                           | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![gopax](https://user-images.githubusercontent.com/1294454/102897212-ae8a5e00-4478-11eb-9bab-91507c643900.jpg)](https://www.gopax.co.kr)                                          | gopax         | [GOPAX](https://www.gopax.co.kr)                                            | 1   | [API](https://gopax.github.io/API/index.en.html)                   | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![idex](https://user-images.githubusercontent.com/51840849/94481303-2f222100-01e0-11eb-97dd-bc14c5943a86.jpg)](https://idex.io)                                                   | idex          | [IDEX](https://idex.io)                                                     | 2   | [API](https://docs.idex.io/)                                       | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![kraken](https://user-images.githubusercontent.com/51840849/76173629-fc67fb00-61b1-11ea-84fe-f2de582f58a3.jpg)](https://www.kraken.com)                                          | kraken        | [Kraken](https://www.kraken.com)                                            | 0   | [API](https://www.kraken.com/features/api)                         | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![wavesexchange](https://user-images.githubusercontent.com/1294454/84547058-5fb27d80-ad0b-11ea-8711-78ac8b3c7f31.jpg)](https://waves.exchange)                                    | wavesexchange | [Waves.Exchange](https://waves.exchange)                                    | *   | [API](https://docs.waves.exchange)                                 | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) |                                                                              |
| [![xena](https://user-images.githubusercontent.com/51840849/87489843-bb469280-c64c-11ea-91aa-69c6326506af.jpg)](https://xena.exchange)                                             | xena          | [Xena Exchange](https://xena.exchange)                                      | *   | [API](https://support.xena.exchange/support/solutions/44000808700) | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) |                                                                              |

## Supported Cryptocurrency Exchange Markets

The CCXT library currently supports the following 124 cryptocurrency exchange markets and trading APIs:

| logo                                                                                                                                                                                             | id                 | name                                                                                    | ver | doc                                                                                         | certified                                                                                                                   | pro                                                                          |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------|-----------------------------------------------------------------------------------------|:---:|:-------------------------------------------------------------------------------------------:|-----------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| [![aax](https://user-images.githubusercontent.com/1294454/104140087-a27f2580-53c0-11eb-87c1-5d9e81208fe9.jpg)](https://www.aaxpro.com/invite/sign-up?inviteCode=JXGm5Fy7R2MB)                    | aax                | [AAX](https://www.aaxpro.com/invite/sign-up?inviteCode=JXGm5Fy7R2MB)                    | 2   | [API](https://www.aaxpro.com/apidoc/index.html)                                             | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) |                                                                              |
| [![acx](https://user-images.githubusercontent.com/1294454/30247614-1fe61c74-9621-11e7-9e8c-f1a627afa279.jpg)](https://acx.io)                                                                    | acx                | [ACX](https://acx.io)                                                                   | 2   | [API](https://acx.io/documents/api_v2)                                                      |                                                                                                                             |                                                                              |
| [![aofex](https://user-images.githubusercontent.com/51840849/77670271-056d1080-6f97-11ea-9ac2-4268e9ed0c1f.jpg)](https://aofex.com/#/register?key=9763840)                                       | aofex              | [AOFEX](https://aofex.com/#/register?key=9763840)                                       | *   | [API](https://aofex.zendesk.com/hc/en-us/sections/360005576574-API)                         |                                                                                                                             |                                                                              |
| [![bequant](https://user-images.githubusercontent.com/1294454/55248342-a75dfe00-525a-11e9-8aa2-05e9dca943c6.jpg)](https://bequant.io)                                                            | bequant            | [Bequant](https://bequant.io)                                                           | 2   | [API](https://api.bequant.io/)                                                              |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bibox](https://user-images.githubusercontent.com/51840849/77257418-3262b000-6c85-11ea-8fb8-20bdf20b3592.jpg)](https://w2.bibox365.com/login/register?invite_code=05Kj3I)                      | bibox              | [Bibox](https://w2.bibox365.com/login/register?invite_code=05Kj3I)                      | 1   | [API](https://biboxcom.github.io/en/)                                                       |                                                                                                                             |                                                                              |
| [![bigone](https://user-images.githubusercontent.com/1294454/69354403-1d532180-0c91-11ea-88ed-44c06cefdf87.jpg)](https://b1.run/users/new?code=D3LLBVFT)                                         | bigone             | [BigONE](https://b1.run/users/new?code=D3LLBVFT)                                        | 3   | [API](https://open.big.one/docs/api.html)                                                   |                                                                                                                             |                                                                              |
| [![binance](https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg)](https://www.binance.com/?ref=10205187)                                         | binance            | [Binance](https://www.binance.com/?ref=10205187)                                        | *   | [API](https://binance-docs.github.io/apidocs/spot/en)                                       | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![binanceus](https://user-images.githubusercontent.com/1294454/65177307-217b7c80-da5f-11e9-876e-0b748ba0a358.jpg)](https://www.binance.us/?ref=35005074)                                        | binanceus          | [Binance US](https://www.binance.us/?ref=35005074)                                      | *   | [API](https://github.com/binance-us/binance-official-api-docs)                              |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bit2c](https://user-images.githubusercontent.com/1294454/27766119-3593220e-5ece-11e7-8b3a-5a041f6bcc3f.jpg)](https://bit2c.co.il/Aff/63bfed10-e359-420c-ab5a-ad368dab0baf)                    | bit2c              | [Bit2C](https://bit2c.co.il/Aff/63bfed10-e359-420c-ab5a-ad368dab0baf)                   | *   | [API](https://www.bit2c.co.il/home/api)                                                     |                                                                                                                             |                                                                              |
| [![bitbank](https://user-images.githubusercontent.com/1294454/37808081-b87f2d9c-2e59-11e8-894d-c1900b7584fe.jpg)](https://bitbank.cc/)                                                           | bitbank            | [bitbank](https://bitbank.cc/)                                                          | 1   | [API](https://docs.bitbank.cc/)                                                             |                                                                                                                             |                                                                              |
| [![bitbay](https://user-images.githubusercontent.com/1294454/27766132-978a7bd8-5ece-11e7-9540-bc96d1e9bbb8.jpg)](https://auth.bitbay.net/ref/jHlbB4mIkdS1)                                       | bitbay             | [BitBay](https://auth.bitbay.net/ref/jHlbB4mIkdS1)                                      | *   | [API](https://bitbay.net/public-api)                                                        |                                                                                                                             |                                                                              |
| [![bitcoincom](https://user-images.githubusercontent.com/1294454/97296144-514fa300-1861-11eb-952b-3d55d492200b.jpg)](https://exchange.bitcoin.com/referral/da948b21d6c92d69)                     | bitcoincom         | [bitcoin.com](https://exchange.bitcoin.com/referral/da948b21d6c92d69)                   | 2   | [API](https://api.exchange.bitcoin.com/api/2/explore)                                       |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitfinex](https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg)](https://www.bitfinex.com/?refcode=P61eYxFL)                                   | bitfinex           | [Bitfinex](https://www.bitfinex.com/?refcode=P61eYxFL)                                  | 1   | [API](https://docs.bitfinex.com/v1/docs)                                                    | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitfinex2](https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg)](https://www.bitfinex.com/?refcode=P61eYxFL)                                  | bitfinex2          | [Bitfinex](https://www.bitfinex.com/?refcode=P61eYxFL)                                  | 2   | [API](https://docs.bitfinex.com/v2/docs/)                                                   |                                                                                                                             |                                                                              |
| [![bitflyer](https://user-images.githubusercontent.com/1294454/28051642-56154182-660e-11e7-9b0d-6042d1e6edd8.jpg)](https://bitflyer.com)                                                         | bitflyer           | [bitFlyer](https://bitflyer.com)                                                        | 1   | [API](https://lightning.bitflyer.com/docs?lang=en)                                          |                                                                                                                             |                                                                              |
| [![bitforex](https://user-images.githubusercontent.com/51840849/87295553-1160ec00-c50e-11ea-8ea0-df79276a9646.jpg)](https://www.bitforex.com/en/invitationRegister?inviterId=1867438)            | bitforex           | [Bitforex](https://www.bitforex.com/en/invitationRegister?inviterId=1867438)            | 1   | [API](https://github.com/githubdev2020/API_Doc_en/wiki)                                     |                                                                                                                             |                                                                              |
| [![bitget](https://user-images.githubusercontent.com/51840849/88317935-a8a21c80-cd22-11ea-8e2b-4b9fac5975eb.jpg)](https://www.bitget.com/expressly?languageType=0&channelCode=ccxt&vipCode=tg9j) | bitget             | [Bitget](https://www.bitget.com/expressly?languageType=0&channelCode=ccxt&vipCode=tg9j) | 3   | [API](https://bitgetlimited.github.io/apidoc/en/swap)                                       |                                                                                                                             |                                                                              |
| [![bithumb](https://user-images.githubusercontent.com/1294454/30597177-ea800172-9d5e-11e7-804c-b9d4fa9b56b0.jpg)](https://www.bithumb.com)                                                       | bithumb            | [Bithumb](https://www.bithumb.com)                                                      | *   | [API](https://apidocs.bithumb.com)                                                          |                                                                                                                             |                                                                              |
| [![bitkk](https://user-images.githubusercontent.com/1294454/32859187-cd5214f0-ca5e-11e7-967d-96568e2e2bd1.jpg)](https://www.bitkk.com)                                                           | bitkk              | [bitkk](https://www.bitkk.com)                                                          | 1   | [API](https://www.bitkk.com/i/developer)                                                    |                                                                                                                             |                                                                              |
| [![bitmart](https://user-images.githubusercontent.com/1294454/61835713-a2662f80-ae85-11e9-9d00-6442919701fd.jpg)](http://www.bitmart.com/?r=rQCFLh)                                              | bitmart            | [BitMart](http://www.bitmart.com/?r=rQCFLh)                                             | 1   | [API](https://developer-pro.bitmart.com/)                                                   |                                                                                                                             |                                                                              |
| [![bitmax](https://user-images.githubusercontent.com/1294454/66820319-19710880-ef49-11e9-8fbe-16be62a11992.jpg)](https://bitmax.io/#/register?inviteCode=EL6BXBQM)                               | bitmax             | [BitMax](https://bitmax.io/#/register?inviteCode=EL6BXBQM)                              | 1   | [API](https://bitmax-exchange.github.io/bitmax-pro-api/#bitmax-pro-api-documentation)       |                                                                                                                             |                                                                              |
| [![bitmex](https://user-images.githubusercontent.com/1294454/27766319-f653c6e6-5ed4-11e7-933d-f0bc3699ae8f.jpg)](https://www.bitmex.com/register/upZpOX)                                         | bitmex             | [BitMEX](https://www.bitmex.com/register/upZpOX)                                        | 1   | [API](https://www.bitmex.com/app/apiOverview)                                               |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitpanda](https://user-images.githubusercontent.com/51840849/87591171-9a377d80-c6f0-11ea-94ac-97a126eac3bc.jpg)](https://www.bitpanda.com/en/pro)                                             | bitpanda           | [Bitpanda Pro](https://www.bitpanda.com/en/pro)                                         | 1   | [API](https://developers.bitpanda.com/exchange/)                                            |                                                                                                                             |                                                                              |
| [![bitso](https://user-images.githubusercontent.com/51840849/87295554-11f98280-c50e-11ea-80d6-15b3bafa8cbf.jpg)](https://bitso.com/?ref=itej)                                                    | bitso              | [Bitso](https://bitso.com/?ref=itej)                                                    | 3   | [API](https://bitso.com/api_info)                                                           |                                                                                                                             |                                                                              |
| [![bitstamp](https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg)](https://www.bitstamp.net)                                                     | bitstamp           | [Bitstamp](https://www.bitstamp.net)                                                    | 2   | [API](https://www.bitstamp.net/api)                                                         |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitstamp1](https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg)](https://www.bitstamp.net)                                                    | bitstamp1          | [Bitstamp](https://www.bitstamp.net)                                                    | 1   | [API](https://www.bitstamp.net/api)                                                         |                                                                                                                             |                                                                              |
| [![bittrex](https://user-images.githubusercontent.com/51840849/87153921-edf53180-c2c0-11ea-96b9-f2a9a95a455b.jpg)](https://bittrex.com/Account/Register?referralCode=1ZE-G0G-M3B)                | bittrex            | [Bittrex](https://bittrex.com/Account/Register?referralCode=1ZE-G0G-M3B)                | 3   | [API](https://bittrex.github.io/api/v3)                                                     | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitvavo](https://user-images.githubusercontent.com/1294454/83165440-2f1cf200-a116-11ea-9046-a255d09fb2ed.jpg)](https://bitvavo.com/?a=24F34952F7)                                             | bitvavo            | [Bitvavo](https://bitvavo.com/?a=24F34952F7)                                            | 2   | [API](https://docs.bitvavo.com/)                                                            | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitz](https://user-images.githubusercontent.com/51840849/87443304-fec5e000-c5fd-11ea-98f8-ba8e67f7eaff.jpg)](https://u.bitz.com/register?invite_code=1429193)                                 | bitz               | [Bit-Z](https://u.bitz.com/register?invite_code=1429193)                                | 2   | [API](https://apidoc.bitz.com/en/)                                                          |                                                                                                                             |                                                                              |
| [![bl3p](https://user-images.githubusercontent.com/1294454/28501752-60c21b82-6feb-11e7-818b-055ee6d0e754.jpg)](https://bl3p.eu)                                                                  | bl3p               | [BL3P](https://bl3p.eu)                                                                 | 1   | [API](https://github.com/BitonicNL/bl3p-api/tree/master/docs)                               |                                                                                                                             |                                                                              |
| [![bleutrade](https://user-images.githubusercontent.com/1294454/30303000-b602dbe6-976d-11e7-956d-36c5049c01e7.jpg)](https://bleutrade.com)                                                       | bleutrade          | [Bleutrade](https://bleutrade.com)                                                      | *   | [API](https://app.swaggerhub.com/apis-docs/bleu/white-label/3.0.0)                          |                                                                                                                             |                                                                              |
| [![braziliex](https://user-images.githubusercontent.com/1294454/34703593-c4498674-f504-11e7-8d14-ff8e44fb78c1.jpg)](https://braziliex.com/?ref=5FE61AB6F6D67DA885BC98BA27223465)                 | braziliex          | [Braziliex](https://braziliex.com/?ref=5FE61AB6F6D67DA885BC98BA27223465)                | *   | [API](https://braziliex.com/exchange/api.php)                                               |                                                                                                                             |                                                                              |
| [![btcalpha](https://user-images.githubusercontent.com/1294454/42625213-dabaa5da-85cf-11e8-8f99-aa8f8f7699f0.jpg)](https://btc-alpha.com/?r=123788)                                              | btcalpha           | [BTC-Alpha](https://btc-alpha.com/?r=123788)                                            | 1   | [API](https://btc-alpha.github.io/api-docs)                                                 |                                                                                                                             |                                                                              |
| [![btcbox](https://user-images.githubusercontent.com/51840849/87327317-98c55400-c53c-11ea-9a11-81f7d951cc74.jpg)](https://www.btcbox.co.jp/)                                                     | btcbox             | [BtcBox](https://www.btcbox.co.jp/)                                                     | 1   | [API](https://blog.btcbox.jp/en/archives/8762)                                              |                                                                                                                             |                                                                              |
| [![btcmarkets](https://user-images.githubusercontent.com/51840849/89731817-b3fb8480-da52-11ea-817f-783b08aaf32b.jpg)](https://btcmarkets.net)                                                    | btcmarkets         | [BTC Markets](https://btcmarkets.net)                                                   | 3   | [API](https://api.btcmarkets.net/doc/v3)                                                    |                                                                                                                             |                                                                              |
| [![btctradeua](https://user-images.githubusercontent.com/1294454/27941483-79fc7350-62d9-11e7-9f61-ac47f28fcd96.jpg)](https://btc-trade.com.ua/registration/22689)                                | btctradeua         | [BTC Trade UA](https://btc-trade.com.ua/registration/22689)                             | *   | [API](https://docs.google.com/document/d/1ocYA0yMy_RXd561sfG3qEPZ80kyll36HUxvCRe5GbhE/edit) |                                                                                                                             |                                                                              |
| [![btcturk](https://user-images.githubusercontent.com/51840849/87153926-efbef500-c2c0-11ea-9842-05b63612c4b9.jpg)](https://www.btcturk.com)                                                      | btcturk            | [BTCTurk](https://www.btcturk.com)                                                      | *   | [API](https://github.com/BTCTrader/broker-api-docs)                                         |                                                                                                                             |                                                                              |
| [![buda](https://user-images.githubusercontent.com/1294454/47380619-8a029200-d706-11e8-91e0-8a391fe48de3.jpg)](https://www.buda.com)                                                             | buda               | [Buda](https://www.buda.com)                                                            | 2   | [API](https://api.buda.com)                                                                 |                                                                                                                             |                                                                              |
| [![bw](https://user-images.githubusercontent.com/1294454/69436317-31128c80-0d52-11ea-91d1-eb7bb5818812.jpg)](https://www.bw.com/regGetCommission/N3JuT1R3bWxKTE0)                                | bw                 | [BW](https://www.bw.com/regGetCommission/N3JuT1R3bWxKTE0)                               | 1   | [API](https://github.com/bw-exchange/api_docs_en/wiki)                                      |                                                                                                                             |                                                                              |
| [![bybit](https://user-images.githubusercontent.com/51840849/76547799-daff5b80-649e-11ea-87fb-3be9bac08954.jpg)](https://www.bybit.com/app/register?ref=X7Prm)                                   | bybit              | [Bybit](https://www.bybit.com/app/register?ref=X7Prm)                                   | 2   | [API](https://bybit-exchange.github.io/docs/inverse/)                                       |                                                                                                                             |                                                                              |
| [![bytetrade](https://user-images.githubusercontent.com/1294454/67288762-2f04a600-f4e6-11e9-9fd6-c60641919491.jpg)](https://www.byte-trade.com)                                                  | bytetrade          | [ByteTrade](https://www.byte-trade.com)                                                 | *   | [API](https://docs.byte-trade.com/#description)                                             | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) |                                                                              |
| [![cdax](https://user-images.githubusercontent.com/1294454/102157692-fd406280-3e90-11eb-8d46-4511b617cd17.jpg)](https://cdax.io/invite?invite_code=esc74)                                        | cdax               | [CDAX](https://cdax.io/invite?invite_code=esc74)                                        | 1   | [API](https://github.com/cloudapidoc/API_Docs)                                              |                                                                                                                             |                                                                              |
| [![cex](https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg)](https://cex.io/r/0/up105393824/0/)                                                 | cex                | [CEX.IO](https://cex.io/r/0/up105393824/0/)                                             | *   | [API](https://cex.io/cex-api)                                                               |                                                                                                                             |                                                                              |
| [![chilebit](https://user-images.githubusercontent.com/1294454/27991414-1298f0d8-647f-11e7-9c40-d56409266336.jpg)](https://chilebit.net)                                                         | chilebit           | [ChileBit](https://chilebit.net)                                                        | 1   | [API](https://blinktrade.com/docs)                                                          |                                                                                                                             |                                                                              |
| [![coinbase](https://user-images.githubusercontent.com/1294454/40811661-b6eceae2-653a-11e8-829e-10bfadb078cf.jpg)](https://www.coinbase.com/join/58cbe25a355148797479dbd2)                       | coinbase           | [Coinbase](https://www.coinbase.com/join/58cbe25a355148797479dbd2)                      | 2   | [API](https://developers.coinbase.com/api/v2)                                               |                                                                                                                             |                                                                              |
| [![coinbaseprime](https://user-images.githubusercontent.com/1294454/44539184-29f26e00-a70c-11e8-868f-e907fc236a7c.jpg)](https://prime.coinbase.com)                                              | coinbaseprime      | [Coinbase Prime](https://prime.coinbase.com)                                            | *   | [API](https://docs.prime.coinbase.com)                                                      |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![coinbasepro](https://user-images.githubusercontent.com/1294454/41764625-63b7ffde-760a-11e8-996d-a6328fa9347a.jpg)](https://pro.coinbase.com/)                                                 | coinbasepro        | [Coinbase Pro](https://pro.coinbase.com/)                                               | *   | [API](https://docs.pro.coinbase.com)                                                        |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![coincheck](https://user-images.githubusercontent.com/51840849/87182088-1d6d6380-c2ec-11ea-9c64-8ab9f9b289f5.jpg)](https://coincheck.com)                                                      | coincheck          | [coincheck](https://coincheck.com)                                                      | *   | [API](https://coincheck.com/documents/exchange/api)                                         |                                                                                                                             |                                                                              |
| [![coinegg](https://user-images.githubusercontent.com/1294454/36770310-adfa764e-1c5a-11e8-8e09-449daac3d2fb.jpg)](https://www.coinegg.com/user/register?invite=523218)                           | coinegg            | [CoinEgg](https://www.coinegg.com/user/register?invite=523218)                          | *   | [API](https://www.coinegg.com/explain.api.html)                                             |                                                                                                                             |                                                                              |
| [![coinex](https://user-images.githubusercontent.com/51840849/87182089-1e05fa00-c2ec-11ea-8da9-cc73b45abbbc.jpg)](https://www.coinex.com/register?refer_code=yw5fz)                              | coinex             | [CoinEx](https://www.coinex.com/register?refer_code=yw5fz)                              | 1   | [API](https://github.com/coinexcom/coinex_exchange_api/wiki)                                |                                                                                                                             |                                                                              |
| [![coinfalcon](https://user-images.githubusercontent.com/1294454/41822275-ed982188-77f5-11e8-92bb-496bcd14ca52.jpg)](https://coinfalcon.com/?ref=CFJSVGTUPASB)                                   | coinfalcon         | [CoinFalcon](https://coinfalcon.com/?ref=CFJSVGTUPASB)                                  | 1   | [API](https://docs.coinfalcon.com)                                                          |                                                                                                                             |                                                                              |
| [![coinfloor](https://user-images.githubusercontent.com/51840849/87153925-ef265e80-c2c0-11ea-91b5-020c804b90e0.jpg)](https://www.coinfloor.co.uk)                                                | coinfloor          | [coinfloor](https://www.coinfloor.co.uk)                                                | *   | [API](https://github.com/coinfloor/api)                                                     |                                                                                                                             |                                                                              |
| [![coingi](https://user-images.githubusercontent.com/1294454/28619707-5c9232a8-7212-11e7-86d6-98fe5d15cc6e.jpg)](https://www.coingi.com/?r=XTPPMC)                                               | coingi             | [Coingi](https://www.coingi.com/?r=XTPPMC)                                              | *   | [API](https://coingi.docs.apiary.io)                                                        |                                                                                                                             |                                                                              |
| [![coinmarketcap](https://user-images.githubusercontent.com/51840849/87182086-1cd4cd00-c2ec-11ea-9ec4-d0cf2a2abf62.jpg)](https://coinmarketcap.com)                                              | coinmarketcap      | [CoinMarketCap](https://coinmarketcap.com)                                              | 1   | [API](https://coinmarketcap.com/api)                                                        |                                                                                                                             |                                                                              |
| [![coinmate](https://user-images.githubusercontent.com/51840849/87460806-1c9f3f00-c616-11ea-8c46-a77018a8f3f4.jpg)](https://coinmate.io?referral=YTFkM1RsOWFObVpmY1ZjMGREQmpTRnBsWjJJNVp3PT0)    | coinmate           | [CoinMate](https://coinmate.io?referral=YTFkM1RsOWFObVpmY1ZjMGREQmpTRnBsWjJJNVp3PT0)    | *   | [API](https://coinmate.docs.apiary.io)                                                      |                                                                                                                             |                                                                              |
| [![coinone](https://user-images.githubusercontent.com/1294454/38003300-adc12fba-323f-11e8-8525-725f53c4a659.jpg)](https://coinone.co.kr)                                                         | coinone            | [CoinOne](https://coinone.co.kr)                                                        | 2   | [API](https://doc.coinone.co.kr)                                                            |                                                                                                                             |                                                                              |
| [![coinspot](https://user-images.githubusercontent.com/1294454/28208429-3cacdf9a-6896-11e7-854e-4c79a772a30f.jpg)](https://www.coinspot.com.au/register?code=PJURCU)                             | coinspot           | [CoinSpot](https://www.coinspot.com.au/register?code=PJURCU)                            | *   | [API](https://www.coinspot.com.au/api)                                                      |                                                                                                                             |                                                                              |
| [![crex24](https://user-images.githubusercontent.com/1294454/47813922-6f12cc00-dd5d-11e8-97c6-70f957712d47.jpg)](https://crex24.com/?refid=slxsjsjtil8xexl9hksr)                                 | crex24             | [CREX24](https://crex24.com/?refid=slxsjsjtil8xexl9hksr)                                | 2   | [API](https://docs.crex24.com/trade-api/v2)                                                 |                                                                                                                             |                                                                              |
| [![currencycom](https://user-images.githubusercontent.com/1294454/83718672-36745c00-a63e-11ea-81a9-677b1f789a4d.jpg)](https://currency.com/trading/signup?c=362jaimv&pid=referral)               | currencycom        | [Currency.com](https://currency.com/trading/signup?c=362jaimv&pid=referral)             | 1   | [API](https://currency.com/api)                                                             | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![delta](https://user-images.githubusercontent.com/1294454/99450025-3be60a00-2931-11eb-9302-f4fd8d8589aa.jpg)](https://www.delta.exchange/app/signup/?code=IULYNB)                              | delta              | [Delta Exchange](https://www.delta.exchange/app/signup/?code=IULYNB)                    | 2   | [API](https://docs.delta.exchange)                                                          |                                                                                                                             |                                                                              |
| [![deribit](https://user-images.githubusercontent.com/1294454/41933112-9e2dd65a-798b-11e8-8440-5bab2959fcb8.jpg)](https://www.deribit.com/reg-1189.4038)                                         | deribit            | [Deribit](https://www.deribit.com/reg-1189.4038)                                        | 2   | [API](https://docs.deribit.com/v2)                                                          |                                                                                                                             |                                                                              |
| [![digifinex](https://user-images.githubusercontent.com/51840849/87443315-01283a00-c5fe-11ea-8628-c2a0feaf07ac.jpg)](https://www.digifinex.com/en-ww/from/DhOzBg?channelCode=ljaUPp)             | digifinex          | [DigiFinex](https://www.digifinex.com/en-ww/from/DhOzBg?channelCode=ljaUPp)             | 3   | [API](https://docs.digifinex.com)                                                           |                                                                                                                             |                                                                              |
| [![dsx](https://user-images.githubusercontent.com/51840849/76909626-cb2bb100-68bc-11ea-99e0-28ba54f04792.jpg)](https://dsxglobal.com)                                                            | dsx                | [DSX](https://dsxglobal.com)                                                            | 3   | [API](https://dsxglobal.com/developers/publicApi)                                           |                                                                                                                             |                                                                              |
| [![eterbase](https://user-images.githubusercontent.com/1294454/82067900-faeb0f80-96d9-11ea-9f22-0071cfcb9871.jpg)](https://eterbase.exchange/invite/1wjjh4Pe)                                    | eterbase           | [Eterbase](https://eterbase.exchange/invite/1wjjh4Pe)                                   | 1   | [API](https://developers.eterbase.exchange)                                                 | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) |                                                                              |
| [![exmo](https://user-images.githubusercontent.com/1294454/27766491-1b0ea956-5eda-11e7-9225-40d67b481b8d.jpg)](https://exmo.me/?ref=131685)                                                      | exmo               | [EXMO](https://exmo.me/?ref=131685)                                                     | 1.1 | [API](https://exmo.me/en/api_doc?ref=131685)                                                |                                                                                                                             |                                                                              |
| [![exx](https://user-images.githubusercontent.com/1294454/37770292-fbf613d0-2de4-11e8-9f79-f2dc451b8ccb.jpg)](https://www.exx.com/r/fde4260159e53ab8a58cc9186d35501f?recommQd=1)                 | exx                | [EXX](https://www.exx.com/r/fde4260159e53ab8a58cc9186d35501f?recommQd=1)                | *   | [API](https://www.exx.com/help/restApi)                                                     |                                                                                                                             |                                                                              |
| [![fcoin](https://user-images.githubusercontent.com/1294454/42244210-c8c42e1e-7f1c-11e8-8710-a5fb63b165c4.jpg)](https://www.fcoin.com/i/Z5P7V)                                                   | fcoin              | [FCoin](https://www.fcoin.com/i/Z5P7V)                                                  | 2   | [API](https://developer.fcoin.com)                                                          |                                                                                                                             |                                                                              |
| [![fcoinjp](https://user-images.githubusercontent.com/1294454/54219174-08b66b00-4500-11e9-862d-f522d0fe08c6.jpg)](https://www.fcoinjp.com)                                                       | fcoinjp            | [FCoinJP](https://www.fcoinjp.com)                                                      | 2   | [API](https://developer.fcoin.com)                                                          |                                                                                                                             |                                                                              |
| [![flowbtc](https://user-images.githubusercontent.com/51840849/87443317-01c0d080-c5fe-11ea-95c2-9ebe1a8fafd9.jpg)](https://www.flowbtc.com.br)                                                   | flowbtc            | [flowBTC](https://www.flowbtc.com.br)                                                   | 1   | [API](https://www.flowbtc.com.br/api.html)                                                  |                                                                                                                             |                                                                              |
| [![foxbit](https://user-images.githubusercontent.com/51840849/87443320-01c0d080-c5fe-11ea-92e2-4ef56d32b026.jpg)](https://foxbit.com.br/exchange)                                                | foxbit             | [FoxBit](https://foxbit.com.br/exchange)                                                | 1   | [API](https://foxbit.com.br/api/)                                                           |                                                                                                                             |                                                                              |
| [![ftx](https://user-images.githubusercontent.com/1294454/67149189-df896480-f2b0-11e9-8816-41593e17f9ec.jpg)](https://ftx.com/#a=1623029)                                                        | ftx                | [FTX](https://ftx.com/#a=1623029)                                                       | *   | [API](https://github.com/ftexchange/ftx)                                                    | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![gateio](https://user-images.githubusercontent.com/1294454/31784029-0313c702-b509-11e7-9ccc-bc0da6a0e435.jpg)](https://www.gate.io/signup/2436035)                                             | gateio             | [Gate.io](https://www.gate.io/signup/2436035)                                           | 2   | [API](https://gate.io/api2)                                                                 |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![gemini](https://user-images.githubusercontent.com/1294454/27816857-ce7be644-6096-11e7-82d6-3c257263229c.jpg)](https://gemini.com/)                                                            | gemini             | [Gemini](https://gemini.com/)                                                           | 1   | [API](https://docs.gemini.com/rest-api)                                                     |                                                                                                                             |                                                                              |
| [![gopax](https://user-images.githubusercontent.com/1294454/102897212-ae8a5e00-4478-11eb-9bab-91507c643900.jpg)](https://www.gopax.co.kr)                                                        | gopax              | [GOPAX](https://www.gopax.co.kr)                                                        | 1   | [API](https://gopax.github.io/API/index.en.html)                                            | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![hbtc](https://user-images.githubusercontent.com/51840849/80134449-70663300-85a7-11ea-8942-e204cdeaab5d.jpg)](https://www.hbtc.com/register/O2S8NS)                                            | hbtc               | [HBTC](https://www.hbtc.com/register/O2S8NS)                                            | 1   | [API](https://github.com/bhexopen/BHEX-OpenApi/tree/master/doc)                             |                                                                                                                             |                                                                              |
| [![hitbtc](https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg)](https://hitbtc.com/?ref_id=5a5d39a65d466)                                       | hitbtc             | [HitBTC](https://hitbtc.com/?ref_id=5a5d39a65d466)                                      | 2   | [API](https://api.hitbtc.com)                                                               |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![hollaex](https://user-images.githubusercontent.com/1294454/75841031-ca375180-5ddd-11ea-8417-b975674c23cb.jpg)](https://pro.hollaex.com/signup?affiliation_code=QSWA6G)                        | hollaex            | [HollaEx](https://pro.hollaex.com/signup?affiliation_code=QSWA6G)                       | 1   | [API](https://apidocs.hollaex.com)                                                          |                                                                                                                             |                                                                              |
| [![huobijp](https://user-images.githubusercontent.com/1294454/85734211-85755480-b705-11ea-8b35-0b7f1db33a2f.jpg)](https://www.huobi.co.jp/register/?invite_code=znnq3)                           | huobijp            | [Huobi Japan](https://www.huobi.co.jp/register/?invite_code=znnq3)                      | 1   | [API](https://api-doc.huobi.co.jp)                                                          |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![huobipro](https://user-images.githubusercontent.com/1294454/76137448-22748a80-604e-11ea-8069-6e389271911d.jpg)](https://www.huobi.com/en-us/topic/invited/?invite_code=rwrd3)                 | huobipro           | [Huobi Pro](https://www.huobi.com/en-us/topic/invited/?invite_code=rwrd3)               | 1   | [API](https://huobiapi.github.io/docs/spot/v1/cn/)                                          |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![ice3x](https://user-images.githubusercontent.com/51840849/87460809-1dd06c00-c616-11ea-98ad-7d5e1cb7fcdd.jpg)](https://ice3x.com?ref=14341802)                                                 | ice3x              | [ICE3X](https://ice3x.com?ref=14341802)                                                 | 1   | [API](https://ice3x.co.za/ice-cubed-bitcoin-exchange-api-documentation-1-june-2017)         |                                                                                                                             |                                                                              |
| [![idex](https://user-images.githubusercontent.com/51840849/94481303-2f222100-01e0-11eb-97dd-bc14c5943a86.jpg)](https://idex.io)                                                                 | idex               | [IDEX](https://idex.io)                                                                 | 2   | [API](https://docs.idex.io/)                                                                | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![independentreserve](https://user-images.githubusercontent.com/51840849/87182090-1e9e9080-c2ec-11ea-8e49-563db9a38f37.jpg)](https://www.independentreserve.com)                                | independentreserve | [Independent Reserve](https://www.independentreserve.com)                               | *   | [API](https://www.independentreserve.com/API)                                               |                                                                                                                             |                                                                              |
| [![indodax](https://user-images.githubusercontent.com/51840849/87070508-9358c880-c221-11ea-8dc5-5391afbbb422.jpg)](https://indodax.com/ref/testbitcoincoid/1)                                    | indodax            | [INDODAX](https://indodax.com/ref/testbitcoincoid/1)                                    | 2.0 | [API](https://github.com/btcid/indodax-official-api-docs)                                   |                                                                                                                             |                                                                              |
| [![itbit](https://user-images.githubusercontent.com/1294454/27822159-66153620-60ad-11e7-89e7-005f6d7f3de0.jpg)](https://www.itbit.com)                                                           | itbit              | [itBit](https://www.itbit.com)                                                          | 1   | [API](https://api.itbit.com/docs)                                                           |                                                                                                                             |                                                                              |
| [![kraken](https://user-images.githubusercontent.com/51840849/76173629-fc67fb00-61b1-11ea-84fe-f2de582f58a3.jpg)](https://www.kraken.com)                                                        | kraken             | [Kraken](https://www.kraken.com)                                                        | 0   | [API](https://www.kraken.com/features/api)                                                  | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![kucoin](https://user-images.githubusercontent.com/51840849/87295558-132aaf80-c50e-11ea-9801-a2fb0c57c799.jpg)](https://www.kucoin.com/?rcode=E5wkqe)                                          | kucoin             | [KuCoin](https://www.kucoin.com/?rcode=E5wkqe)                                          | 2   | [API](https://docs.kucoin.com)                                                              |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![kuna](https://user-images.githubusercontent.com/51840849/87153927-f0578b80-c2c0-11ea-84b6-74612568e9e1.jpg)](https://kuna.io?r=kunaid-gvfihe8az7o4)                                           | kuna               | [Kuna](https://kuna.io?r=kunaid-gvfihe8az7o4)                                           | 2   | [API](https://kuna.io/documents/api)                                                        |                                                                                                                             |                                                                              |
| [![lakebtc](https://user-images.githubusercontent.com/1294454/28074120-72b7c38a-6660-11e7-92d9-d9027502281d.jpg)](https://www.lakebtc.com)                                                       | lakebtc            | [LakeBTC](https://www.lakebtc.com)                                                      | 2   | [API](https://www.lakebtc.com/s/api_v2)                                                     |                                                                                                                             |                                                                              |
| [![latoken](https://user-images.githubusercontent.com/1294454/61511972-24c39f00-aa01-11e9-9f7c-471f1d6e5214.jpg)](https://latoken.com)                                                           | latoken            | [Latoken](https://latoken.com)                                                          | 1   | [API](https://api.latoken.com)                                                              |                                                                                                                             |                                                                              |
| [![lbank](https://user-images.githubusercontent.com/1294454/38063602-9605e28a-3302-11e8-81be-64b1e53c4cfb.jpg)](https://www.lbex.io/invite?icode=7QCY)                                           | lbank              | [LBank](https://www.lbex.io/invite?icode=7QCY)                                          | 1   | [API](https://github.com/LBank-exchange/lbank-official-api-docs)                            |                                                                                                                             |                                                                              |
| [![liquid](https://user-images.githubusercontent.com/1294454/45798859-1a872600-bcb4-11e8-8746-69291ce87b04.jpg)](https://www.liquid.com/sign-up/?affiliate=SbzC62lt30976)                        | liquid             | [Liquid](https://www.liquid.com/sign-up/?affiliate=SbzC62lt30976)                       | 2   | [API](https://developers.liquid.com)                                                        |                                                                                                                             |                                                                              |
| [![luno](https://user-images.githubusercontent.com/1294454/27766607-8c1a69d8-5ede-11e7-930c-540b5eb9be24.jpg)](https://www.luno.com/invite/44893A)                                               | luno               | [luno](https://www.luno.com/invite/44893A)                                              | 1   | [API](https://www.luno.com/en/api)                                                          |                                                                                                                             |                                                                              |
| [![lykke](https://user-images.githubusercontent.com/1294454/34487620-3139a7b0-efe6-11e7-90f5-e520cef74451.jpg)](https://www.lykke.com)                                                           | lykke              | [Lykke](https://www.lykke.com)                                                          | 1   | [API](https://hft-api.lykke.com/swagger/ui/)                                                |                                                                                                                             |                                                                              |
| [![mercado](https://user-images.githubusercontent.com/1294454/27837060-e7c58714-60ea-11e7-9192-f05e86adb83f.jpg)](https://www.mercadobitcoin.com.br)                                             | mercado            | [Mercado Bitcoin](https://www.mercadobitcoin.com.br)                                    | 3   | [API](https://www.mercadobitcoin.com.br/api-doc)                                            |                                                                                                                             |                                                                              |
| [![mixcoins](https://user-images.githubusercontent.com/51840849/87460810-1dd06c00-c616-11ea-9276-956f400d6ffa.jpg)](https://mixcoins.com)                                                        | mixcoins           | [MixCoins](https://mixcoins.com)                                                        | 1   | [API](https://mixcoins.com/help/api/)                                                       |                                                                                                                             |                                                                              |
| [![novadax](https://user-images.githubusercontent.com/1294454/92337550-2b085500-f0b3-11ea-98e7-5794fb07dd3b.jpg)](https://www.novadax.com.br/?s=ccxt)                                            | novadax            | [NovaDAX](https://www.novadax.com.br/?s=ccxt)                                           | 1   | [API](https://doc.novadax.com/pt-BR/)                                                       |                                                                                                                             |                                                                              |
| [![oceanex](https://user-images.githubusercontent.com/1294454/58385970-794e2d80-8001-11e9-889c-0567cd79b78e.jpg)](https://oceanex.pro/signup?referral=VE24QX)                                    | oceanex            | [OceanEx](https://oceanex.pro/signup?referral=VE24QX)                                   | 1   | [API](https://api.oceanex.pro/doc/v1)                                                       |                                                                                                                             |                                                                              |
| [![okcoin](https://user-images.githubusercontent.com/51840849/87295551-102fbf00-c50e-11ea-90a9-462eebba5829.jpg)](https://www.okcoin.com/account/register?flag=activity&channelId=600001513)     | okcoin             | [OKCoin](https://www.okcoin.com/account/register?flag=activity&channelId=600001513)     | 3   | [API](https://www.okcoin.com/docs/en/)                                                      |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![okex](https://user-images.githubusercontent.com/1294454/32552768-0d6dd3c6-c4a6-11e7-90f8-c043b64756a7.jpg)](https://www.okex.com/join/1888677)                                                | okex               | [OKEX](https://www.okex.com/join/1888677)                                               | 3   | [API](https://www.okex.com/docs/en/)                                                        |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![paymium](https://user-images.githubusercontent.com/51840849/87153930-f0f02200-c2c0-11ea-9c0a-40337375ae89.jpg)](https://www.paymium.com/page/sign-up?referral=eDAzPoRQFMvaAB8sf-qj)           | paymium            | [Paymium](https://www.paymium.com/page/sign-up?referral=eDAzPoRQFMvaAB8sf-qj)           | 1   | [API](https://github.com/Paymium/api-documentation)                                         |                                                                                                                             |                                                                              |
| [![phemex](https://user-images.githubusercontent.com/1294454/85225056-221eb600-b3d7-11ea-930d-564d2690e3f6.jpg)](https://phemex.com/register?referralCode=EDNVJ)                                 | phemex             | [Phemex](https://phemex.com/register?referralCode=EDNVJ)                                | 1   | [API](https://github.com/phemex/phemex-api-docs)                                            |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![poloniex](https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg)](https://poloniex.com/signup?c=UBFZJRPJ)                                       | poloniex           | [Poloniex](https://poloniex.com/signup?c=UBFZJRPJ)                                      | *   | [API](https://docs.poloniex.com)                                                            |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![probit](https://user-images.githubusercontent.com/51840849/79268032-c4379480-7ea2-11ea-80b3-dd96bb29fd0d.jpg)](https://www.probit.com/r/34608773)                                             | probit             | [ProBit](https://www.probit.com/r/34608773)                                             | 1   | [API](https://docs-en.probit.com)                                                           |                                                                                                                             |                                                                              |
| [![qtrade](https://user-images.githubusercontent.com/51840849/80491487-74a99c00-896b-11ea-821e-d307e832f13e.jpg)](https://qtrade.io/?ref=BKOQWVFGRH2C)                                           | qtrade             | [qTrade](https://qtrade.io/?ref=BKOQWVFGRH2C)                                           | 1   | [API](https://qtrade-exchange.github.io/qtrade-docs)                                        |                                                                                                                             |                                                                              |
| [![rightbtc](https://user-images.githubusercontent.com/51840849/87182092-1f372700-c2ec-11ea-8f9e-01b4d3ff8941.jpg)](https://www.rightbtc.com)                                                    | rightbtc           | [RightBTC](https://www.rightbtc.com)                                                    | *   | [API](https://docs.rightbtc.com/api/)                                                       |                                                                                                                             |                                                                              |
| [![ripio](https://user-images.githubusercontent.com/1294454/94507548-a83d6a80-0218-11eb-9998-28b9cec54165.jpg)](https://exchange.ripio.com)                                                      | ripio              | [Ripio](https://exchange.ripio.com)                                                     | 1   | [API](https://exchange.ripio.com/en/api/)                                                   |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![southxchange](https://user-images.githubusercontent.com/1294454/27838912-4f94ec8a-60f6-11e7-9e5d-bbf9bd50a559.jpg)](https://www.southxchange.com)                                             | southxchange       | [SouthXchange](https://www.southxchange.com)                                            | *   | [API](https://www.southxchange.com/Home/Api)                                                |                                                                                                                             |                                                                              |
| [![stex](https://user-images.githubusercontent.com/1294454/69680782-03fd0b80-10bd-11ea-909e-7f603500e9cc.jpg)](https://app.stex.com?ref=36416021)                                                | stex               | [STEX](https://app.stex.com?ref=36416021)                                               | 3   | [API](https://help.stex.com/en/collections/1593608-api-v3-documentation)                    |                                                                                                                             |                                                                              |
| [![surbitcoin](https://user-images.githubusercontent.com/1294454/27991511-f0a50194-6481-11e7-99b5-8f02932424cc.jpg)](https://surbitcoin.com)                                                     | surbitcoin         | [SurBitcoin](https://surbitcoin.com)                                                    | 1   | [API](https://blinktrade.com/docs)                                                          |                                                                                                                             |                                                                              |
| [![therock](https://user-images.githubusercontent.com/1294454/27766869-75057fa2-5ee9-11e7-9a6f-13e641fa4707.jpg)](https://therocktrading.com)                                                    | therock            | [TheRockTrading](https://therocktrading.com)                                            | 1   | [API](https://api.therocktrading.com/doc/v1/index.html)                                     |                                                                                                                             |                                                                              |
| [![tidebit](https://user-images.githubusercontent.com/51840849/87460811-1e690280-c616-11ea-8652-69f187305add.jpg)](http://bit.ly/2IX0LrM)                                                        | tidebit            | [TideBit](http://bit.ly/2IX0LrM)                                                        | 2   | [API](https://www.tidebit.com/documents/api/guide)                                          |                                                                                                                             |                                                                              |
| [![tidex](https://user-images.githubusercontent.com/1294454/30781780-03149dc4-a12e-11e7-82bb-313b269d24d4.jpg)](https://tidex.com/exchange/?ref=57f5638d9cd7)                                    | tidex              | [Tidex](https://tidex.com/exchange/?ref=57f5638d9cd7)                                   | 3   | [API](https://tidex.com/exchange/public-api)                                                |                                                                                                                             |                                                                              |
| [![timex](https://user-images.githubusercontent.com/1294454/70423869-6839ab00-1a7f-11ea-8f94-13ae72c31115.jpg)](https://timex.io/?refcode=1x27vNkTbP1uwkCck)                                     | timex              | [TimeX](https://timex.io/?refcode=1x27vNkTbP1uwkCck)                                    | 1   | [API](https://docs.timex.io)                                                                |                                                                                                                             |                                                                              |
| [![upbit](https://user-images.githubusercontent.com/1294454/49245610-eeaabe00-f423-11e8-9cba-4b0aed794799.jpg)](https://upbit.com)                                                               | upbit              | [Upbit](https://upbit.com)                                                              | 1   | [API](https://docs.upbit.com/docs/%EC%9A%94%EC%B2%AD-%EC%88%98-%EC%A0%9C%ED%95%9C)          |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![vaultoro](https://user-images.githubusercontent.com/1294454/27766880-f205e870-5ee9-11e7-8fe2-0d5b15880752.jpg)](https://www.vaultoro.com)                                                     | vaultoro           | [Vaultoro](https://www.vaultoro.com)                                                    | 1   | [API](https://api.vaultoro.com)                                                             |                                                                                                                             |                                                                              |
| [![vbtc](https://user-images.githubusercontent.com/1294454/27991481-1f53d1d8-6481-11e7-884e-21d17e7939db.jpg)](https://vbtc.exchange)                                                            | vbtc               | [VBTC](https://vbtc.exchange)                                                           | 1   | [API](https://blinktrade.com/docs)                                                          |                                                                                                                             |                                                                              |
| [![vcc](https://user-images.githubusercontent.com/1294454/100545356-8427f500-326c-11eb-9539-7d338242d61b.jpg)](https://vcc.exchange?ref=l4xhrH)                                                  | vcc                | [VCC Exchange](https://vcc.exchange?ref=l4xhrH)                                         | 3   | [API](https://vcc.exchange/api)                                                             |                                                                                                                             |                                                                              |
| [![wavesexchange](https://user-images.githubusercontent.com/1294454/84547058-5fb27d80-ad0b-11ea-8711-78ac8b3c7f31.jpg)](https://waves.exchange)                                                  | wavesexchange      | [Waves.Exchange](https://waves.exchange)                                                | *   | [API](https://docs.waves.exchange)                                                          | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) |                                                                              |
| [![whitebit](https://user-images.githubusercontent.com/1294454/66732963-8eb7dd00-ee66-11e9-849b-10d9282bb9e0.jpg)](https://whitebit.com/referral/d9bdf40e-28f2-4b52-b2f9-cd1415d82963)           | whitebit           | [WhiteBit](https://whitebit.com/referral/d9bdf40e-28f2-4b52-b2f9-cd1415d82963)          | 2   | [API](https://documenter.getpostman.com/view/7473075/Szzj8dgv?version=latest)               |                                                                                                                             |                                                                              |
| [![xbtce](https://user-images.githubusercontent.com/1294454/28059414-e235970c-662c-11e7-8c3a-08e31f78684b.jpg)](https://xbtce.com/?agent=XX97BTCXXXG687021000B)                                  | xbtce              | [xBTCe](https://xbtce.com/?agent=XX97BTCXXXG687021000B)                                 | 1   | [API](https://www.xbtce.com/tradeapi)                                                       |                                                                                                                             |                                                                              |
| [![xena](https://user-images.githubusercontent.com/51840849/87489843-bb469280-c64c-11ea-91aa-69c6326506af.jpg)](https://xena.exchange)                                                           | xena               | [Xena Exchange](https://xena.exchange)                                                  | *   | [API](https://support.xena.exchange/support/solutions/44000808700)                          | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) |                                                                              |
| [![yobit](https://user-images.githubusercontent.com/1294454/27766910-cdcbfdae-5eea-11e7-9859-03fea873272d.jpg)](https://www.yobit.net)                                                           | yobit              | [YoBit](https://www.yobit.net)                                                          | 3   | [API](https://www.yobit.net/en/api/)                                                        |                                                                                                                             |                                                                              |
| [![zaif](https://user-images.githubusercontent.com/1294454/27766927-39ca2ada-5eeb-11e7-972f-1b4199518ca6.jpg)](https://zaif.jp)                                                                  | zaif               | [Zaif](https://zaif.jp)                                                                 | 1   | [API](https://techbureau-api-document.readthedocs.io/ja/latest/index.html)                  |                                                                                                                             |                                                                              |
| [![zb](https://user-images.githubusercontent.com/1294454/32859187-cd5214f0-ca5e-11e7-967d-96568e2e2bd1.jpg)](https://www.zb.com)                                                                 | zb                 | [ZB](https://www.zb.com)                                                                | 1   | [API](https://www.zb.com/i/developer)                                                       |                                                                                                                             |                                                                              |

The list above is updated frequently, new crypto markets, exchanges, bug fixes, and API endpoints are introduced on a regular basis. See the [Manual](https://github.com/ccxt/ccxt/wiki) for more details. If you can't find a cryptocurrency exchange in the list above and want it to be added, post a link to it by opening an issue here on GitHub or send us an email.

The library is under [MIT license](https://github.com/ccxt/ccxt/blob/master/LICENSE.txt), that means it's absolutely free for any developer to build commercial and opensource software on top of it, but use it at your own risk with no warranties, as is.

---

## Install

The easiest way to install the CCXT library is to use a package manager:

- [ccxt in **NPM**](https://www.npmjs.com/package/ccxt) (JavaScript / Node v7.6+)
- [ccxt in **PyPI**](https://pypi.python.org/pypi/ccxt) (Python 3.5.3+)
- [ccxt in **Packagist/Composer**](https://packagist.org/packages/ccxt/ccxt) (PHP 5.4+)

This library is shipped as an all-in-one module implementation with minimalistic dependencies and requirements:

- [`js/`](https://github.com/ccxt/ccxt/blob/master/js/) in JavaScript
- [`python/`](https://github.com/ccxt/ccxt/blob/master/python/) in Python (generated from JS)
- [`php/`](https://github.com/ccxt/ccxt/blob/master/php/) in PHP (generated from JS)

You can also clone it into your project directory from [ccxt GitHub repository](https://github.com/ccxt/ccxt):

```shell
git clone https://github.com/ccxt/ccxt.git
```

### JavaScript (NPM)

JavaScript version of CCXT works in both Node and web browsers. Requires ES6 and `async/await` syntax support (Node 7.6.0+). When compiling with Webpack and Babel, make sure it is [not excluded](https://github.com/ccxt/ccxt/issues/225#issuecomment-331905178) in your `babel-loader` config.

[ccxt in **NPM**](https://www.npmjs.com/package/ccxt)

```shell
npm install ccxt
```

```JavaScript
var ccxt = require ('ccxt')

console.log (ccxt.exchanges) // print all available exchanges
```

### JavaScript (for use with the `<script>` tag):

All-in-one browser bundle (dependencies included), served from a CDN of your choice:

* jsDelivr: https://cdn.jsdelivr.net/npm/ccxt@1.41.82/dist/ccxt.browser.js
* unpkg: https://unpkg.com/ccxt@1.41.82/dist/ccxt.browser.js

CDNs are not updated in real-time and may have delays. Defaulting to the most recent version without specifying the version number is not recommended. Please, keep in mind that we are not responsible for the correct operation of those CDN servers.

```HTML
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/ccxt@1.41.82/dist/ccxt.browser.js"></script>
```

Creates a global `ccxt` object:

```JavaScript
console.log (ccxt.exchanges) // print all available exchanges
```

### Python

[ccxt in **PyPI**](https://pypi.python.org/pypi/ccxt)

```shell
pip install ccxt
```

```Python
import ccxt
print(ccxt.exchanges) # print a list of all available exchange classes
```

The library supports concurrent asynchronous mode with asyncio and async/await in Python 3.5.3+

```Python
import ccxt.async_support as ccxt # link against the asynchronous version of ccxt
```

### PHP

[ccxt in PHP with **Packagist/Composer**](https://packagist.org/packages/ccxt/ccxt) (PHP 5.4+)

It requires common PHP modules:

- cURL
- mbstring (using UTF-8 is highly recommended)
- PCRE
- iconv
- gmp (this is a built-in extension as of PHP 7.2+)

```PHP
include "ccxt.php";
var_dump (\ccxt\Exchange::$exchanges); // print a list of all available exchange classes
```

The library supports concurrent asynchronous mode using tools from [RecoilPHP](https://github.com/recoilphp/recoil) and [ReactPHP](https://reactphp.org/) in PHP 7.1+. Read the [Manual](https://github.com/ccxt/ccxt/wiki) for more details.

### Docker

You can get CCXT installed in a container along with all the supported languages and dependencies. This may be useful if you want to contribute to CCXT (e.g. run the build scripts and tests — please see the [Contributing](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) document for the details on that).

Using `docker-compose` (in the cloned CCXT repository):

```shell
docker-compose run --rm ccxt
```

You don't need the Docker image if you're not going to develop CCXT. If you just want to use CCXT – just install it as a regular package into your project.

---

## Documentation

Read the [Manual](https://github.com/ccxt/ccxt/wiki) for more details.

## Usage

### Intro

The CCXT library consists of a public part and a private part. Anyone can use the public part immediately after installation. Public APIs provide unrestricted access to public information for all exchange markets without the need to register a user account or have an API key.

Public APIs include the following:

- market data
- instruments/trading pairs
- price feeds (exchange rates)
- order books
- trade history
- tickers
- OHLC(V) for charting
- other public endpoints

In order to trade with private APIs you need to obtain API keys from an exchange's website. It usually means signing up to the exchange and creating API keys for your account. Some exchanges require personal info or identification. Sometimes verification may be necessary as well. In this case you will need to register yourself, this library will not create accounts or API keys for you. Some exchanges expose API endpoints for registering an account, but most exchanges don't. You will have to sign up and create API keys on their websites.

Private APIs allow the following:

- manage personal account info
- query account balances
- trade by making market and limit orders
- deposit and withdraw fiat and crypto funds
- query personal orders
- get ledger history
- transfer funds between accounts
- use merchant services

This library implements full public and private REST APIs for all exchanges. WebSocket and FIX implementations in JavaScript, PHP, Python are available in [CCXT Pro](https://ccxt.pro), which is a professional addon to CCXT with support for WebSocket streams.

The CCXT library supports both camelcase notation (preferred in JavaScript) and underscore notation (preferred in Python and PHP), therefore all methods can be called in either notation or coding style in any language.

```JavaScript
// both of these notations work in JavaScript/Python/PHP
exchange.methodName ()  // camelcase pseudocode
exchange.method_name () // underscore pseudocode
```

Read the [Manual](https://github.com/ccxt/ccxt/wiki) for more details.

### JavaScript

```JavaScript
'use strict';
const ccxt = require ('ccxt');

(async function () {
    let kraken    = new ccxt.kraken ()
    let bitfinex  = new ccxt.bitfinex ({ verbose: true })
    let huobipro  = new ccxt.huobipro ()
    let okcoinusd = new ccxt.okcoinusd ({
        apiKey: 'YOUR_PUBLIC_API_KEY',
        secret: 'YOUR_SECRET_PRIVATE_KEY',
    })

    const exchangeId = 'binance'
        , exchangeClass = ccxt[exchangeId]
        , exchange = new exchangeClass ({
            'apiKey': 'YOUR_API_KEY',
            'secret': 'YOUR_SECRET',
            'timeout': 30000,
            'enableRateLimit': true,
        })

    console.log (kraken.id,    await kraken.loadMarkets ())
    console.log (bitfinex.id,  await bitfinex.loadMarkets  ())
    console.log (huobipro.id,  await huobipro.loadMarkets ())

    console.log (kraken.id,    await kraken.fetchOrderBook (kraken.symbols[0]))
    console.log (bitfinex.id,  await bitfinex.fetchTicker ('BTC/USD'))
    console.log (huobipro.id,  await huobipro.fetchTrades ('ETH/USDT'))

    console.log (okcoinusd.id, await okcoinusd.fetchBalance ())

    // sell 1 BTC/USD for market price, sell a bitcoin for dollars immediately
    console.log (okcoinusd.id, await okcoinusd.createMarketSellOrder ('BTC/USD', 1))

    // buy 1 BTC/USD for $2500, you pay $2500 and receive ฿1 when the order is closed
    console.log (okcoinusd.id, await okcoinusd.createLimitBuyOrder ('BTC/USD', 1, 2500.00))

    // pass/redefine custom exchange-specific order params: type, amount, price or whatever
    // use a custom order type
    bitfinex.createLimitSellOrder ('BTC/USD', 1, 10, { 'type': 'trailing-stop' })

}) ();
```

### Python

```Python
# coding=utf-8

import ccxt

hitbtc   = ccxt.hitbtc({'verbose': True})
bitmex   = ccxt.bitmex()
huobipro = ccxt.huobipro()
exmo     = ccxt.exmo({
    'apiKey': 'YOUR_PUBLIC_API_KEY',
    'secret': 'YOUR_SECRET_PRIVATE_KEY',
})
kraken = ccxt.kraken({
    'apiKey': 'YOUR_PUBLIC_API_KEY',
    'secret': 'YOUR_SECRET_PRIVATE_KEY',
})

exchange_id = 'binance'
exchange_class = getattr(ccxt, exchange_id)
exchange = exchange_class({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
    'timeout': 30000,
    'enableRateLimit': True,
})

hitbtc_markets = hitbtc.load_markets()

print(hitbtc.id, hitbtc_markets)
print(bitmex.id, bitmex.load_markets())
print(huobipro.id, huobipro.load_markets())

print(hitbtc.fetch_order_book(hitbtc.symbols[0]))
print(bitmex.fetch_ticker('BTC/USD'))
print(huobipro.fetch_trades('LTC/USDT'))

print(exmo.fetch_balance())

# sell one ฿ for market price and receive $ right now
print(exmo.id, exmo.create_market_sell_order('BTC/USD', 1))

# limit buy BTC/EUR, you pay €2500 and receive ฿1  when the order is closed
print(exmo.id, exmo.create_limit_buy_order('BTC/EUR', 1, 2500.00))

# pass/redefine custom exchange-specific order params: type, amount, price, flags, etc...
kraken.create_market_buy_order('BTC/USD', 1, {'trading_agreement': 'agree'})
```

### PHP

```PHP
include 'ccxt.php';

$poloniex = new \ccxt\poloniex ();
$bittrex  = new \ccxt\bittrex  (array ('verbose' => true));
$quoinex  = new \ccxt\quoinex   ();
$zaif     = new \ccxt\zaif     (array (
    'apiKey' => 'YOUR_PUBLIC_API_KEY',
    'secret' => 'YOUR_SECRET_PRIVATE_KEY',
));
$hitbtc   = new \ccxt\hitbtc   (array (
    'apiKey' => 'YOUR_PUBLIC_API_KEY',
    'secret' => 'YOUR_SECRET_PRIVATE_KEY',
));

$exchange_id = 'binance';
$exchange_class = "\\ccxt\\$exchange_id";
$exchange = new $exchange_class (array (
    'apiKey' => 'YOUR_API_KEY',
    'secret' => 'YOUR_SECRET',
    'timeout' => 30000,
    'enableRateLimit' => true,
));

$poloniex_markets = $poloniex->load_markets ();

var_dump ($poloniex_markets);
var_dump ($bittrex->load_markets ());
var_dump ($quoinex->load_markets ());

var_dump ($poloniex->fetch_order_book ($poloniex->symbols[0]));
var_dump ($bittrex->fetch_trades ('BTC/USD'));
var_dump ($quoinex->fetch_ticker ('ETH/EUR'));
var_dump ($zaif->fetch_ticker ('BTC/JPY'));

var_dump ($zaif->fetch_balance ());

// sell 1 BTC/JPY for market price, you pay ¥ and receive ฿ immediately
var_dump ($zaif->id, $zaif->create_market_sell_order ('BTC/JPY', 1));

// buy BTC/JPY, you receive ฿1 for ¥285000 when the order closes
var_dump ($zaif->id, $zaif->create_limit_buy_order ('BTC/JPY', 1, 285000));

// set a custom user-defined id to your order
$hitbtc->create_order ('BTC/USD', 'limit', 'buy', 1, 3000, array ('clientOrderId' => '123'));
```

## Contributing

Please read the [CONTRIBUTING](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) document before making changes that you would like adopted in the code. Also, read the [Manual](https://github.com/ccxt/ccxt/wiki) for more details.

## Support Developer Team

We are investing a significant amount of time into the development of this library. If CCXT made your life easier and you want to help us improve it further, or if you want to speed up development of new features and exchanges, please support us with a tip. We appreciate all contributions!

### Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website.

[[Become a sponsor](https://opencollective.com/ccxt#sponsor)]

<a href="https://opencollective.com/ccxt/tiers/sponsor/0/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/1/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/2/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/3/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/4/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/5/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/6/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/7/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/8/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/sponsor/9/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/sponsor/9/avatar.svg"></a>

### Supporters

Support this project by becoming a supporter. Your avatar will show up here with a link to your website.

[[Become a supporter](https://opencollective.com/ccxt#supporter)]

<a href="https://opencollective.com/ccxt/tiers/supporter/0/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/0/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/1/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/1/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/2/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/2/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/3/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/3/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/4/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/4/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/5/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/5/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/6/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/6/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/7/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/7/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/8/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/8/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/tiers/supporter/9/website" target="_blank"><img src="https://opencollective.com/ccxt/tiers/supporter/9/avatar.svg"></a>

### Backers

Thank you to all our backers! [[Become a backer](https://opencollective.com/ccxt#backer)]

<a href="https://opencollective.com/ccxt#backers" target="_blank"><img src="https://opencollective.com/ccxt/tiers/backer.svg?width=890"></a>

Thank you!

## Social

- [Follow us on Twitter](https://twitter.com/ccxt_official)
- [Read our blog on Medium](https://medium.com/@ccxt)
- <sub><sub>[![Discord](https://img.shields.io/discord/690203284119617602?logo=discord&logoColor=white)](https://discord.gg/dhzSKYU)</sub></sub>

## Contact Us

For business inquiries: info@ccxt.trade
