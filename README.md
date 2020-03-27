# CCXT – CryptoCurrency eXchange Trading Library

[![Build Status](https://travis-ci.org/ccxt/ccxt.svg?branch=master)](https://travis-ci.org/ccxt/ccxt) [![npm](https://img.shields.io/npm/v/ccxt.svg)](https://npmjs.com/package/ccxt) [![PyPI](https://img.shields.io/pypi/v/ccxt.svg)](https://pypi.python.org/pypi/ccxt) [![NPM Downloads](https://img.shields.io/npm/dm/ccxt.svg)](https://www.npmjs.com/package/ccxt) [![Discord](https://img.shields.io/discord/690203284119617602?logo=discord&logoColor=white)](https://discord.gg/dhzSKYU) [![Supported Exchanges](https://img.shields.io/badge/exchanges-124-blue.svg)](https://github.com/ccxt/ccxt/wiki/Exchange-Markets) [![Open Collective](https://opencollective.com/ccxt/backers/badge.svg)](https://opencollective.com/ccxt)
[![Twitter Follow](https://img.shields.io/twitter/follow/ccxt_official.svg?style=social&label=CCXT)](https://twitter.com/ccxt_official)

A JavaScript / Python / PHP library for cryptocurrency trading and e-commerce with support for many bitcoin/ether/altcoin exchange markets and merchant APIs.

### [Install](#install) · [Usage](#usage) · [Manual](https://github.com/ccxt/ccxt/wiki) · [FAQ](https://github.com/ccxt/ccxt/wiki/FAQ) · [Examples](https://github.com/ccxt/ccxt/tree/master/examples) · [Contributing](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) · [Social](#social)

The **CCXT** library is used to connect and trade with cryptocurrency exchanges and payment processing services worldwide. It provides quick access to market data for storage, analysis, visualization, indicator development, algorithmic trading, strategy backtesting, bot programming, and related software engineering.

It is intended to be used by **coders, developers, technically-skilled traders, data-scientists and financial analysts** for building trading algorithms.

Current feature list:

- support for many cryptocurrency exchanges — more coming soon
- fully implemented public and private APIs
- optional normalized data for cross-exchange analytics and arbitrage
- an out of the box unified API that is extremely easy to integrate
- works in Node 7.6+, Python 2 and 3, PHP 5.4+, and web browsers

## Sponsored Promotion

[![CCXT Pro – A JavaScript / Python / PHP cryptocurrency trading API for professionals](https://user-images.githubusercontent.com/1294454/75626315-a5718d00-5bd7-11ea-8188-9381ba1cc866.png)](https://ccxt.pro)

## See Also

- <sub>[![Nomics API](https://user-images.githubusercontent.com/1294454/53875704-2ffbcc80-4016-11e9-828b-337409955609.png)](https://p.nomics.com/cryptocurrency-bitcoin-api)</sub>&nbsp; **[Nomics API](https://p.nomics.com/cryptocurrency-bitcoin-api)**&nbsp;&mdash;&nbsp;enterprise-grade [crypto market cap & pricing data](https://nomics.com) API for your fund, smart contract, or app.
- <sub>[![Quadency](https://user-images.githubusercontent.com/1294454/69334382-a0618100-0c6b-11ea-9ba9-40aa97440cfa.png)](https://quadency.com?utm_source=ccxt)</sub>&nbsp; **[Quadency](https://quadency.com?utm_source=ccxt)**&nbsp;&mdash;&nbsp;professional crypto terminal, algo trading, and unified streaming APIs.
- <sub>[![TabTrader](https://user-images.githubusercontent.com/1294454/66755907-9c3e8880-eea1-11e9-846e-0bff349ceb87.png)](https://tab-trader.com/?utm_source=ccxt)</sub>&nbsp; **[TabTrader](https://tab-trader.com/?utm_source=ccxt)**&nbsp;&mdash;&nbsp;trading on all exchanges in one app. Avaliable on [Android](https://play.google.com/store/apps/details?id=com.tabtrader.android&referrer=utm_source%3Dccxt) and [iOS](https://itunes.apple.com/app/apple-store/id1095716562?mt=8).


## Certified Cryptocurrency Exchanges


|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;logo&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;                                                                                         | id        | name                                                                     | ver | doc                                                                                | certified                                                                                                                   | pro                                                                         |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|--------------------------------------------------------------------------|:---:|:----------------------------------------------------------------------------------:|-----------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|
|[![binance](https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg)](https://www.binance.com/?ref=10205187)                         | binance   | [Binance](https://www.binance.com/?ref=10205187)                         | *   | [API](https://binance-docs.github.io/apidocs/spot/en)                              | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![bitfinex](https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg)](https://www.bitfinex.com/?refcode=P61eYxFL)                   | bitfinex  | [Bitfinex](https://www.bitfinex.com/?refcode=P61eYxFL)                   | 1   | [API](https://docs.bitfinex.com/v1/docs)                                           | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![bittrex](https://user-images.githubusercontent.com/1294454/27766352-cf0b3c26-5ed5-11e7-82b7-f3826b7a97d8.jpg)](https://bittrex.com/Account/Register?referralCode=1ZE-G0G-M3B) | bittrex   | [Bittrex](https://bittrex.com/Account/Register?referralCode=1ZE-G0G-M3B) | 1.1 | [API](https://bittrex.github.io/api/)                                              | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![bytetrade](https://user-images.githubusercontent.com/1294454/67288762-2f04a600-f4e6-11e9-9fd6-c60641919491.jpg)](https://www.bytetrade.com)                                   | bytetrade | [ByteTrade](https://www.bytetrade.com)                                   | *   | [API](https://github.com/Bytetrade/bytetrade-official-api-docs/wiki)               | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) |                                                                             |
|[![ftx](https://user-images.githubusercontent.com/1294454/67149189-df896480-f2b0-11e9-8816-41593e17f9ec.jpg)](https://ftx.com/#a=1623029)                                        | ftx       | [FTX](https://ftx.com/#a=1623029)                                        | *   | [API](https://github.com/ftexchange/ftx)                                           | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) |                                                                             |
|[![idex](https://user-images.githubusercontent.com/1294454/63693236-3415e380-c81c-11e9-8600-ba1634f1407d.jpg)](https://idex.market)                                              | idex      | [IDEX](https://idex.market)                                              | *   | [API](https://docs.idex.market/)                                                   | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) |                                                                             |
|[![kraken](https://user-images.githubusercontent.com/51840849/76173629-fc67fb00-61b1-11ea-84fe-f2de582f58a3.jpg)](https://www.kraken.com)                                        | kraken    | [Kraken](https://www.kraken.com)                                         | 0   | [API](https://www.kraken.com/features/api)                                         | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![poloniex](https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg)](https://www.poloniex.com/?utm_source=ccxt&utm_medium=web)     | poloniex  | [Poloniex](https://www.poloniex.com/?utm_source=ccxt&utm_medium=web)     | *   | [API](https://docs.poloniex.com)                                                   | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![upbit](https://user-images.githubusercontent.com/1294454/49245610-eeaabe00-f423-11e8-9cba-4b0aed794799.jpg)](https://upbit.com)                                               | upbit     | [Upbit](https://upbit.com)                                               | 1   | [API](https://docs.upbit.com/docs/%EC%9A%94%EC%B2%AD-%EC%88%98-%EC%A0%9C%ED%95%9C) | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|

## Supported Cryptocurrency Exchange Markets

The CCXT library currently supports the following 122 cryptocurrency exchange markets and trading APIs:

|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;logo&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;                                                                                                     | id                 | name                                                                                 | ver | doc                                                                                          | certified                                                                                                                   | pro                                                                         |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------|--------------------------------------------------------------------------------------|:---:|:--------------------------------------------------------------------------------------------:|-----------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|
|[![_1btcxe](https://user-images.githubusercontent.com/1294454/27766049-2b294408-5ecc-11e7-85cc-adaff013dc1a.jpg)](https://1btcxe.com)                                                        | _1btcxe            | [1BTCXE](https://1btcxe.com)                                                         | *   | [API](https://1btcxe.com/api-docs.php)                                                       |                                                                                                                             |                                                                             |
|[![acx](https://user-images.githubusercontent.com/1294454/30247614-1fe61c74-9621-11e7-9e8c-f1a627afa279.jpg)](https://acx.io)                                                                | acx                | [ACX](https://acx.io)                                                                | 2   | [API](https://acx.io/documents/api_v2)                                                       |                                                                                                                             |                                                                             |
|[![adara](https://user-images.githubusercontent.com/1294454/49189583-0466a780-f380-11e8-9248-57a631aad2d6.jpg)](https://adara.io)                                                            | adara              | [Adara](https://adara.io)                                                            | 1   | [API](https://api.adara.io/v1)                                                               |                                                                                                                             |                                                                             |
|[![anxpro](https://user-images.githubusercontent.com/1294454/27765983-fd8595da-5ec9-11e7-82e3-adb3ab8c2612.jpg)](https://anxpro.com)                                                         | anxpro             | [ANXPro](https://anxpro.com)                                                         | *   | [API](https://anxv2.docs.apiary.io)                                                          |                                                                                                                             |                                                                             |
|[![aofex](https://user-images.githubusercontent.com/51840849/77670271-056d1080-6f97-11ea-9ac2-4268e9ed0c1f.jpg)](https://aofex.com/#/register?key=9763840)                                   | aofex              | [AOFEX](https://aofex.com/#/register?key=9763840)                                    | *   | [API](https://aofex.zendesk.com/hc/en-us/sections/360005576574-API)                          |                                                                                                                             |                                                                             |
|[![bcex](https://user-images.githubusercontent.com/51840849/77231516-851c6900-6bac-11ea-8fd6-ee5c23eddbd4.jpg)](https://www.bcex.top/register?invite_code=758978&lang=en)                    | bcex               | [BCEX](https://www.bcex.top/register?invite_code=758978&lang=en)                     | 1   | [API](https://github.com/BCEX-TECHNOLOGY-LIMITED/API_Docs/wiki/Interface)                    |                                                                                                                             |                                                                             |
|[![bequant](https://user-images.githubusercontent.com/1294454/55248342-a75dfe00-525a-11e9-8aa2-05e9dca943c6.jpg)](https://bequant.io)                                                        | bequant            | [Bequant](https://bequant.io)                                                        | 2   | [API](https://api.bequant.io/)                                                               |                                                                                                                             |                                                                             |
|[![bibox](https://user-images.githubusercontent.com/51840849/77257418-3262b000-6c85-11ea-8fb8-20bdf20b3592.jpg)](https://w2.bibox.com/login/register?invite_code=05Kj3I)                     | bibox              | [Bibox](https://w2.bibox.com/login/register?invite_code=05Kj3I)                      | 1   | [API](https://biboxcom.github.io/en/)                                                        |                                                                                                                             |                                                                             |
|[![bigone](https://user-images.githubusercontent.com/1294454/69354403-1d532180-0c91-11ea-88ed-44c06cefdf87.jpg)](https://b1.run/users/new?code=D3LLBVFT)                                     | bigone             | [BigONE](https://b1.run/users/new?code=D3LLBVFT)                                     | 3   | [API](https://open.big.one/docs/api.html)                                                    |                                                                                                                             |                                                                             |
|[![binance](https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg)](https://www.binance.com/?ref=10205187)                                     | binance            | [Binance](https://www.binance.com/?ref=10205187)                                     | *   | [API](https://binance-docs.github.io/apidocs/spot/en)                                        | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![binanceje](https://user-images.githubusercontent.com/1294454/54874009-d526eb00-4df3-11e9-928c-ce6a2b914cd1.jpg)](https://www.binance.je/?ref=35047921)                                    | binanceje          | [Binance Jersey](https://www.binance.je/?ref=35047921)                               | *   | [API](https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md) |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![binanceus](https://user-images.githubusercontent.com/1294454/65177307-217b7c80-da5f-11e9-876e-0b748ba0a358.jpg)](https://www.binance.us/?ref=35005074)                                    | binanceus          | [Binance US](https://www.binance.us/?ref=35005074)                                   | *   | [API](https://github.com/binance-us/binance-official-api-docs)                               |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![bit2c](https://user-images.githubusercontent.com/1294454/27766119-3593220e-5ece-11e7-8b3a-5a041f6bcc3f.jpg)](https://bit2c.co.il/Aff/63bfed10-e359-420c-ab5a-ad368dab0baf)                | bit2c              | [Bit2C](https://bit2c.co.il/Aff/63bfed10-e359-420c-ab5a-ad368dab0baf)                | *   | [API](https://www.bit2c.co.il/home/api)                                                      |                                                                                                                             |                                                                             |
|[![bitbank](https://user-images.githubusercontent.com/1294454/37808081-b87f2d9c-2e59-11e8-894d-c1900b7584fe.jpg)](https://bitbank.cc/)                                                       | bitbank            | [bitbank](https://bitbank.cc/)                                                       | 1   | [API](https://docs.bitbank.cc/)                                                              |                                                                                                                             |                                                                             |
|[![bitbay](https://user-images.githubusercontent.com/1294454/27766132-978a7bd8-5ece-11e7-9540-bc96d1e9bbb8.jpg)](https://auth.bitbay.net/ref/jHlbB4mIkdS1)                                   | bitbay             | [BitBay](https://auth.bitbay.net/ref/jHlbB4mIkdS1)                                   | *   | [API](https://bitbay.net/public-api)                                                         |                                                                                                                             |                                                                             |
|[![bitfinex](https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg)](https://www.bitfinex.com/?refcode=P61eYxFL)                               | bitfinex           | [Bitfinex](https://www.bitfinex.com/?refcode=P61eYxFL)                               | 1   | [API](https://docs.bitfinex.com/v1/docs)                                                     | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![bitfinex2](https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg)](https://www.bitfinex.com/?refcode=P61eYxFL)                              | bitfinex2          | [Bitfinex](https://www.bitfinex.com/?refcode=P61eYxFL)                               | 2   | [API](https://docs.bitfinex.com/v2/docs/)                                                    |                                                                                                                             |                                                                             |
|[![bitflyer](https://user-images.githubusercontent.com/1294454/28051642-56154182-660e-11e7-9b0d-6042d1e6edd8.jpg)](https://bitflyer.jp)                                                      | bitflyer           | [bitFlyer](https://bitflyer.jp)                                                      | 1   | [API](https://lightning.bitflyer.com/docs?lang=en)                                           |                                                                                                                             |                                                                             |
|[![bitforex](https://user-images.githubusercontent.com/1294454/44310033-69e9e600-a3d8-11e8-873d-54d74d1bc4e4.jpg)](https://www.bitforex.com/en/invitationRegister?inviterId=1867438)         | bitforex           | [Bitforex](https://www.bitforex.com/en/invitationRegister?inviterId=1867438)         | 1   | [API](https://github.com/githubdev2020/API_Doc_en/wiki)                                      |                                                                                                                             |                                                                             |
|[![bithumb](https://user-images.githubusercontent.com/1294454/30597177-ea800172-9d5e-11e7-804c-b9d4fa9b56b0.jpg)](https://www.bithumb.com)                                                   | bithumb            | [Bithumb](https://www.bithumb.com)                                                   | *   | [API](https://apidocs.bithumb.com)                                                           |                                                                                                                             |                                                                             |
|[![bitkk](https://user-images.githubusercontent.com/1294454/32859187-cd5214f0-ca5e-11e7-967d-96568e2e2bd1.jpg)](https://www.bitkk.com)                                                       | bitkk              | [bitkk](https://www.bitkk.com)                                                       | 1   | [API](https://www.bitkk.com/i/developer)                                                     |                                                                                                                             |                                                                             |
|[![bitlish](https://user-images.githubusercontent.com/1294454/27766275-dcfc6c30-5ed3-11e7-839d-00a846385d0b.jpg)](https://bitlish.com)                                                       | bitlish            | [Bitlish](https://bitlish.com)                                                       | 1   | [API](https://bitlish.com/api)                                                               |                                                                                                                             |                                                                             |
|[![bitmart](https://user-images.githubusercontent.com/1294454/61835713-a2662f80-ae85-11e9-9d00-6442919701fd.jpg)](http://www.bitmart.com/?r=rQCFLh)                                          | bitmart            | [BitMart](http://www.bitmart.com/?r=rQCFLh)                                          | 2   | [API](https://github.com/bitmartexchange/bitmart-official-api-docs)                          |                                                                                                                             |                                                                             |
|[![bitmax](https://user-images.githubusercontent.com/1294454/66820319-19710880-ef49-11e9-8fbe-16be62a11992.jpg)](https://bitmax.io/#/register?inviteCode=EL6BXBQM)                           | bitmax             | [BitMax](https://bitmax.io/#/register?inviteCode=EL6BXBQM)                           | 1   | [API](https://github.com/bitmax-exchange/api-doc/blob/master/bitmax-api-doc-v1.2.md)         |                                                                                                                             |                                                                             |
|[![bitmex](https://user-images.githubusercontent.com/1294454/27766319-f653c6e6-5ed4-11e7-933d-f0bc3699ae8f.jpg)](https://www.bitmex.com/register/upZpOX)                                     | bitmex             | [BitMEX](https://www.bitmex.com/register/upZpOX)                                     | 1   | [API](https://www.bitmex.com/app/apiOverview)                                                |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![bitso](https://user-images.githubusercontent.com/1294454/27766335-715ce7aa-5ed5-11e7-88a8-173a27bb30fe.jpg)](https://bitso.com/?ref=itej)                                                 | bitso              | [Bitso](https://bitso.com/?ref=itej)                                                 | 3   | [API](https://bitso.com/api_info)                                                            |                                                                                                                             |                                                                             |
|[![bitstamp](https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg)](https://www.bitstamp.net)                                                 | bitstamp           | [Bitstamp](https://www.bitstamp.net)                                                 | 2   | [API](https://www.bitstamp.net/api)                                                          |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![bitstamp1](https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg)](https://www.bitstamp.net)                                                | bitstamp1          | [Bitstamp](https://www.bitstamp.net)                                                 | 1   | [API](https://www.bitstamp.net/api)                                                          |                                                                                                                             |                                                                             |
|[![bittrex](https://user-images.githubusercontent.com/1294454/27766352-cf0b3c26-5ed5-11e7-82b7-f3826b7a97d8.jpg)](https://bittrex.com/Account/Register?referralCode=1ZE-G0G-M3B)             | bittrex            | [Bittrex](https://bittrex.com/Account/Register?referralCode=1ZE-G0G-M3B)             | 1.1 | [API](https://bittrex.github.io/api/)                                                        | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![bitz](https://user-images.githubusercontent.com/1294454/35862606-4f554f14-0b5d-11e8-957d-35058c504b6f.jpg)](https://u.bitz.com/register?invite_code=1429193)                              | bitz               | [Bit-Z](https://u.bitz.com/register?invite_code=1429193)                             | 2   | [API](https://apidoc.bitz.com/en/)                                                           |                                                                                                                             |                                                                             |
|[![bl3p](https://user-images.githubusercontent.com/1294454/28501752-60c21b82-6feb-11e7-818b-055ee6d0e754.jpg)](https://bl3p.eu)                                                              | bl3p               | [BL3P](https://bl3p.eu)                                                              | 1   | [API](https://github.com/BitonicNL/bl3p-api/tree/master/docs)                                |                                                                                                                             |                                                                             |
|[![bleutrade](https://user-images.githubusercontent.com/1294454/30303000-b602dbe6-976d-11e7-956d-36c5049c01e7.jpg)](https://bleutrade.com)                                                   | bleutrade          | [Bleutrade](https://bleutrade.com)                                                   | *   | [API](https://app.swaggerhub.com/apis-docs/bleu/white-label/3.0.0)                           |                                                                                                                             |                                                                             |
|[![braziliex](https://user-images.githubusercontent.com/1294454/34703593-c4498674-f504-11e7-8d14-ff8e44fb78c1.jpg)](https://braziliex.com/?ref=5FE61AB6F6D67DA885BC98BA27223465)             | braziliex          | [Braziliex](https://braziliex.com/?ref=5FE61AB6F6D67DA885BC98BA27223465)             | *   | [API](https://braziliex.com/exchange/api.php)                                                |                                                                                                                             |                                                                             |
|[![btcalpha](https://user-images.githubusercontent.com/1294454/42625213-dabaa5da-85cf-11e8-8f99-aa8f8f7699f0.jpg)](https://btc-alpha.com/?r=123788)                                          | btcalpha           | [BTC-Alpha](https://btc-alpha.com/?r=123788)                                         | 1   | [API](https://btc-alpha.github.io/api-docs)                                                  |                                                                                                                             |                                                                             |
|[![btcbox](https://user-images.githubusercontent.com/1294454/31275803-4df755a8-aaa1-11e7-9abb-11ec2fad9f2d.jpg)](https://www.btcbox.co.jp/)                                                  | btcbox             | [BtcBox](https://www.btcbox.co.jp/)                                                  | 1   | [API](https://www.btcbox.co.jp/help/asm)                                                     |                                                                                                                             |                                                                             |
|[![btcmarkets](https://user-images.githubusercontent.com/1294454/29142911-0e1acfc2-7d5c-11e7-98c4-07d9532b29d7.jpg)](https://btcmarkets.net)                                                 | btcmarkets         | [BTC Markets](https://btcmarkets.net)                                                | *   | [API](https://github.com/BTCMarkets/API)                                                     |                                                                                                                             |                                                                             |
|[![btctradeim](https://user-images.githubusercontent.com/1294454/36770531-c2142444-1c5b-11e8-91e2-a4d90dc85fe8.jpg)](https://m.baobi.com/invite?inv=1765b2)                                  | btctradeim         | [BtcTrade.im](https://m.baobi.com/invite?inv=1765b2)                                 | *   | [API](https://www.btctrade.im/help.api.html)                                                 |                                                                                                                             |                                                                             |
|[![btctradeua](https://user-images.githubusercontent.com/1294454/27941483-79fc7350-62d9-11e7-9f61-ac47f28fcd96.jpg)](https://btc-trade.com.ua/registration/22689)                            | btctradeua         | [BTC Trade UA](https://btc-trade.com.ua/registration/22689)                          | *   | [API](https://docs.google.com/document/d/1ocYA0yMy_RXd561sfG3qEPZ80kyll36HUxvCRe5GbhE/edit)  |                                                                                                                             |                                                                             |
|[![btcturk](https://user-images.githubusercontent.com/1294454/27992709-18e15646-64a3-11e7-9fa2-b0950ec7712f.jpg)](https://www.btcturk.com)                                                   | btcturk            | [BTCTurk](https://www.btcturk.com)                                                   | *   | [API](https://github.com/BTCTrader/broker-api-docs)                                          |                                                                                                                             |                                                                             |
|[![buda](https://user-images.githubusercontent.com/1294454/47380619-8a029200-d706-11e8-91e0-8a391fe48de3.jpg)](https://www.buda.com)                                                         | buda               | [Buda](https://www.buda.com)                                                         | 2   | [API](https://api.buda.com)                                                                  |                                                                                                                             |                                                                             |
|[![bw](https://user-images.githubusercontent.com/1294454/69436317-31128c80-0d52-11ea-91d1-eb7bb5818812.jpg)](https://www.bw.com)                                                             | bw                 | [BW](https://www.bw.com)                                                             | 1   | [API](https://github.com/bw-exchange/api_docs_en/wiki)                                       |                                                                                                                             |                                                                             |
|[![bybit](https://user-images.githubusercontent.com/51840849/76547799-daff5b80-649e-11ea-87fb-3be9bac08954.jpg)](https://www.bybit.com/app/register?ref=X7Prm)                               | bybit              | [Bybit](https://www.bybit.com/app/register?ref=X7Prm)                                | 2   | [API](https://bybit-exchange.github.io/docs/inverse/)                                        |                                                                                                                             |                                                                             |
|[![bytetrade](https://user-images.githubusercontent.com/1294454/67288762-2f04a600-f4e6-11e9-9fd6-c60641919491.jpg)](https://www.bytetrade.com)                                               | bytetrade          | [ByteTrade](https://www.bytetrade.com)                                               | *   | [API](https://github.com/Bytetrade/bytetrade-official-api-docs/wiki)                         | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) |                                                                             |
|[![cex](https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg)](https://cex.io/r/0/up105393824/0/)                                             | cex                | [CEX.IO](https://cex.io/r/0/up105393824/0/)                                          | *   | [API](https://cex.io/cex-api)                                                                |                                                                                                                             |                                                                             |
|[![chilebit](https://user-images.githubusercontent.com/1294454/27991414-1298f0d8-647f-11e7-9c40-d56409266336.jpg)](https://chilebit.net)                                                     | chilebit           | [ChileBit](https://chilebit.net)                                                     | 1   | [API](https://blinktrade.com/docs)                                                           |                                                                                                                             |                                                                             |
|[![cobinhood](https://user-images.githubusercontent.com/1294454/35755576-dee02e5c-0878-11e8-989f-1595d80ba47f.jpg)](https://cobinhood.com?referrerId=a9d57842-99bb-4d7c-b668-0479a15a458b)   | cobinhood          | [COBINHOOD](https://cobinhood.com?referrerId=a9d57842-99bb-4d7c-b668-0479a15a458b)   | 1   | [API](https://cobinhood.github.io/api-public)                                                |                                                                                                                             |                                                                             |
|[![coinbase](https://user-images.githubusercontent.com/1294454/40811661-b6eceae2-653a-11e8-829e-10bfadb078cf.jpg)](https://www.coinbase.com/join/58cbe25a355148797479dbd2)                   | coinbase           | [Coinbase](https://www.coinbase.com/join/58cbe25a355148797479dbd2)                   | 2   | [API](https://developers.coinbase.com/api/v2)                                                |                                                                                                                             |                                                                             |
|[![coinbaseprime](https://user-images.githubusercontent.com/1294454/44539184-29f26e00-a70c-11e8-868f-e907fc236a7c.jpg)](https://prime.coinbase.com)                                          | coinbaseprime      | [Coinbase Prime](https://prime.coinbase.com)                                         | *   | [API](https://docs.prime.coinbase.com)                                                       |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![coinbasepro](https://user-images.githubusercontent.com/1294454/41764625-63b7ffde-760a-11e8-996d-a6328fa9347a.jpg)](https://pro.coinbase.com/)                                             | coinbasepro        | [Coinbase Pro](https://pro.coinbase.com/)                                            | *   | [API](https://docs.pro.coinbase.com)                                                         |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![coincheck](https://user-images.githubusercontent.com/1294454/27766464-3b5c3c74-5ed9-11e7-840e-31b32968e1da.jpg)](https://coincheck.com)                                                   | coincheck          | [coincheck](https://coincheck.com)                                                   | *   | [API](https://coincheck.com/documents/exchange/api)                                          |                                                                                                                             |                                                                             |
|[![coinegg](https://user-images.githubusercontent.com/1294454/36770310-adfa764e-1c5a-11e8-8e09-449daac3d2fb.jpg)](https://www.coinegg.com/user/register?invite=523218)                       | coinegg            | [CoinEgg](https://www.coinegg.com/user/register?invite=523218)                       | *   | [API](https://www.coinegg.com/explain.api.html)                                              |                                                                                                                             |                                                                             |
|[![coinex](https://user-images.githubusercontent.com/1294454/38046312-0b450aac-32c8-11e8-99ab-bc6b136b6cc7.jpg)](https://www.coinex.com/register?refer_code=yw5fz)                           | coinex             | [CoinEx](https://www.coinex.com/register?refer_code=yw5fz)                           | 1   | [API](https://github.com/coinexcom/coinex_exchange_api/wiki)                                 |                                                                                                                             |                                                                             |
|[![coinfalcon](https://user-images.githubusercontent.com/1294454/41822275-ed982188-77f5-11e8-92bb-496bcd14ca52.jpg)](https://coinfalcon.com/?ref=CFJSVGTUPASB)                               | coinfalcon         | [CoinFalcon](https://coinfalcon.com/?ref=CFJSVGTUPASB)                               | 1   | [API](https://docs.coinfalcon.com)                                                           |                                                                                                                             |                                                                             |
|[![coinfloor](https://user-images.githubusercontent.com/1294454/28246081-623fc164-6a1c-11e7-913f-bac0d5576c90.jpg)](https://www.coinfloor.co.uk)                                             | coinfloor          | [coinfloor](https://www.coinfloor.co.uk)                                             | *   | [API](https://github.com/coinfloor/api)                                                      |                                                                                                                             |                                                                             |
|[![coingi](https://user-images.githubusercontent.com/1294454/28619707-5c9232a8-7212-11e7-86d6-98fe5d15cc6e.jpg)](https://www.coingi.com/?r=XTPPMC)                                           | coingi             | [Coingi](https://www.coingi.com/?r=XTPPMC)                                           | *   | [API](https://coingi.docs.apiary.io)                                                         |                                                                                                                             |                                                                             |
|[![coinmarketcap](https://user-images.githubusercontent.com/1294454/28244244-9be6312a-69ed-11e7-99c1-7c1797275265.jpg)](https://coinmarketcap.com)                                           | coinmarketcap      | [CoinMarketCap](https://coinmarketcap.com)                                           | 1   | [API](https://coinmarketcap.com/api)                                                         |                                                                                                                             |                                                                             |
|[![coinmate](https://user-images.githubusercontent.com/1294454/27811229-c1efb510-606c-11e7-9a36-84ba2ce412d8.jpg)](https://coinmate.io?referral=YTFkM1RsOWFObVpmY1ZjMGREQmpTRnBsWjJJNVp3PT0) | coinmate           | [CoinMate](https://coinmate.io?referral=YTFkM1RsOWFObVpmY1ZjMGREQmpTRnBsWjJJNVp3PT0) | *   | [API](https://coinmate.docs.apiary.io)                                                       |                                                                                                                             |                                                                             |
|[![coinone](https://user-images.githubusercontent.com/1294454/38003300-adc12fba-323f-11e8-8525-725f53c4a659.jpg)](https://coinone.co.kr)                                                     | coinone            | [CoinOne](https://coinone.co.kr)                                                     | 2   | [API](https://doc.coinone.co.kr)                                                             |                                                                                                                             |                                                                             |
|[![coinspot](https://user-images.githubusercontent.com/1294454/28208429-3cacdf9a-6896-11e7-854e-4c79a772a30f.jpg)](https://www.coinspot.com.au/register?code=PJURCU)                         | coinspot           | [CoinSpot](https://www.coinspot.com.au/register?code=PJURCU)                         | *   | [API](https://www.coinspot.com.au/api)                                                       |                                                                                                                             |                                                                             |
|[![coolcoin](https://user-images.githubusercontent.com/1294454/36770529-be7b1a04-1c5b-11e8-9600-d11f1996b539.jpg)](https://www.coolcoin.com/user/register?invite_code=bhaega)                | coolcoin           | [CoolCoin](https://www.coolcoin.com/user/register?invite_code=bhaega)                | *   | [API](https://www.coolcoin.com/help.api.html)                                                |                                                                                                                             |                                                                             |
|[![coss](https://user-images.githubusercontent.com/1294454/50328158-22e53c00-0503-11e9-825c-c5cfd79bfa74.jpg)](https://www.coss.io/c/reg?r=OWCMHQVW2Q)                                       | coss               | [COSS](https://www.coss.io/c/reg?r=OWCMHQVW2Q)                                       | 1   | [API](https://api.coss.io/v1/spec)                                                           |                                                                                                                             |                                                                             |
|[![crex24](https://user-images.githubusercontent.com/1294454/47813922-6f12cc00-dd5d-11e8-97c6-70f957712d47.jpg)](https://crex24.com/?refid=slxsjsjtil8xexl9hksr)                             | crex24             | [CREX24](https://crex24.com/?refid=slxsjsjtil8xexl9hksr)                             | 2   | [API](https://docs.crex24.com/trade-api/v2)                                                  |                                                                                                                             |                                                                             |
|[![deribit](https://user-images.githubusercontent.com/1294454/41933112-9e2dd65a-798b-11e8-8440-5bab2959fcb8.jpg)](https://www.deribit.com/reg-1189.4038)                                     | deribit            | [Deribit](https://www.deribit.com/reg-1189.4038)                                     | 2   | [API](https://docs.deribit.com/v2)                                                           |                                                                                                                             |                                                                             |
|[![digifinex](https://user-images.githubusercontent.com/1294454/62184319-304e8880-b366-11e9-99fe-8011d6929195.jpg)](https://www.digifinex.vip/en-ww/from/DhOzBg/3798****5114)                | digifinex          | [DigiFinex](https://www.digifinex.vip/en-ww/from/DhOzBg/3798****5114)                | 3   | [API](https://docs.digifinex.vip)                                                            |                                                                                                                             |                                                                             |
|[![dsx](https://user-images.githubusercontent.com/51840849/76909626-cb2bb100-68bc-11ea-99e0-28ba54f04792.jpg)](https://dsx.uk)                                                               | dsx                | [DSX](https://dsx.uk)                                                                | 3   | [API](https://dsx.uk/developers/publicApi)                                                   |                                                                                                                             |                                                                             |
|[![exmo](https://user-images.githubusercontent.com/1294454/27766491-1b0ea956-5eda-11e7-9225-40d67b481b8d.jpg)](https://exmo.me/?ref=131685)                                                  | exmo               | [EXMO](https://exmo.me/?ref=131685)                                                  | 1   | [API](https://exmo.me/en/api_doc?ref=131685)                                                 |                                                                                                                             |                                                                             |
|[![exx](https://user-images.githubusercontent.com/1294454/37770292-fbf613d0-2de4-11e8-9f79-f2dc451b8ccb.jpg)](https://www.exx.com/r/fde4260159e53ab8a58cc9186d35501f?recommQd=1)             | exx                | [EXX](https://www.exx.com/r/fde4260159e53ab8a58cc9186d35501f?recommQd=1)             | *   | [API](https://www.exx.com/help/restApi)                                                      |                                                                                                                             |                                                                             |
|[![fcoin](https://user-images.githubusercontent.com/1294454/42244210-c8c42e1e-7f1c-11e8-8710-a5fb63b165c4.jpg)](https://www.fcoin.com/i/Z5P7V)                                               | fcoin              | [FCoin](https://www.fcoin.com/i/Z5P7V)                                               | 2   | [API](https://developer.fcoin.com)                                                           |                                                                                                                             |                                                                             |
|[![fcoinjp](https://user-images.githubusercontent.com/1294454/54219174-08b66b00-4500-11e9-862d-f522d0fe08c6.jpg)](https://www.fcoinjp.com)                                                   | fcoinjp            | [FCoinJP](https://www.fcoinjp.com)                                                   | 2   | [API](https://developer.fcoin.com)                                                           |                                                                                                                             |                                                                             |
|[![flowbtc](https://user-images.githubusercontent.com/1294454/28162465-cd815d4c-67cf-11e7-8e57-438bea0523a2.jpg)](https://www.flowbtc.com.br)                                                | flowbtc            | [flowBTC](https://www.flowbtc.com.br)                                                | 1   | [API](https://www.flowbtc.com.br/api.html)                                                   |                                                                                                                             |                                                                             |
|[![foxbit](https://user-images.githubusercontent.com/1294454/27991413-11b40d42-647f-11e7-91ee-78ced874dd09.jpg)](https://foxbit.com.br/exchange)                                             | foxbit             | [FoxBit](https://foxbit.com.br/exchange)                                             | 1   | [API](https://foxbit.com.br/api/)                                                            |                                                                                                                             |                                                                             |
|[![ftx](https://user-images.githubusercontent.com/1294454/67149189-df896480-f2b0-11e9-8816-41593e17f9ec.jpg)](https://ftx.com/#a=1623029)                                                    | ftx                | [FTX](https://ftx.com/#a=1623029)                                                    | *   | [API](https://github.com/ftexchange/ftx)                                                     | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) |                                                                             |
|[![fybse](https://user-images.githubusercontent.com/1294454/27766512-31019772-5edb-11e7-8241-2e675e6797f1.jpg)](https://www.fybse.se)                                                        | fybse              | [FYB-SE](https://www.fybse.se)                                                       | *   | [API](https://fyb.docs.apiary.io)                                                            |                                                                                                                             |                                                                             |
|[![gateio](https://user-images.githubusercontent.com/1294454/31784029-0313c702-b509-11e7-9ccc-bc0da6a0e435.jpg)](https://www.gate.io/signup/2436035)                                         | gateio             | [Gate.io](https://www.gate.io/signup/2436035)                                        | 2   | [API](https://gate.io/api2)                                                                  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![gemini](https://user-images.githubusercontent.com/1294454/27816857-ce7be644-6096-11e7-82d6-3c257263229c.jpg)](https://gemini.com/)                                                        | gemini             | [Gemini](https://gemini.com/)                                                        | 1   | [API](https://docs.gemini.com/rest-api)                                                      |                                                                                                                             |                                                                             |
|[![hitbtc](https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg)](https://hitbtc.com/?ref_id=5a5d39a65d466)                                   | hitbtc             | [HitBTC](https://hitbtc.com/?ref_id=5a5d39a65d466)                                   | 1   | [API](https://github.com/hitbtc-com/hitbtc-api/blob/master/APIv1.md)                         |                                                                                                                             |                                                                             |
|[![hitbtc2](https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg)](https://hitbtc.com/?ref_id=5a5d39a65d466)                                  | hitbtc2            | [HitBTC](https://hitbtc.com/?ref_id=5a5d39a65d466)                                   | 2   | [API](https://api.hitbtc.com)                                                                |                                                                                                                             |                                                                             |
|[![hollaex](https://user-images.githubusercontent.com/1294454/75841031-ca375180-5ddd-11ea-8417-b975674c23cb.jpg)](https://pro.hollaex.com/signup?affiliation_code=QSWA6G)                    | hollaex            | [HollaEx](https://pro.hollaex.com/signup?affiliation_code=QSWA6G)                    | 1   | [API](https://apidocs.hollaex.com)                                                           |                                                                                                                             |                                                                             |
|[![huobipro](https://user-images.githubusercontent.com/1294454/76137448-22748a80-604e-11ea-8069-6e389271911d.jpg)](https://www.huobi.co/en-us/topic/invited/?invite_code=rwrd3)              | huobipro           | [Huobi Pro](https://www.huobi.co/en-us/topic/invited/?invite_code=rwrd3)             | 1   | [API](https://huobiapi.github.io/docs/spot/v1/cn/)                                           |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![huobiru](https://user-images.githubusercontent.com/1294454/52978816-e8552e00-33e3-11e9-98ed-845acfece834.jpg)](https://www.huobi.com.ru/invite?invite_code=esc74)                         | huobiru            | [Huobi Russia](https://www.huobi.com.ru/invite?invite_code=esc74)                    | 1   | [API](https://github.com/cloudapidoc/API_Docs_en)                                            |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![ice3x](https://user-images.githubusercontent.com/1294454/38012176-11616c32-3269-11e8-9f05-e65cf885bb15.jpg)](https://ice3x.com?ref=14341802)                                              | ice3x              | [ICE3X](https://ice3x.com?ref=14341802)                                              | 1   | [API](https://ice3x.co.za/ice-cubed-bitcoin-exchange-api-documentation-1-june-2017)          |                                                                                                                             |                                                                             |
|[![idex](https://user-images.githubusercontent.com/1294454/63693236-3415e380-c81c-11e9-8600-ba1634f1407d.jpg)](https://idex.market)                                                          | idex               | [IDEX](https://idex.market)                                                          | *   | [API](https://docs.idex.market/)                                                             | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) |                                                                             |
|[![independentreserve](https://user-images.githubusercontent.com/1294454/30521662-cf3f477c-9bcb-11e7-89bc-d1ac85012eda.jpg)](https://www.independentreserve.com)                             | independentreserve | [Independent Reserve](https://www.independentreserve.com)                            | *   | [API](https://www.independentreserve.com/API)                                                |                                                                                                                             |                                                                             |
|[![indodax](https://user-images.githubusercontent.com/1294454/37443283-2fddd0e4-281c-11e8-9741-b4f1419001b5.jpg)](https://indodax.com/ref/testbitcoincoid/1)                                 | indodax            | [INDODAX](https://indodax.com/ref/testbitcoincoid/1)                                 | 1.8 | [API](https://indodax.com/downloads/BITCOINCOID-API-DOCUMENTATION.pdf)                       |                                                                                                                             |                                                                             |
|[![itbit](https://user-images.githubusercontent.com/1294454/27822159-66153620-60ad-11e7-89e7-005f6d7f3de0.jpg)](https://www.itbit.com)                                                       | itbit              | [itBit](https://www.itbit.com)                                                       | 1   | [API](https://api.itbit.com/docs)                                                            |                                                                                                                             |                                                                             |
|[![kkex](https://user-images.githubusercontent.com/1294454/47401462-2e59f800-d74a-11e8-814f-e4ae17b4968a.jpg)](https://kkex.com)                                                             | kkex               | [KKEX](https://kkex.com)                                                             | 2   | [API](https://kkex.com/api_wiki/cn/)                                                         |                                                                                                                             |                                                                             |
|[![kraken](https://user-images.githubusercontent.com/51840849/76173629-fc67fb00-61b1-11ea-84fe-f2de582f58a3.jpg)](https://www.kraken.com)                                                    | kraken             | [Kraken](https://www.kraken.com)                                                     | 0   | [API](https://www.kraken.com/features/api)                                                   | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![kucoin](https://user-images.githubusercontent.com/1294454/57369448-3cc3aa80-7196-11e9-883e-5ebeb35e4f57.jpg)](https://www.kucoin.com/?rcode=E5wkqe)                                       | kucoin             | [KuCoin](https://www.kucoin.com/?rcode=E5wkqe)                                       | 2   | [API](https://docs.kucoin.com)                                                               |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![kuna](https://user-images.githubusercontent.com/1294454/31697638-912824fa-b3c1-11e7-8c36-cf9606eb94ac.jpg)](https://kuna.io?r=kunaid-gvfihe8az7o4)                                        | kuna               | [Kuna](https://kuna.io?r=kunaid-gvfihe8az7o4)                                        | 2   | [API](https://kuna.io/documents/api)                                                         |                                                                                                                             |                                                                             |
|[![lakebtc](https://user-images.githubusercontent.com/1294454/28074120-72b7c38a-6660-11e7-92d9-d9027502281d.jpg)](https://www.lakebtc.com)                                                   | lakebtc            | [LakeBTC](https://www.lakebtc.com)                                                   | 2   | [API](https://www.lakebtc.com/s/api_v2)                                                      |                                                                                                                             |                                                                             |
|[![latoken](https://user-images.githubusercontent.com/1294454/61511972-24c39f00-aa01-11e9-9f7c-471f1d6e5214.jpg)](https://latoken.com)                                                       | latoken            | [Latoken](https://latoken.com)                                                       | 1   | [API](https://api.latoken.com)                                                               |                                                                                                                             |                                                                             |
|[![lbank](https://user-images.githubusercontent.com/1294454/38063602-9605e28a-3302-11e8-81be-64b1e53c4cfb.jpg)](https://www.lbex.io/invite?icode=7QCY)                                       | lbank              | [LBank](https://www.lbex.io/invite?icode=7QCY)                                       | 1   | [API](https://github.com/LBank-exchange/lbank-official-api-docs)                             |                                                                                                                             |                                                                             |
|[![liquid](https://user-images.githubusercontent.com/1294454/45798859-1a872600-bcb4-11e8-8746-69291ce87b04.jpg)](https://www.liquid.com?affiliate=SbzC62lt30976)                             | liquid             | [Liquid](https://www.liquid.com?affiliate=SbzC62lt30976)                             | 2   | [API](https://developers.liquid.com)                                                         |                                                                                                                             |                                                                             |
|[![livecoin](https://user-images.githubusercontent.com/1294454/27980768-f22fc424-638a-11e7-89c9-6010a54ff9be.jpg)](https://livecoin.net/?from=Livecoin-CQ1hfx44)                             | livecoin           | [LiveCoin](https://livecoin.net/?from=Livecoin-CQ1hfx44)                             | *   | [API](https://www.livecoin.net/api?lang=en)                                                  |                                                                                                                             |                                                                             |
|[![luno](https://user-images.githubusercontent.com/1294454/27766607-8c1a69d8-5ede-11e7-930c-540b5eb9be24.jpg)](https://www.luno.com/invite/44893A)                                           | luno               | [luno](https://www.luno.com/invite/44893A)                                           | 1   | [API](https://www.luno.com/en/api)                                                           |                                                                                                                             |                                                                             |
|[![lykke](https://user-images.githubusercontent.com/1294454/34487620-3139a7b0-efe6-11e7-90f5-e520cef74451.jpg)](https://www.lykke.com)                                                       | lykke              | [Lykke](https://www.lykke.com)                                                       | 1   | [API](https://hft-api.lykke.com/swagger/ui/)                                                 |                                                                                                                             |                                                                             |
|[![mercado](https://user-images.githubusercontent.com/1294454/27837060-e7c58714-60ea-11e7-9192-f05e86adb83f.jpg)](https://www.mercadobitcoin.com.br)                                         | mercado            | [Mercado Bitcoin](https://www.mercadobitcoin.com.br)                                 | 3   | [API](https://www.mercadobitcoin.com.br/api-doc)                                             |                                                                                                                             |                                                                             |
|[![mixcoins](https://user-images.githubusercontent.com/1294454/30237212-ed29303c-9535-11e7-8af8-fcd381cfa20c.jpg)](https://mixcoins.com)                                                     | mixcoins           | [MixCoins](https://mixcoins.com)                                                     | 1   | [API](https://mixcoins.com/help/api/)                                                        |                                                                                                                             |                                                                             |
|[![oceanex](https://user-images.githubusercontent.com/1294454/58385970-794e2d80-8001-11e9-889c-0567cd79b78e.jpg)](https://oceanex.pro/signup?referral=VE24QX)                                | oceanex            | [OceanEx](https://oceanex.pro/signup?referral=VE24QX)                                | 1   | [API](https://api.oceanex.pro/doc/v1)                                                        |                                                                                                                             |                                                                             |
|[![okcoin](https://user-images.githubusercontent.com/1294454/27766791-89ffb502-5ee5-11e7-8a5b-c5950b68ac65.jpg)](https://www.okcoin.com/account/register?flag=activity&channelId=600001513)  | okcoin             | [OKCoin](https://www.okcoin.com/account/register?flag=activity&channelId=600001513)  | 3   | [API](https://www.okcoin.com/docs/en/)                                                       |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![okex](https://user-images.githubusercontent.com/1294454/32552768-0d6dd3c6-c4a6-11e7-90f8-c043b64756a7.jpg)](https://www.okex.com/join/1888677)                                            | okex               | [OKEX](https://www.okex.com/join/1888677)                                            | 3   | [API](https://www.okex.com/docs/en/)                                                         |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![paymium](https://user-images.githubusercontent.com/1294454/27790564-a945a9d4-5ff9-11e7-9d2d-b635763f2f24.jpg)](https://www.paymium.com)                                                   | paymium            | [Paymium](https://www.paymium.com)                                                   | 1   | [API](https://github.com/Paymium/api-documentation)                                          |                                                                                                                             |                                                                             |
|[![poloniex](https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg)](https://www.poloniex.com/?utm_source=ccxt&utm_medium=web)                 | poloniex           | [Poloniex](https://www.poloniex.com/?utm_source=ccxt&utm_medium=web)                 | *   | [API](https://docs.poloniex.com)                                                             | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![rightbtc](https://user-images.githubusercontent.com/1294454/42633917-7d20757e-85ea-11e8-9f53-fffe9fbb7695.jpg)](https://www.rightbtc.com)                                                 | rightbtc           | [RightBTC](https://www.rightbtc.com)                                                 | *   | [API](https://docs.rightbtc.com/api/)                                                        |                                                                                                                             |                                                                             |
|[![southxchange](https://user-images.githubusercontent.com/1294454/27838912-4f94ec8a-60f6-11e7-9e5d-bbf9bd50a559.jpg)](https://www.southxchange.com)                                         | southxchange       | [SouthXchange](https://www.southxchange.com)                                         | *   | [API](https://www.southxchange.com/Home/Api)                                                 |                                                                                                                             |                                                                             |
|[![stex](https://user-images.githubusercontent.com/1294454/69680782-03fd0b80-10bd-11ea-909e-7f603500e9cc.jpg)](https://app.stex.com?ref=36416021)                                            | stex               | [STEX](https://app.stex.com?ref=36416021)                                            | 3   | [API](https://help.stex.com/en/collections/1593608-api-v3-documentation)                     |                                                                                                                             |                                                                             |
|[![stronghold](https://user-images.githubusercontent.com/1294454/52160042-98c1f300-26be-11e9-90dd-da8473944c83.jpg)](https://stronghold.co)                                                  | stronghold         | [Stronghold](https://stronghold.co)                                                  | 1   | [API](https://docs.stronghold.co)                                                            |                                                                                                                             |                                                                             |
|[![surbitcoin](https://user-images.githubusercontent.com/1294454/27991511-f0a50194-6481-11e7-99b5-8f02932424cc.jpg)](https://surbitcoin.com)                                                 | surbitcoin         | [SurBitcoin](https://surbitcoin.com)                                                 | 1   | [API](https://blinktrade.com/docs)                                                           |                                                                                                                             |                                                                             |
|[![theocean](https://user-images.githubusercontent.com/1294454/43103756-d56613ce-8ed7-11e8-924e-68f9d4bcacab.jpg)](https://theocean.trade)                                                   | theocean           | [The Ocean](https://theocean.trade)                                                  | 1   | [API](https://docs.theocean.trade)                                                           |                                                                                                                             |                                                                             |
|[![therock](https://user-images.githubusercontent.com/1294454/27766869-75057fa2-5ee9-11e7-9a6f-13e641fa4707.jpg)](https://therocktrading.com)                                                | therock            | [TheRockTrading](https://therocktrading.com)                                         | 1   | [API](https://api.therocktrading.com/doc/v1/index.html)                                      |                                                                                                                             |                                                                             |
|[![tidebit](https://user-images.githubusercontent.com/1294454/39034921-e3acf016-4480-11e8-9945-a6086a1082fe.jpg)](http://bit.ly/2IX0LrM)                                                     | tidebit            | [TideBit](http://bit.ly/2IX0LrM)                                                     | 2   | [API](https://www.tidebit.com/documents/api/guide)                                           |                                                                                                                             |                                                                             |
|[![tidex](https://user-images.githubusercontent.com/1294454/30781780-03149dc4-a12e-11e7-82bb-313b269d24d4.jpg)](https://tidex.com/exchange/?ref=57f5638d9cd7)                                | tidex              | [Tidex](https://tidex.com/exchange/?ref=57f5638d9cd7)                                | 3   | [API](https://tidex.com/exchange/public-api)                                                 |                                                                                                                             |                                                                             |
|[![timex](https://user-images.githubusercontent.com/1294454/70423869-6839ab00-1a7f-11ea-8f94-13ae72c31115.jpg)](https://timex.io)                                                            | timex              | [TimeX](https://timex.io)                                                            | 1   | [API](https://docs.timex.io)                                                                 |                                                                                                                             |                                                                             |
|[![topq](https://user-images.githubusercontent.com/1294454/74596147-50247000-505c-11ea-9224-4fd347cfbb49.jpg)](https://www.topliq.com)                                                       | topq               | [TOP.Q](https://www.topliq.com)                                                      | 1   | [API](https://github.com/topq-exchange/api_docs_en/wiki/REST_api_reference)                  |                                                                                                                             |                                                                             |
|[![upbit](https://user-images.githubusercontent.com/1294454/49245610-eeaabe00-f423-11e8-9cba-4b0aed794799.jpg)](https://upbit.com)                                                           | upbit              | [Upbit](https://upbit.com)                                                           | 1   | [API](https://docs.upbit.com/docs/%EC%9A%94%EC%B2%AD-%EC%88%98-%EC%A0%9C%ED%95%9C)           | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![vaultoro](https://user-images.githubusercontent.com/1294454/27766880-f205e870-5ee9-11e7-8fe2-0d5b15880752.jpg)](https://www.vaultoro.com)                                                 | vaultoro           | [Vaultoro](https://www.vaultoro.com)                                                 | 1   | [API](https://api.vaultoro.com)                                                              |                                                                                                                             |                                                                             |
|[![vbtc](https://user-images.githubusercontent.com/1294454/27991481-1f53d1d8-6481-11e7-884e-21d17e7939db.jpg)](https://vbtc.exchange)                                                        | vbtc               | [VBTC](https://vbtc.exchange)                                                        | 1   | [API](https://blinktrade.com/docs)                                                           |                                                                                                                             |                                                                             |
|[![whitebit](https://user-images.githubusercontent.com/1294454/66732963-8eb7dd00-ee66-11e9-849b-10d9282bb9e0.jpg)](https://whitebit.com/referral/d9bdf40e-28f2-4b52-b2f9-cd1415d82963)       | whitebit           | [WhiteBit](https://whitebit.com/referral/d9bdf40e-28f2-4b52-b2f9-cd1415d82963)       | 2   | [API](https://documenter.getpostman.com/view/7473075/SVSPomwS?version=latest#intro)          |                                                                                                                             |                                                                             |
|[![xbtce](https://user-images.githubusercontent.com/1294454/28059414-e235970c-662c-11e7-8c3a-08e31f78684b.jpg)](https://xbtce.com/?agent=XX97BTCXXXG687021000B)                              | xbtce              | [xBTCe](https://xbtce.com/?agent=XX97BTCXXXG687021000B)                              | 1   | [API](https://www.xbtce.com/tradeapi)                                                        |                                                                                                                             |                                                                             |
|[![yobit](https://user-images.githubusercontent.com/1294454/27766910-cdcbfdae-5eea-11e7-9859-03fea873272d.jpg)](https://www.yobit.net)                                                       | yobit              | [YoBit](https://www.yobit.net)                                                       | 3   | [API](https://www.yobit.net/en/api/)                                                         |                                                                                                                             |                                                                             |
|[![zaif](https://user-images.githubusercontent.com/1294454/27766927-39ca2ada-5eeb-11e7-972f-1b4199518ca6.jpg)](https://zaif.jp)                                                              | zaif               | [Zaif](https://zaif.jp)                                                              | 1   | [API](https://techbureau-api-document.readthedocs.io/ja/latest/index.html)                   |                                                                                                                             |                                                                             |
|[![zb](https://user-images.githubusercontent.com/1294454/32859187-cd5214f0-ca5e-11e7-967d-96568e2e2bd1.jpg)](https://www.zb.com)                                                             | zb                 | [ZB](https://www.zb.com)                                                             | 1   | [API](https://www.zb.com/i/developer)                                                        |                                                                                                                             |                                                                             |

The list above is updated frequently, new crypto markets, exchanges, bug fixes, and API endpoints are introduced on a regular basis. See the [Manual](https://github.com/ccxt/ccxt/wiki) for more details. If you can't find a cryptocurrency exchange in the list above and want it to be added, post a link to it by opening an issue here on GitHub or send us an email.

The library is under [MIT license](https://github.com/ccxt/ccxt/blob/master/LICENSE.txt), that means it's absolutely free for any developer to build commercial and opensource software on top of it, but use it at your own risk with no warranties, as is.

---

## Install

The easiest way to install the CCXT library is to use a package manager:

- [ccxt in **NPM**](https://www.npmjs.com/package/ccxt) (JavaScript / Node v7.6+)
- [ccxt in **PyPI**](https://pypi.python.org/pypi/ccxt) (Python 2 and 3.5.3+)
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

* jsDelivr: https://cdn.jsdelivr.net/npm/ccxt@1.25.31/dist/ccxt.browser.js
* unpkg: https://unpkg.com/ccxt@1.25.31/dist/ccxt.browser.js

CDNs are not updated in real-time and may have delays. Defaulting to the most recent version without specifying the version number is not recommended. Please, keep in mind that we are not responsible for the correct operation of those CDN servers.

```HTML
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/ccxt@1.25.31/dist/ccxt.browser.js"></script>
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

### Docker

You can get CCXT installed in a container along with all the supported languages and dependencies. This may be useful if you want to contribute to CCXT (e.g. run the build scripts and tests — please see the [Contributing](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) document for the details on that).

Using `docker-compose` (in the cloned CCXT repository):

```shell
docker-compose run --rm ccxt
```

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
    console.log (huobipro.id,  await huobipro.fetchTrades ('ETH/CNY'))

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
print(huobipro.fetch_trades('LTC/CNY'))

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

### Crypto

```
ETH 0x26a3CB49578F07000575405a57888681249c35Fd (ETH only)
BTC 33RmVRfhK2WZVQR1R83h2e9yXoqRNDvJva
BCH 1GN9p233TvNcNQFthCgfiHUnj5JRKEc2Ze
LTC LbT8mkAqQBphc4yxLXEDgYDfEax74et3bP
```

Thank you!

## Social

- [Follow us on Twitter](https://twitter.com/ccxt_official)
- [Read our blog on Medium](https://medium.com/@ccxt)
- <sub><sub>[![Discord](https://img.shields.io/discord/690203284119617602?logo=discord&logoColor=white)](https://discord.gg/dhzSKYU)</sub></sub>

## Team

- [Igor Kroitor](https://github.com/kroitor)
- [Vitaly Gordon](https://github.com/xpl)
- [Denis Voropaev](https://github.com/tankakatan)
- [Carlo Revelli](https://github.com/frosty00)

## Contact Us

For business inquiries: info@ccxt.trade
