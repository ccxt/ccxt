# CCXT – CryptoCurrency eXchange Trading Library

[![Build Status](https://travis-ci.com/ccxt/ccxt.svg?branch=master)](https://travis-ci.com/ccxt/ccxt) [![npm](https://img.shields.io/npm/v/ccxt.svg)](https://npmjs.com/package/ccxt) [![PyPI](https://img.shields.io/pypi/v/ccxt.svg)](https://pypi.python.org/pypi/ccxt) [![NPM Downloads](https://img.shields.io/npm/dy/ccxt.svg)](https://www.npmjs.com/package/ccxt) [![Discord](https://img.shields.io/discord/690203284119617602?logo=discord&logoColor=white)](https://discord.gg/ccxt) [![Supported Exchanges](https://img.shields.io/badge/exchanges-103-blue.svg)](https://github.com/ccxt/ccxt/wiki/Exchange-Markets) [![Twitter Follow](https://img.shields.io/twitter/follow/ccxt_official.svg?style=social&label=CCXT)](https://twitter.com/ccxt_official)

A JavaScript / Python / PHP / C# library for cryptocurrency trading and e-commerce with support for many bitcoin/ether/altcoin exchange markets and merchant APIs.

### [Install](#install) · [Usage](#usage) · [Manual](https://github.com/ccxt/ccxt/wiki) · [FAQ](https://github.com/ccxt/ccxt/wiki/FAQ) · [Examples](https://github.com/ccxt/ccxt/tree/master/examples) · [Contributing](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) · [Social](#social)

The **CCXT** library is used to connect and trade with cryptocurrency exchanges and payment processing services worldwide. It provides quick access to market data for storage, analysis, visualization, indicator development, algorithmic trading, strategy backtesting, bot programming, and related software engineering.

It is intended to be used by **coders, developers, technically-skilled traders, data-scientists and financial analysts** for building trading algorithms.

Current feature list:

- support for many cryptocurrency exchanges — more coming soon
- fully implemented public and private APIs
- optional normalized data for cross-exchange analytics and arbitrage
- an out of the box unified API that is extremely easy to integrate
- works in Node 10.4+, Python 3, PHP 8.1+, netstandard2.0/2.1 and web browsers


## Sponsored Promotion

## See Also

- <sub>[![TabTrader](https://user-images.githubusercontent.com/1294454/66755907-9c3e8880-eea1-11e9-846e-0bff349ceb87.png)](https://tab-trader.com/?utm_source=ccxt)</sub> **[TabTrader](https://tab-trader.com/?utm_source=ccxt)** – trading on all exchanges in one app. Available on **[Android](https://play.google.com/store/apps/details?id=com.tabtrader.android&referrer=utm_source%3Dccxt)** and **[iOS](https://itunes.apple.com/app/apple-store/id1095716562?mt=8)**!
- <sub>[![Freqtrade](https://user-images.githubusercontent.com/1294454/114340585-8e35fa80-9b60-11eb-860f-4379125e2db6.png)](https://www.freqtrade.io)</sub> **[Freqtrade](https://www.freqtrade.io)** – leading opensource cryptocurrency algorithmic trading software!
- <sub>[![OctoBot](https://user-images.githubusercontent.com/1294454/132113722-007fc092-7530-4b41-b929-b8ed380b7b2e.png)](https://www.octobot.online)</sub> **[OctoBot](https://www.octobot.online)** – cryptocurrency trading bot with an advanced web interface.
- <sub>[![TokenBot](https://user-images.githubusercontent.com/1294454/152720975-0522b803-70f0-4f18-a305-3c99b37cd990.png)](https://tokenbot.com/?utm_source=github&utm_medium=ccxt&utm_campaign=algodevs)</sub> **[TokenBot](https://tokenbot.com/?utm_source=github&utm_medium=ccxt&utm_campaign=algodevs)** – discover and copy the best algorithmic traders in the world.

## Certified Cryptocurrency Exchanges


| logo                                                                                                                                                                                                          | id                    | name                                                                                                  | ver                                                                                                                           | certified                                                                                                                   | pro                                                                          | discount                                                                                                                                                                                                                                       |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|-------------------------------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------------------------:|-----------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|
| [![binance](https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg)](https://accounts.binance.com/en/register?ref=D7YA7CLY)                                      | binance               | [Binance](https://accounts.binance.com/en/register?ref=D7YA7CLY)                                      | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://binance-docs.github.io/apidocs/spot/en)                  | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) | [![Sign up with Binance using CCXT's referral link for a 10% discount!](https://img.shields.io/static/v1?label=Fee&message=%2d10%25&color=orange)](https://accounts.binance.com/en/register?ref=D7YA7CLY)                                      |
| [![binancecoinm](https://user-images.githubusercontent.com/1294454/117738721-668c8d80-b205-11eb-8c49-3fad84c4a07f.jpg)](https://accounts.binance.com/en/register?ref=D7YA7CLY)                                | binancecoinm          | [Binance COIN-M](https://accounts.binance.com/en/register?ref=D7YA7CLY)                               | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://binance-docs.github.io/apidocs/delivery/en/)             | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) | [![Sign up with Binance COIN-M using CCXT's referral link for a 10% discount!](https://img.shields.io/static/v1?label=Fee&message=%2d10%25&color=orange)](https://accounts.binance.com/en/register?ref=D7YA7CLY)                               |
| [![binanceusdm](https://user-images.githubusercontent.com/1294454/117738721-668c8d80-b205-11eb-8c49-3fad84c4a07f.jpg)](https://accounts.binance.com/en/register?ref=D7YA7CLY)                                 | binanceusdm           | [Binance USDⓈ-M](https://accounts.binance.com/en/register?ref=D7YA7CLY)                               | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://binance-docs.github.io/apidocs/futures/en/)              | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) | [![Sign up with Binance USDⓈ-M using CCXT's referral link for a 10% discount!](https://img.shields.io/static/v1?label=Fee&message=%2d10%25&color=orange)](https://accounts.binance.com/en/register?ref=D7YA7CLY)                               |
| [![bingx](https://github-production-user-asset-6210df.s3.amazonaws.com/1294454/253675376-6983b72e-4999-4549-b177-33b374c195e3.jpg)](https://bingx.com/invite/OHETOM)                                          | bingx                 | [BingX](https://bingx.com/invite/OHETOM)                                                              | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://bingx-api.github.io/docs/)                               | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |                                                                                                                                                                                                                                                |
| [![bitget](https://user-images.githubusercontent.com/1294454/195989417-4253ddb0-afbe-4a1c-9dea-9dbcd121fa5d.jpg)](https://www.bitget.com/expressly?languageType=0&channelCode=ccxt&vipCode=tg9j)              | bitget                | [Bitget](https://www.bitget.com/expressly?languageType=0&channelCode=ccxt&vipCode=tg9j)               | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://www.bitget.com/api-doc/common/intro)                     | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |                                                                                                                                                                                                                                                |
| [![bitmart](https://user-images.githubusercontent.com/1294454/129991357-8f47464b-d0f4-41d6-8a82-34122f0d1398.jpg)](http://www.bitmart.com/?r=rQCFLh)                                                          | bitmart               | [BitMart](http://www.bitmart.com/?r=rQCFLh)                                                           | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://developer-pro.bitmart.com/)                              | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) | [![Sign up with BitMart using CCXT's referral link for a 30% discount!](https://img.shields.io/static/v1?label=Fee&message=%2d30%25&color=orange)](http://www.bitmart.com/?r=rQCFLh)                                                           |
| [![bitmex](https://github.com/ccxt/ccxt/assets/43336371/cea9cfe5-c57e-4b84-b2ac-77b960b04445)](https://www.bitmex.com/app/register/NZTR1q)                                                                    | bitmex                | [BitMEX](https://www.bitmex.com/app/register/NZTR1q)                                                  | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://www.bitmex.com/app/apiOverview)                          | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) | [![Sign up with BitMEX using CCXT's referral link for a 10% discount!](https://img.shields.io/static/v1?label=Fee&message=%2d10%25&color=orange)](https://www.bitmex.com/app/register/NZTR1q)                                                  |
| [![bybit](https://user-images.githubusercontent.com/51840849/76547799-daff5b80-649e-11ea-87fb-3be9bac08954.jpg)](https://www.bybit.com/register?affiliate_id=35953)                                           | bybit                 | [Bybit](https://www.bybit.com/register?affiliate_id=35953)                                            | [![API Version 5](https://img.shields.io/badge/5-lightgray)](https://bybit-exchange.github.io/docs/inverse/)                  | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |                                                                                                                                                                                                                                                |
| [![coinbase](https://user-images.githubusercontent.com/1294454/40811661-b6eceae2-653a-11e8-829e-10bfadb078cf.jpg)](https://www.coinbase.com/join/58cbe25a355148797479dbd2)                                    | coinbase              | [Coinbase Advanced](https://www.coinbase.com/join/58cbe25a355148797479dbd2)                           | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://developers.coinbase.com/api/v2)                          | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |                                                                                                                                                                                                                                                |
| [![coinbaseinternational](https://github.com/ccxt/ccxt/assets/43336371/866ae638-6ab5-4ebf-ab2c-cdcce9545625)](https://international.coinbase.com)                                                             | coinbaseinternational | [Coinbase International](https://international.coinbase.com)                                          | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.cloud.coinbase.com/intx/docs)                       | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |                                                                                                                                                                                                                                                |
| [![coinex](https://user-images.githubusercontent.com/51840849/87182089-1e05fa00-c2ec-11ea-8da9-cc73b45abbbc.jpg)](https://www.coinex.com/register?refer_code=yw5fz)                                           | coinex                | [CoinEx](https://www.coinex.com/register?refer_code=yw5fz)                                            | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.coinex.com/api/v2)                                  | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |                                                                                                                                                                                                                                                |
| [![cryptocom](https://user-images.githubusercontent.com/1294454/147792121-38ed5e36-c229-48d6-b49a-48d05fc19ed4.jpeg)](https://crypto.com/exch/kdacthrnxt)                                                     | cryptocom             | [Crypto.com](https://crypto.com/exch/kdacthrnxt)                                                      | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html) | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) | [![Sign up with Crypto.com using CCXT's referral link for a 15% discount!](https://img.shields.io/static/v1?label=Fee&message=%2d15%25&color=orange)](https://crypto.com/exch/kdacthrnxt)                                                      |
| [![gate](https://user-images.githubusercontent.com/1294454/31784029-0313c702-b509-11e7-9ccc-bc0da6a0e435.jpg)](https://www.gate.io/signup/2436035)                                                            | gate                  | [Gate.io](https://www.gate.io/signup/2436035)                                                         | [![API Version 4](https://img.shields.io/badge/4-lightgray)](https://www.gate.io/docs/developers/apiv4/en/)                   | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) | [![Sign up with Gate.io using CCXT's referral link for a 20% discount!](https://img.shields.io/static/v1?label=Fee&message=%2d20%25&color=orange)](https://www.gate.io/signup/2436035)                                                         |
| [![htx](https://user-images.githubusercontent.com/1294454/76137448-22748a80-604e-11ea-8069-6e389271911d.jpg)](https://www.huobi.com/en-us/v/register/double-invite/?inviter_id=11343840&invite_code=6rmm2223) | htx                   | [HTX](https://www.huobi.com/en-us/v/register/double-invite/?inviter_id=11343840&invite_code=6rmm2223) | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://huobiapi.github.io/docs/spot/v1/en/)                     | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) | [![Sign up with HTX using CCXT's referral link for a 15% discount!](https://img.shields.io/static/v1?label=Fee&message=%2d15%25&color=orange)](https://www.huobi.com/en-us/v/register/double-invite/?inviter_id=11343840&invite_code=6rmm2223) |
| [![kucoin](https://user-images.githubusercontent.com/51840849/87295558-132aaf80-c50e-11ea-9801-a2fb0c57c799.jpg)](https://www.kucoin.com/ucenter/signup?rcode=E5wkqe)                                         | kucoin                | [KuCoin](https://www.kucoin.com/ucenter/signup?rcode=E5wkqe)                                          | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.kucoin.com)                                         | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |                                                                                                                                                                                                                                                |
| [![kucoinfutures](https://user-images.githubusercontent.com/1294454/147508995-9e35030a-d046-43a1-a006-6fabd981b554.jpg)](https://futures.kucoin.com/?rcode=E5wkqe)                                            | kucoinfutures         | [KuCoin Futures](https://futures.kucoin.com/?rcode=E5wkqe)                                            | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.kucoin.com/futures)                                 | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |                                                                                                                                                                                                                                                |
| [![mexc](https://user-images.githubusercontent.com/1294454/137283979-8b2a818d-8633-461b-bfca-de89e8c446b2.jpg)](https://m.mexc.com/auth/signup?inviteCode=1FQ1G)                                              | mexc                  | [MEXC Global](https://m.mexc.com/auth/signup?inviteCode=1FQ1G)                                        | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://mexcdevelop.github.io/apidocs/)                          | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |                                                                                                                                                                                                                                                |
| [![okx](https://user-images.githubusercontent.com/1294454/152485636-38b19e4a-bece-4dec-979a-5982859ffc04.jpg)](https://www.okx.com/join/CCXT2023)                                                             | okx                   | [OKX](https://www.okx.com/join/CCXT2023)                                                              | [![API Version 5](https://img.shields.io/badge/5-lightgray)](https://www.okx.com/docs-v5/en/)                                 | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) | [![Sign up with OKX using CCXT's referral link for a 20% discount!](https://img.shields.io/static/v1?label=Fee&message=%2d20%25&color=orange)](https://www.okx.com/join/CCXT2023)                                                              |
| [![woo](https://user-images.githubusercontent.com/1294454/150730761-1a00e5e0-d28c-480f-9e65-089ce3e6ef3b.jpg)](https://x.woo.org/register?ref=YWOWC96B)                                                       | woo                   | [WOO X](https://x.woo.org/register?ref=YWOWC96B)                                                      | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.woo.org/)                                           | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) | [![Sign up with WOO X using CCXT's referral link for a 35% discount!](https://img.shields.io/static/v1?label=Fee&message=%2d35%25&color=orange)](https://x.woo.org/register?ref=YWOWC96B)                                                      |

## Supported Cryptocurrency Exchanges

The CCXT library currently supports the following 97 cryptocurrency exchange markets and trading APIs:

| logo                                                                                                                                                                                                          | id                    | name                                                                                                  | ver                                                                                                                                              | certified                                                                                                                   | pro                                                                          |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|-------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------------------------------------------------------:|-----------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| [![ace](https://user-images.githubusercontent.com/1294454/216908003-fb314cf6-e66e-471c-b91d-1d86e4baaa90.jpg)](https://ace.io/)                                                                               | ace                   | [ACE](https://ace.io/)                                                                                | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://github.com/ace-exchange/ace-offical-api-docs)                               |                                                                                                                             |                                                                              |
| [![alpaca](https://user-images.githubusercontent.com/1294454/187234005-b864db3d-f1e3-447a-aaf9-a9fc7b955d07.jpg)](https://alpaca.markets)                                                                     | alpaca                | [Alpaca](https://alpaca.markets)                                                                      | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://alpaca.markets/docs/)                                                       |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![ascendex](https://user-images.githubusercontent.com/1294454/112027508-47984600-8b48-11eb-9e17-d26459cc36c6.jpg)](https://ascendex.com/en-us/register?inviteCode=EL6BXBQM)                                  | ascendex              | [AscendEX](https://ascendex.com/en-us/register?inviteCode=EL6BXBQM)                                   | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://ascendex.github.io/ascendex-pro-api/#ascendex-pro-api-documentation)        |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bequant](https://user-images.githubusercontent.com/1294454/55248342-a75dfe00-525a-11e9-8aa2-05e9dca943c6.jpg)](https://bequant.io/referral/dd104e3bee7634ec)                                               | bequant               | [Bequant](https://bequant.io/referral/dd104e3bee7634ec)                                               | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://api.bequant.io/)                                                            |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bigone](https://user-images.githubusercontent.com/1294454/69354403-1d532180-0c91-11ea-88ed-44c06cefdf87.jpg)](https://b1.run/users/new?code=D3LLBVFT)                                                      | bigone                | [BigONE](https://b1.run/users/new?code=D3LLBVFT)                                                      | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://open.big.one/docs/api.html)                                                 |                                                                                                                             |                                                                              |
| [![binance](https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg)](https://accounts.binance.com/en/register?ref=D7YA7CLY)                                      | binance               | [Binance](https://accounts.binance.com/en/register?ref=D7YA7CLY)                                      | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://binance-docs.github.io/apidocs/spot/en)                                     | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![binancecoinm](https://user-images.githubusercontent.com/1294454/117738721-668c8d80-b205-11eb-8c49-3fad84c4a07f.jpg)](https://accounts.binance.com/en/register?ref=D7YA7CLY)                                | binancecoinm          | [Binance COIN-M](https://accounts.binance.com/en/register?ref=D7YA7CLY)                               | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://binance-docs.github.io/apidocs/delivery/en/)                                | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![binanceus](https://user-images.githubusercontent.com/1294454/65177307-217b7c80-da5f-11e9-876e-0b748ba0a358.jpg)](https://www.binance.us/?ref=35005074)                                                     | binanceus             | [Binance US](https://www.binance.us/?ref=35005074)                                                    | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://github.com/binance-us/binance-official-api-docs)                            |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![binanceusdm](https://user-images.githubusercontent.com/1294454/117738721-668c8d80-b205-11eb-8c49-3fad84c4a07f.jpg)](https://accounts.binance.com/en/register?ref=D7YA7CLY)                                 | binanceusdm           | [Binance USDⓈ-M](https://accounts.binance.com/en/register?ref=D7YA7CLY)                               | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://binance-docs.github.io/apidocs/futures/en/)                                 | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bingx](https://github-production-user-asset-6210df.s3.amazonaws.com/1294454/253675376-6983b72e-4999-4549-b177-33b374c195e3.jpg)](https://bingx.com/invite/OHETOM)                                          | bingx                 | [BingX](https://bingx.com/invite/OHETOM)                                                              | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://bingx-api.github.io/docs/)                                                  | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bit2c](https://user-images.githubusercontent.com/1294454/27766119-3593220e-5ece-11e7-8b3a-5a041f6bcc3f.jpg)](https://bit2c.co.il/Aff/63bfed10-e359-420c-ab5a-ad368dab0baf)                                 | bit2c                 | [Bit2C](https://bit2c.co.il/Aff/63bfed10-e359-420c-ab5a-ad368dab0baf)                                 | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://www.bit2c.co.il/home/api)                                                   |                                                                                                                             |                                                                              |
| [![bitbank](https://user-images.githubusercontent.com/1294454/37808081-b87f2d9c-2e59-11e8-894d-c1900b7584fe.jpg)](https://bitbank.cc/)                                                                        | bitbank               | [bitbank](https://bitbank.cc/)                                                                        | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.bitbank.cc/)                                                           |                                                                                                                             |                                                                              |
| [![bitbns](https://user-images.githubusercontent.com/1294454/117201933-e7a6e780-adf5-11eb-9d80-98fc2a21c3d6.jpg)](https://ref.bitbns.com/1090961)                                                             | bitbns                | [Bitbns](https://ref.bitbns.com/1090961)                                                              | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://bitbns.com/trade/#/api-trading/)                                            |                                                                                                                             |                                                                              |
| [![bitfinex](https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg)](https://www.bitfinex.com/?refcode=P61eYxFL)                                                | bitfinex              | [Bitfinex](https://www.bitfinex.com/?refcode=P61eYxFL)                                                | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.bitfinex.com/v1/docs)                                                  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitfinex2](https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg)](https://www.bitfinex.com)                                                                 | bitfinex2             | [Bitfinex](https://www.bitfinex.com)                                                                  | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.bitfinex.com/v2/docs/)                                                 |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitflyer](https://user-images.githubusercontent.com/1294454/28051642-56154182-660e-11e7-9b0d-6042d1e6edd8.jpg)](https://bitflyer.com)                                                                      | bitflyer              | [bitFlyer](https://bitflyer.com)                                                                      | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://lightning.bitflyer.com/docs?lang=en)                                        |                                                                                                                             |                                                                              |
| [![bitget](https://user-images.githubusercontent.com/1294454/195989417-4253ddb0-afbe-4a1c-9dea-9dbcd121fa5d.jpg)](https://www.bitget.com/expressly?languageType=0&channelCode=ccxt&vipCode=tg9j)              | bitget                | [Bitget](https://www.bitget.com/expressly?languageType=0&channelCode=ccxt&vipCode=tg9j)               | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://www.bitget.com/api-doc/common/intro)                                        | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bithumb](https://user-images.githubusercontent.com/1294454/30597177-ea800172-9d5e-11e7-804c-b9d4fa9b56b0.jpg)](https://www.bithumb.com)                                                                    | bithumb               | [Bithumb](https://www.bithumb.com)                                                                    | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://apidocs.bithumb.com)                                                        |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitmart](https://user-images.githubusercontent.com/1294454/129991357-8f47464b-d0f4-41d6-8a82-34122f0d1398.jpg)](http://www.bitmart.com/?r=rQCFLh)                                                          | bitmart               | [BitMart](http://www.bitmart.com/?r=rQCFLh)                                                           | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://developer-pro.bitmart.com/)                                                 | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitmex](https://github.com/ccxt/ccxt/assets/43336371/cea9cfe5-c57e-4b84-b2ac-77b960b04445)](https://www.bitmex.com/app/register/NZTR1q)                                                                    | bitmex                | [BitMEX](https://www.bitmex.com/app/register/NZTR1q)                                                  | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://www.bitmex.com/app/apiOverview)                                             | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitopro](https://user-images.githubusercontent.com/1294454/158227251-3a92a220-9222-453c-9277-977c6677fe71.jpg)](https://www.bitopro.com)                                                                   | bitopro               | [BitoPro](https://www.bitopro.com)                                                                    | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://github.com/bitoex/bitopro-offical-api-docs/blob/master/v3-1/rest-1/rest.md) |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitrue](https://user-images.githubusercontent.com/1294454/139516488-243a830d-05dd-446b-91c6-c1f18fe30c63.jpg)](https://www.bitrue.com/affiliate/landing?cn=600000&inviteCode=EZWETQE)                      | bitrue                | [Bitrue](https://www.bitrue.com/affiliate/landing?cn=600000&inviteCode=EZWETQE)                       | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://github.com/Bitrue-exchange/bitrue-official-api-docs)                        |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitso](https://user-images.githubusercontent.com/51840849/87295554-11f98280-c50e-11ea-80d6-15b3bafa8cbf.jpg)](https://bitso.com/?ref=itej)                                                                 | bitso                 | [Bitso](https://bitso.com/?ref=itej)                                                                  | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://bitso.com/api_info)                                                         |                                                                                                                             |                                                                              |
| [![bitstamp](https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg)](https://www.bitstamp.net)                                                                  | bitstamp              | [Bitstamp](https://www.bitstamp.net)                                                                  | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://www.bitstamp.net/api)                                                       |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitteam](https://github.com/ccxt/ccxt/assets/43336371/cf71fe3d-b8b4-40f2-a906-907661b28793)](https://bit.team/auth/sign-up?ref=bitboy2023)                                                                 | bitteam               | [BIT.TEAM](https://bit.team/auth/sign-up?ref=bitboy2023)                                              | [![API Version 2.0.6](https://img.shields.io/badge/2.0.6-lightgray)](https://bit.team/trade/api/documentation)                                   |                                                                                                                             |                                                                              |
| [![bitvavo](https://user-images.githubusercontent.com/1294454/169202626-bd130fc5-fcf9-41bb-8d97-6093225c73cd.jpg)](https://bitvavo.com/?a=24F34952F7)                                                         | bitvavo               | [Bitvavo](https://bitvavo.com/?a=24F34952F7)                                                          | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.bitvavo.com/)                                                          |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bl3p](https://user-images.githubusercontent.com/1294454/28501752-60c21b82-6feb-11e7-818b-055ee6d0e754.jpg)](https://bl3p.eu)                                                                               | bl3p                  | [BL3P](https://bl3p.eu)                                                                               | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://github.com/BitonicNL/bl3p-api/tree/master/docs)                             |                                                                                                                             |                                                                              |
| [![blockchaincom](https://user-images.githubusercontent.com/1294454/147515585-1296e91b-7398-45e5-9d32-f6121538533f.jpeg)](https://blockchain.com)                                                             | blockchaincom         | [Blockchain.com](https://blockchain.com)                                                              | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://api.blockchain.com/v3)                                                      |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![blofin](https://github.com/ccxt/ccxt/assets/43336371/255a7b29-341f-4d20-8342-fbfae4932807)](https://blofin.com/register?referral_code=jBd8U1)                                                              | blofin                | [BloFin](https://blofin.com/register?referral_code=jBd8U1)                                            | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://blofin.com/docs)                                                            |                                                                                                                             |                                                                              |
| [![btcalpha](https://user-images.githubusercontent.com/1294454/42625213-dabaa5da-85cf-11e8-8f99-aa8f8f7699f0.jpg)](https://btc-alpha.com/?r=123788)                                                           | btcalpha              | [BTC-Alpha](https://btc-alpha.com/?r=123788)                                                          | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://btc-alpha.github.io/api-docs)                                               |                                                                                                                             |                                                                              |
| [![btcbox](https://user-images.githubusercontent.com/51840849/87327317-98c55400-c53c-11ea-9a11-81f7d951cc74.jpg)](https://www.btcbox.co.jp/)                                                                  | btcbox                | [BtcBox](https://www.btcbox.co.jp/)                                                                   | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://blog.btcbox.jp/en/archives/8762)                                            |                                                                                                                             |                                                                              |
| [![btcmarkets](https://user-images.githubusercontent.com/51840849/89731817-b3fb8480-da52-11ea-817f-783b08aaf32b.jpg)](https://btcmarkets.net)                                                                 | btcmarkets            | [BTC Markets](https://btcmarkets.net)                                                                 | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://api.btcmarkets.net/doc/v3)                                                  |                                                                                                                             |                                                                              |
| [![btcturk](https://user-images.githubusercontent.com/51840849/87153926-efbef500-c2c0-11ea-9842-05b63612c4b9.jpg)](https://www.btcturk.com)                                                                   | btcturk               | [BTCTurk](https://www.btcturk.com)                                                                    | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://github.com/BTCTrader/broker-api-docs)                                       |                                                                                                                             |                                                                              |
| [![bybit](https://user-images.githubusercontent.com/51840849/76547799-daff5b80-649e-11ea-87fb-3be9bac08954.jpg)](https://www.bybit.com/register?affiliate_id=35953)                                           | bybit                 | [Bybit](https://www.bybit.com/register?affiliate_id=35953)                                            | [![API Version 5](https://img.shields.io/badge/5-lightgray)](https://bybit-exchange.github.io/docs/inverse/)                                     | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![cex](https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg)](https://cex.io/r/0/up105393824/0/)                                                              | cex                   | [CEX.IO](https://cex.io/r/0/up105393824/0/)                                                           | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://cex.io/cex-api)                                                             |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![coinbase](https://user-images.githubusercontent.com/1294454/40811661-b6eceae2-653a-11e8-829e-10bfadb078cf.jpg)](https://www.coinbase.com/join/58cbe25a355148797479dbd2)                                    | coinbase              | [Coinbase Advanced](https://www.coinbase.com/join/58cbe25a355148797479dbd2)                           | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://developers.coinbase.com/api/v2)                                             | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![coinbaseinternational](https://github.com/ccxt/ccxt/assets/43336371/866ae638-6ab5-4ebf-ab2c-cdcce9545625)](https://international.coinbase.com)                                                             | coinbaseinternational | [Coinbase International](https://international.coinbase.com)                                          | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.cloud.coinbase.com/intx/docs)                                          | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![coinbasepro](https://user-images.githubusercontent.com/1294454/41764625-63b7ffde-760a-11e8-996d-a6328fa9347a.jpg)](https://pro.coinbase.com/)                                                              | coinbasepro           | [Coinbase Pro(Deprecated)](https://pro.coinbase.com/)                                                 | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://docs.pro.coinbase.com)                                                      |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![coincheck](https://user-images.githubusercontent.com/51840849/87182088-1d6d6380-c2ec-11ea-9c64-8ab9f9b289f5.jpg)](https://coincheck.com)                                                                   | coincheck             | [coincheck](https://coincheck.com)                                                                    | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://coincheck.com/documents/exchange/api)                                       |                                                                                                                             |                                                                              |
| [![coinex](https://user-images.githubusercontent.com/51840849/87182089-1e05fa00-c2ec-11ea-8da9-cc73b45abbbc.jpg)](https://www.coinex.com/register?refer_code=yw5fz)                                           | coinex                | [CoinEx](https://www.coinex.com/register?refer_code=yw5fz)                                            | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.coinex.com/api/v2)                                                     | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![coinlist](https://github-production-user-asset-6210df.s3.amazonaws.com/1294454/281108917-eff2ae1d-ce8a-4b2a-950d-8678b12da965.jpg)](https://coinlist.co)                                                   | coinlist              | [Coinlist](https://coinlist.co)                                                                       | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://trade-docs.coinlist.co)                                                     |                                                                                                                             |                                                                              |
| [![coinmate](https://user-images.githubusercontent.com/51840849/87460806-1c9f3f00-c616-11ea-8c46-a77018a8f3f4.jpg)](https://coinmate.io?referral=YTFkM1RsOWFObVpmY1ZjMGREQmpTRnBsWjJJNVp3PT0)                 | coinmate              | [CoinMate](https://coinmate.io?referral=YTFkM1RsOWFObVpmY1ZjMGREQmpTRnBsWjJJNVp3PT0)                  | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://coinmate.docs.apiary.io)                                                    |                                                                                                                             |                                                                              |
| [![coinmetro](https://github.com/ccxt/ccxt/assets/43336371/e86f87ec-6ba3-4410-962b-f7988c5db539)](https://go.coinmetro.com/?ref=crypto24)                                                                     | coinmetro             | [Coinmetro](https://go.coinmetro.com/?ref=crypto24)                                                   | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://documenter.getpostman.com/view/3653795/SVfWN6KS)                            |                                                                                                                             |                                                                              |
| [![coinone](https://user-images.githubusercontent.com/1294454/38003300-adc12fba-323f-11e8-8525-725f53c4a659.jpg)](https://coinone.co.kr)                                                                      | coinone               | [CoinOne](https://coinone.co.kr)                                                                      | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://doc.coinone.co.kr)                                                          |                                                                                                                             |                                                                              |
| [![coinsph](https://user-images.githubusercontent.com/1294454/225719995-48ab2026-4ddb-496c-9da7-0d7566617c9b.jpg)](https://coins.ph/)                                                                         | coinsph               | [Coins.ph](https://coins.ph/)                                                                         | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://coins-docs.github.io/rest-api)                                              |                                                                                                                             |                                                                              |
| [![coinspot](https://user-images.githubusercontent.com/1294454/28208429-3cacdf9a-6896-11e7-854e-4c79a772a30f.jpg)](https://www.coinspot.com.au/register?code=PJURCU)                                          | coinspot              | [CoinSpot](https://www.coinspot.com.au/register?code=PJURCU)                                          | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://www.coinspot.com.au/api)                                                    |                                                                                                                             |                                                                              |
| [![cryptocom](https://user-images.githubusercontent.com/1294454/147792121-38ed5e36-c229-48d6-b49a-48d05fc19ed4.jpeg)](https://crypto.com/exch/kdacthrnxt)                                                     | cryptocom             | [Crypto.com](https://crypto.com/exch/kdacthrnxt)                                                      | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html)                    | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![currencycom](https://user-images.githubusercontent.com/1294454/83718672-36745c00-a63e-11ea-81a9-677b1f789a4d.jpg)](https://currency.com/trading/signup?c=362jaimv&pid=referral)                            | currencycom           | [Currency.com](https://currency.com/trading/signup?c=362jaimv&pid=referral)                           | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://currency.com/api)                                                           |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![delta](https://user-images.githubusercontent.com/1294454/99450025-3be60a00-2931-11eb-9302-f4fd8d8589aa.jpg)](https://www.delta.exchange/app/signup/?code=IULYNB)                                           | delta                 | [Delta Exchange](https://www.delta.exchange/app/signup/?code=IULYNB)                                  | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.delta.exchange)                                                        |                                                                                                                             |                                                                              |
| [![deribit](https://user-images.githubusercontent.com/1294454/41933112-9e2dd65a-798b-11e8-8440-5bab2959fcb8.jpg)](https://www.deribit.com/reg-1189.4038)                                                      | deribit               | [Deribit](https://www.deribit.com/reg-1189.4038)                                                      | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.deribit.com/v2)                                                        |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![digifinex](https://user-images.githubusercontent.com/51840849/87443315-01283a00-c5fe-11ea-8628-c2a0feaf07ac.jpg)](https://www.digifinex.com/en-ww/from/DhOzBg?channelCode=ljaUPp)                          | digifinex             | [DigiFinex](https://www.digifinex.com/en-ww/from/DhOzBg?channelCode=ljaUPp)                           | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://docs.digifinex.com)                                                         |                                                                                                                             |                                                                              |
| [![exmo](https://user-images.githubusercontent.com/1294454/27766491-1b0ea956-5eda-11e7-9225-40d67b481b8d.jpg)](https://exmo.me/?ref=131685)                                                                   | exmo                  | [EXMO](https://exmo.me/?ref=131685)                                                                   | [![API Version 1.1](https://img.shields.io/badge/1.1-lightgray)](https://exmo.me/en/api_doc?ref=131685)                                          |                                                                                                                             |                                                                              |
| [![fmfwio](https://user-images.githubusercontent.com/1294454/159177712-b685b40c-5269-4cea-ac83-f7894c49525d.jpg)](https://fmfw.io/referral/da948b21d6c92d69)                                                  | fmfwio                | [FMFW.io](https://fmfw.io/referral/da948b21d6c92d69)                                                  | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://api.fmfw.io/)                                                               |                                                                                                                             |                                                                              |
| [![gate](https://user-images.githubusercontent.com/1294454/31784029-0313c702-b509-11e7-9ccc-bc0da6a0e435.jpg)](https://www.gate.io/signup/2436035)                                                            | gate                  | [Gate.io](https://www.gate.io/signup/2436035)                                                         | [![API Version 4](https://img.shields.io/badge/4-lightgray)](https://www.gate.io/docs/developers/apiv4/en/)                                      | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![gemini](https://user-images.githubusercontent.com/1294454/27816857-ce7be644-6096-11e7-82d6-3c257263229c.jpg)](https://gemini.com/)                                                                         | gemini                | [Gemini](https://gemini.com/)                                                                         | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.gemini.com/rest-api)                                                   |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![hitbtc](https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg)](https://hitbtc.com/?ref_id=5a5d39a65d466)                                                    | hitbtc                | [HitBTC](https://hitbtc.com/?ref_id=5a5d39a65d466)                                                    | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://api.hitbtc.com)                                                             |                                                                                                                             |                                                                              |
| [![hollaex](https://user-images.githubusercontent.com/1294454/75841031-ca375180-5ddd-11ea-8417-b975674c23cb.jpg)](https://pro.hollaex.com/signup?affiliation_code=QSWA6G)                                     | hollaex               | [HollaEx](https://pro.hollaex.com/signup?affiliation_code=QSWA6G)                                     | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://apidocs.hollaex.com)                                                        |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![htx](https://user-images.githubusercontent.com/1294454/76137448-22748a80-604e-11ea-8069-6e389271911d.jpg)](https://www.huobi.com/en-us/v/register/double-invite/?inviter_id=11343840&invite_code=6rmm2223) | htx                   | [HTX](https://www.huobi.com/en-us/v/register/double-invite/?inviter_id=11343840&invite_code=6rmm2223) | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://huobiapi.github.io/docs/spot/v1/en/)                                        | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![huobijp](https://user-images.githubusercontent.com/1294454/85734211-85755480-b705-11ea-8b35-0b7f1db33a2f.jpg)](https://www.huobi.co.jp/register/?invite_code=znnq3)                                        | huobijp               | [Huobi Japan](https://www.huobi.co.jp/register/?invite_code=znnq3)                                    | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://api-doc.huobi.co.jp)                                                        |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![hyperliquid](https://github.com/ccxt/ccxt/assets/43336371/b371bc6c-4a8c-489f-87f4-20a913dd8d4b)](https://app.hyperliquid.xyz/)                                                                             | hyperliquid           | [Hyperliquid](https://app.hyperliquid.xyz/)                                                           | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api)                 |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![idex](https://user-images.githubusercontent.com/51840849/94481303-2f222100-01e0-11eb-97dd-bc14c5943a86.jpg)](https://idex.io)                                                                              | idex                  | [IDEX](https://idex.io)                                                                               | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://api-docs-v3.idex.io/)                                                       |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![independentreserve](https://user-images.githubusercontent.com/51840849/87182090-1e9e9080-c2ec-11ea-8e49-563db9a38f37.jpg)](https://www.independentreserve.com)                                             | independentreserve    | [Independent Reserve](https://www.independentreserve.com)                                             | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://www.independentreserve.com/API)                                             |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![indodax](https://user-images.githubusercontent.com/51840849/87070508-9358c880-c221-11ea-8dc5-5391afbbb422.jpg)](https://indodax.com/ref/testbitcoincoid/1)                                                 | indodax               | [INDODAX](https://indodax.com/ref/testbitcoincoid/1)                                                  | [![API Version 2.0](https://img.shields.io/badge/2.0-lightgray)](https://github.com/btcid/indodax-official-api-docs)                             |                                                                                                                             |                                                                              |
| [![kraken](https://user-images.githubusercontent.com/51840849/76173629-fc67fb00-61b1-11ea-84fe-f2de582f58a3.jpg)](https://www.kraken.com)                                                                     | kraken                | [Kraken](https://www.kraken.com)                                                                      | [![API Version 0](https://img.shields.io/badge/0-lightgray)](https://docs.kraken.com/rest/)                                                      |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![krakenfutures](https://user-images.githubusercontent.com/24300605/81436764-b22fd580-9172-11ea-9703-742783e6376d.jpg)](https://futures.kraken.com/)                                                         | krakenfutures         | [Kraken Futures](https://futures.kraken.com/)                                                         | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://docs.futures.kraken.com/#introduction)                                      |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![kucoin](https://user-images.githubusercontent.com/51840849/87295558-132aaf80-c50e-11ea-9801-a2fb0c57c799.jpg)](https://www.kucoin.com/ucenter/signup?rcode=E5wkqe)                                         | kucoin                | [KuCoin](https://www.kucoin.com/ucenter/signup?rcode=E5wkqe)                                          | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.kucoin.com)                                                            | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![kucoinfutures](https://user-images.githubusercontent.com/1294454/147508995-9e35030a-d046-43a1-a006-6fabd981b554.jpg)](https://futures.kucoin.com/?rcode=E5wkqe)                                            | kucoinfutures         | [KuCoin Futures](https://futures.kucoin.com/?rcode=E5wkqe)                                            | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.kucoin.com/futures)                                                    | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![kuna](https://user-images.githubusercontent.com/51840849/87153927-f0578b80-c2c0-11ea-84b6-74612568e9e1.jpg)](https://kuna.io?r=kunaid-gvfihe8az7o4)                                                        | kuna                  | [Kuna](https://kuna.io?r=kunaid-gvfihe8az7o4)                                                         | [![API Version 4](https://img.shields.io/badge/4-lightgray)](https://kuna.io/documents/api)                                                      |                                                                                                                             |                                                                              |
| [![latoken](https://user-images.githubusercontent.com/1294454/61511972-24c39f00-aa01-11e9-9f7c-471f1d6e5214.jpg)](https://latoken.com/invite?r=mvgp2djk)                                                      | latoken               | [Latoken](https://latoken.com/invite?r=mvgp2djk)                                                      | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://api.latoken.com)                                                            |                                                                                                                             |                                                                              |
| [![lbank](https://user-images.githubusercontent.com/1294454/38063602-9605e28a-3302-11e8-81be-64b1e53c4cfb.jpg)](https://www.lbank.com/login/?icode=7QCY)                                                      | lbank                 | [LBank](https://www.lbank.com/login/?icode=7QCY)                                                      | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://www.lbank.com/en-US/docs/index.html)                                        |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![luno](https://user-images.githubusercontent.com/1294454/27766607-8c1a69d8-5ede-11e7-930c-540b5eb9be24.jpg)](https://www.luno.com/invite/44893A)                                                            | luno                  | [luno](https://www.luno.com/invite/44893A)                                                            | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://www.luno.com/en/api)                                                        |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![lykke](https://user-images.githubusercontent.com/1294454/155840500-1ea4fdf0-47c0-4daa-9597-c6c1cd51b9ec.jpg)](https://www.lykke.com)                                                                       | lykke                 | [Lykke](https://www.lykke.com)                                                                        | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://hft-apiv2.lykke.com/swagger/ui/index.html)                                  |                                                                                                                             |                                                                              |
| [![mercado](https://user-images.githubusercontent.com/1294454/27837060-e7c58714-60ea-11e7-9192-f05e86adb83f.jpg)](https://www.mercadobitcoin.com.br)                                                          | mercado               | [Mercado Bitcoin](https://www.mercadobitcoin.com.br)                                                  | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://www.mercadobitcoin.com.br/api-doc)                                          |                                                                                                                             |                                                                              |
| [![mexc](https://user-images.githubusercontent.com/1294454/137283979-8b2a818d-8633-461b-bfca-de89e8c446b2.jpg)](https://m.mexc.com/auth/signup?inviteCode=1FQ1G)                                              | mexc                  | [MEXC Global](https://m.mexc.com/auth/signup?inviteCode=1FQ1G)                                        | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://mexcdevelop.github.io/apidocs/)                                             | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![ndax](https://user-images.githubusercontent.com/1294454/108623144-67a3ef00-744e-11eb-8140-75c6b851e945.jpg)](https://one.ndax.io/bfQiSL)                                                                   | ndax                  | [NDAX](https://one.ndax.io/bfQiSL)                                                                    | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://apidoc.ndax.io/)                                                            |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![novadax](https://user-images.githubusercontent.com/1294454/92337550-2b085500-f0b3-11ea-98e7-5794fb07dd3b.jpg)](https://www.novadax.com.br/?s=ccxt)                                                         | novadax               | [NovaDAX](https://www.novadax.com.br/?s=ccxt)                                                         | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://doc.novadax.com/pt-BR/)                                                     |                                                                                                                             |                                                                              |
| [![oceanex](https://user-images.githubusercontent.com/1294454/58385970-794e2d80-8001-11e9-889c-0567cd79b78e.jpg)](https://oceanex.pro/signup?referral=VE24QX)                                                 | oceanex               | [OceanEx](https://oceanex.pro/signup?referral=VE24QX)                                                 | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://api.oceanex.pro/doc/v1)                                                     |                                                                                                                             |                                                                              |
| [![okcoin](https://user-images.githubusercontent.com/51840849/87295551-102fbf00-c50e-11ea-90a9-462eebba5829.jpg)](https://www.okcoin.com/account/register?flag=activity&channelId=600001513)                  | okcoin                | [OKCoin](https://www.okcoin.com/account/register?flag=activity&channelId=600001513)                   | [![API Version 5](https://img.shields.io/badge/5-lightgray)](https://www.okcoin.com/docs/en/)                                                    |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![okx](https://user-images.githubusercontent.com/1294454/152485636-38b19e4a-bece-4dec-979a-5982859ffc04.jpg)](https://www.okx.com/join/CCXT2023)                                                             | okx                   | [OKX](https://www.okx.com/join/CCXT2023)                                                              | [![API Version 5](https://img.shields.io/badge/5-lightgray)](https://www.okx.com/docs-v5/en/)                                                    | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![onetrading](https://github.com/ccxt/ccxt/assets/43336371/bdbc26fd-02f2-4ca7-9f1e-17333690bb1c)](https://onetrading.com/)                                                                                   | onetrading            | [One Trading](https://onetrading.com/)                                                                | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.onetrading.com)                                                        |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![p2b](https://github.com/ccxt/ccxt/assets/43336371/8da13a80-1f0a-49be-bb90-ff8b25164755)](https://p2pb2b.com?referral=ee784c53)                                                                             | p2b                   | [p2b](https://p2pb2b.com?referral=ee784c53)                                                           | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://github.com/P2B-team/p2b-api-docs/blob/master/api-doc.md)                    |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![paymium](https://user-images.githubusercontent.com/51840849/87153930-f0f02200-c2c0-11ea-9c0a-40337375ae89.jpg)](https://www.paymium.com/page/sign-up?referral=eDAzPoRQFMvaAB8sf-qj)                        | paymium               | [Paymium](https://www.paymium.com/page/sign-up?referral=eDAzPoRQFMvaAB8sf-qj)                         | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://github.com/Paymium/api-documentation)                                       |                                                                                                                             |                                                                              |
| [![phemex](https://user-images.githubusercontent.com/1294454/85225056-221eb600-b3d7-11ea-930d-564d2690e3f6.jpg)](https://phemex.com/register?referralCode=EDNVJ)                                              | phemex                | [Phemex](https://phemex.com/register?referralCode=EDNVJ)                                              | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://github.com/phemex/phemex-api-docs)                                          |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![poloniex](https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg)](https://poloniex.com/signup?c=UBFZJRPJ)                                                    | poloniex              | [Poloniex](https://poloniex.com/signup?c=UBFZJRPJ)                                                    | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://docs.poloniex.com)                                                          |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![poloniexfutures](https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg)](https://poloniex.com/signup?c=UBFZJRPJ)                                             | poloniexfutures       | [Poloniex Futures](https://poloniex.com/signup?c=UBFZJRPJ)                                            | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://futures-docs.poloniex.com)                                                  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![probit](https://user-images.githubusercontent.com/51840849/79268032-c4379480-7ea2-11ea-80b3-dd96bb29fd0d.jpg)](https://www.probit.com/r/34608773)                                                          | probit                | [ProBit](https://www.probit.com/r/34608773)                                                           | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs-en.probit.com)                                                         |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![timex](https://user-images.githubusercontent.com/1294454/70423869-6839ab00-1a7f-11ea-8f94-13ae72c31115.jpg)](https://timex.io/?refcode=1x27vNkTbP1uwkCck)                                                  | timex                 | [TimeX](https://timex.io/?refcode=1x27vNkTbP1uwkCck)                                                  | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://plasma-relay-backend.timex.io/swagger-ui/index.html)                        |                                                                                                                             |                                                                              |
| [![tokocrypto](https://user-images.githubusercontent.com/1294454/183870484-d3398d0c-f6a1-4cce-91b8-d58792308716.jpg)](https://tokocrypto.com)                                                                 | tokocrypto            | [Tokocrypto](https://tokocrypto.com)                                                                  | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://www.tokocrypto.com/apidocs/)                                                |                                                                                                                             |                                                                              |
| [![tradeogre](https://github.com/ccxt/ccxt/assets/43336371/3aa748b7-ea44-45e9-a9e7-b1d207a2578a)](https://tradeogre.com)                                                                                      | tradeogre             | [tradeogre](https://tradeogre.com)                                                                    | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://tradeogre.com/help/api)                                                     |                                                                                                                             |                                                                              |
| [![upbit](https://user-images.githubusercontent.com/1294454/49245610-eeaabe00-f423-11e8-9cba-4b0aed794799.jpg)](https://upbit.com)                                                                            | upbit                 | [Upbit](https://upbit.com)                                                                            | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.upbit.com/docs/%EC%9A%94%EC%B2%AD-%EC%88%98-%EC%A0%9C%ED%95%9C)        |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![wavesexchange](https://user-images.githubusercontent.com/1294454/84547058-5fb27d80-ad0b-11ea-8711-78ac8b3c7f31.jpg)](https://wx.network)                                                                   | wavesexchange         | [Waves.Exchange](https://wx.network)                                                                  | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://docs.wx.network)                                                            |                                                                                                                             |                                                                              |
| [![wazirx](https://user-images.githubusercontent.com/1294454/148647666-c109c20b-f8ac-472f-91c3-5f658cb90f49.jpeg)](https://wazirx.com/invite/k7rrnks5)                                                        | wazirx                | [WazirX](https://wazirx.com/invite/k7rrnks5)                                                          | [![API Version 2](https://img.shields.io/badge/2-lightgray)](https://docs.wazirx.com/#public-rest-api-for-wazirx)                                |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![whitebit](https://user-images.githubusercontent.com/1294454/66732963-8eb7dd00-ee66-11e9-849b-10d9282bb9e0.jpg)](https://whitebit.com/referral/d9bdf40e-28f2-4b52-b2f9-cd1415d82963)                        | whitebit              | [WhiteBit](https://whitebit.com/referral/d9bdf40e-28f2-4b52-b2f9-cd1415d82963)                        | [![API Version 4](https://img.shields.io/badge/4-lightgray)](https://github.com/whitebit-exchange/api-docs)                                      |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![woo](https://user-images.githubusercontent.com/1294454/150730761-1a00e5e0-d28c-480f-9e65-089ce3e6ef3b.jpg)](https://x.woo.org/register?ref=YWOWC96B)                                                       | woo                   | [WOO X](https://x.woo.org/register?ref=YWOWC96B)                                                      | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://docs.woo.org/)                                                              | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![yobit](https://user-images.githubusercontent.com/1294454/27766910-cdcbfdae-5eea-11e7-9859-03fea873272d.jpg)](https://www.yobit.net)                                                                        | yobit                 | [YoBit](https://www.yobit.net)                                                                        | [![API Version 3](https://img.shields.io/badge/3-lightgray)](https://www.yobit.net/en/api/)                                                      |                                                                                                                             |                                                                              |
| [![zaif](https://user-images.githubusercontent.com/1294454/27766927-39ca2ada-5eeb-11e7-972f-1b4199518ca6.jpg)](https://zaif.jp)                                                                               | zaif                  | [Zaif](https://zaif.jp)                                                                               | [![API Version 1](https://img.shields.io/badge/1-lightgray)](https://techbureau-api-document.readthedocs.io/ja/latest/index.html)                |                                                                                                                             |                                                                              |
| [![zonda](https://user-images.githubusercontent.com/1294454/159202310-a0e38007-5e7c-4ba9-a32f-c8263a0291fe.jpg)](https://auth.zondaglobal.com/ref/jHlbB4mIkdS1)                                               | zonda                 | [Zonda](https://auth.zondaglobal.com/ref/jHlbB4mIkdS1)                                                | [![API Version *](https://img.shields.io/badge/*-lightgray)](https://docs.zondacrypto.exchange/)                                                 |                                                                                                                             |                                                                              |

The list above is updated frequently, new crypto markets, exchanges, bug fixes, and API endpoints are introduced on a regular basis. See the [Manual](https://github.com/ccxt/ccxt/wiki/) for more details. If you can't find a cryptocurrency exchange in the list above and want it to be added, post a link to it by opening an issue here on GitHub or send us an email.

The library is under [MIT license](https://github.com/ccxt/ccxt/blob/master/LICENSE.txt), that means it's absolutely free for any developer to build commercial and opensource software on top of it, but use it at your own risk with no warranties, as is.

---

## Install

The easiest way to install the CCXT library is to use a package manager:

- [ccxt in **NPM**](https://www.npmjs.com/package/ccxt) (JavaScript / Node v7.6+)
- [ccxt in **PyPI**](https://pypi.python.org/pypi/ccxt) (Python 3.7.0+)
- [ccxt in **Packagist/Composer**](https://packagist.org/packages/ccxt/ccxt) (PHP 7.0+)
- [ccxt in **Nuget**](https://www.nuget.org/packages/ccxt) (netstandard 2.0)

This library is shipped as an all-in-one module implementation with minimalistic dependencies and requirements:

- [js/](https://github.com/ccxt/ccxt/blob/master/js/) in JavaScript
- [python/](https://github.com/ccxt/ccxt/blob/master/python/) in Python (generated from JS)
- [php/](https://github.com/ccxt/ccxt/blob/master/php/) in PHP (generated from JS)

You can also clone it into your project directory from [ccxt GitHub repository](https://github.com/ccxt/ccxt):

```shell
git clone https://github.com/ccxt/ccxt.git  # including 1GB of commit history

# or

git clone https://github.com/ccxt/ccxt.git --depth 1  # avoid downloading 1GB of commit history
```

### JavaScript (NPM)

JavaScript version of CCXT works in both Node and web browsers. Requires ES6 and `async/await` syntax support (Node 7.6.0+). When compiling with Webpack and Babel, make sure it is [not excluded](https://github.com/ccxt/ccxt/issues/225#issuecomment-331905178) in your `babel-loader` config.

[ccxt in **NPM**](https://www.npmjs.com/package/ccxt)

```shell
npm install ccxt
```

```JavaScript
//cjs
var ccxt = require ('ccxt')
console.log (ccxt.exchanges) // print all available exchanges
```
```Javascript
//esm
import {version, exchanges} from 'ccxt';
console.log(version, Object.keys(exchanges));
```

### JavaScript (for use with the `<script>` tag):

All-in-one browser bundle (dependencies included), served from a CDN of your choice:

* jsDelivr: https://cdn.jsdelivr.net/npm/ccxt@4.3.16/dist/ccxt.browser.js
* unpkg: https://unpkg.com/ccxt@4.3.16/dist/ccxt.browser.js

CDNs are not updated in real-time and may have delays. Defaulting to the most recent version without specifying the version number is not recommended. Please, keep in mind that we are not responsible for the correct operation of those CDN servers.

```HTML
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/ccxt@4.3.16/dist/ccxt.browser.js"></script>
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

The library supports concurrent asynchronous mode with asyncio and async/await in Python 3.7.0+

```Python
import ccxt.async_support as ccxt # link against the asynchronous version of ccxt
```

### PHP

[ccxt in PHP with **Packagist/Composer**](https://packagist.org/packages/ccxt/ccxt) (PHP 7.0+)

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

The library supports concurrent asynchronous mode using tools from [RecoilPHP](https://github.com/recoilphp/recoil) and [ReactPHP](https://reactphp.org/) in PHP 7.1+. Read the [Manual](https://github.com/ccxt/ccxt/wiki/) for more details.

### .net/C#

[ccxt in C# with **Nuget**](https://www.nuget.org/packages/ccxt) (netstandard 2.0 and netstandard 2.1)
```c#
using ccxt;
Console.WriteLine(ccxt.Exchanges) // check this later
```

### Docker

You can get CCXT installed in a container along with all the supported languages and dependencies. This may be useful if you want to contribute to CCXT (e.g. run the build scripts and tests — please see the [Contributing](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) document for the details on that).

Using `docker-compose` (in the cloned CCXT repository):

```shell
docker-compose run --rm ccxt
```

You don't need the Docker image if you're not going to develop CCXT. If you just want to use CCXT – just install it as a regular package into your project.

---

## Documentation

Read the [Manual](https://github.com/ccxt/ccxt/wiki/) for more details.

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

This library implements full public and private REST and WebSocket APIs for all exchanges in TypeScript, JavaScript, PHP and Python.

The CCXT library supports both camelcase notation (preferred in TypeScript and JavaScript) and underscore notation (preferred in Python and PHP), therefore all methods can be called in either notation or coding style in any language.

```JavaScript
// both of these notations work in JavaScript/Python/PHP
exchange.methodName ()  // camelcase pseudocode
exchange.method_name () // underscore pseudocode
```

Read the [Manual](https://github.com/ccxt/ccxt/wiki/) for more details.

### JavaScript

**CCXT now supports ESM and CJS modules**

#### CJS

```JavaScript
// cjs example
'use strict';
const ccxt = require ('ccxt');

(async function () {
    let kraken    = new ccxt.kraken ()
    let bitfinex  = new ccxt.bitfinex ({ verbose: true })
    let huobipro  = new ccxt.huobipro ()
    let okcoinusd = new ccxt.okcoin ({
        apiKey: 'YOUR_PUBLIC_API_KEY',
        secret: 'YOUR_SECRET_PRIVATE_KEY',
    })

    const exchangeId = 'binance'
        , exchangeClass = ccxt[exchangeId]
        , exchange = new exchangeClass ({
            'apiKey': 'YOUR_API_KEY',
            'secret': 'YOUR_SECRET',
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
#### ESM

```Javascript
//esm example
import {version, binance} from 'ccxt';

console.log(version);
const exchange = new binance();
const ticker = await exchange.fetchTicker('BTC/USDT');
console.log(ticker);
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

### .net/C#

```C#
using ccxt; // importing ccxt
namespace Project;
class Project {
    public async static Task CreateOrder() {
        var exchange = new Binance();
        exchange.apiKey = "my api key";
        exchange.secret = "my secret";
        // always use the capitalized method (CreateOrder instead of createOrder)
        var order = await exchange.CreateOrder("BTC/USDT", "limit", "buy", 1, 50);
        Console.WriteLine("Placed Order, order id: " + order.id);
    }
}
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

- <sub>[![Twitter](https://img.shields.io/twitter/follow/ccxt_official?style=social)](https://twitter.com/ccxt_official)</sub> Follow us on Twitter
- <sub>[![Medium](https://img.shields.io/badge/read-our%20blog-black?logo=medium)](https://medium.com/@ccxt)</sub> Read our blog on Medium
- <sub>[![Discord](https://img.shields.io/discord/690203284119617602?logo=discord&logoColor=white)](https://discord.gg/dhzSKYU)</sub> Join our Discord
- <sub>[![Telegram Announcements](https://img.shields.io/badge/CCXT-Channel-blue?logo=telegram)](https://t.me/ccxt_announcements)</sub> CCXT Channel on Telegram (important announcements)
- <sub>[![Telegram Chat](https://img.shields.io/badge/CCXT-Chat-blue?logo=telegram)](https://t.me/ccxt_chat)</sub> CCXT Chat on Telegram (technical support)


## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=ccxt/ccxt&type=Date)](https://star-history.com/#ccxt/ccxt&Date)

## Contact Us

For business inquiries: info@ccxt.trade
