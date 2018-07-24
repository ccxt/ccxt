# CCXT – CryptoCurrency eXchange Trading Library

[![Build Status](https://travis-ci.org/ccxt/ccxt.svg?branch=master)](https://travis-ci.org/ccxt/ccxt) [![npm](https://img.shields.io/npm/v/ccxt.svg)](https://npmjs.com/package/ccxt) [![PyPI](https://img.shields.io/pypi/v/ccxt.svg)](https://pypi.python.org/pypi/ccxt) [![NPM Downloads](https://img.shields.io/npm/dm/ccxt.svg)](https://www.npmjs.com/package/ccxt) [![NSP Status](https://nodesecurity.io/orgs/ccxt/projects/856d3088-8b46-4515-9324-6b7cd2470522/badge)](https://nodesecurity.io/orgs/ccxt/projects/856d3088-8b46-4515-9324-6b7cd2470522) [![Gitter](https://badges.gitter.im/ccxt-dev/ccxt.svg)](https://gitter.im/ccxt-dev/ccxt?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge) [![Supported Exchanges](https://img.shields.io/badge/exchanges-126-blue.svg)](https://github.com/ccxt/ccxt/wiki/Exchange-Markets) [![Open Collective](https://opencollective.com/ccxt/backers/badge.svg)](https://opencollective.com/ccxt)

A JavaScript / Python / PHP library for cryptocurrency trading and e-commerce with support for many bitcoin/ether/altcoin exchange markets and merchant APIs.

The **CCXT** library is used to connect and trade with cryptocurrency / altcoin exchanges and payment processing services worldwide. It provides quick access to market data for storage, analysis, visualization, indicator development, algorithmic trading, strategy backtesting, bot programming, webshop integration and related software engineering.

It is intended to be used by **coders, developers, technically-skilled traders, data-scientists and financial analysts** for building trading algorithms on top of it.

Current feature list:

- support for many exchange markets, even more upcoming soon
- fully implemented public and private APIs for all exchanges
- all currencies, altcoins and symbols, prices, order books, trades, tickers, etc...
- optional normalized data for cross-exchange or cross-currency analytics and arbitrage
- an out-of-the box unified all-in-one API extremely easy to integrate
- works in Node 7.6+, Python 2 and 3, PHP 5.3+, web browsers

[ccxt on GitHub](https://github.com/ccxt/ccxt) | [Install](#install) | [Usage](#usage) | [Manual](https://github.com/ccxt/ccxt/wiki) | [FAQ](https://github.com/ccxt/ccxt/wiki/FAQ) | [Examples](https://github.com/ccxt/ccxt/tree/master/examples) | [Changelog](https://github.com/ccxt/ccxt/blob/master/CHANGELOG.md) | [Contributing](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md)

## Supported Cryptocurrency Exchange Markets

The ccxt library currently supports the following 126 cryptocurrency exchange markets and trading APIs:

|                                                                                                                           | id                 | name                                                                         | ver | doc                                                                                              | countries                               |
|---------------------------------------------------------------------------------------------------------------------------|--------------------|------------------------------------------------------------------------------|:---:|:------------------------------------------------------------------------------------------------:|-----------------------------------------|
|![_1broker](https://user-images.githubusercontent.com/1294454/27766021-420bd9fc-5ecb-11e7-8ed6-56d0081efed2.jpg)           | _1broker           | [1Broker](https://1broker.com)                                               | 2   | [API](https://1broker.com/?c=en/content/api-documentation)                                       | US                                      |
|![_1btcxe](https://user-images.githubusercontent.com/1294454/27766049-2b294408-5ecc-11e7-85cc-adaff013dc1a.jpg)            | _1btcxe            | [1BTCXE](https://1btcxe.com)                                                 | *   | [API](https://1btcxe.com/api-docs.php)                                                           | Panama                                  |
|![acx](https://user-images.githubusercontent.com/1294454/30247614-1fe61c74-9621-11e7-9e8c-f1a627afa279.jpg)                | acx                | [ACX](https://acx.io)                                                        | 2   | [API](https://acx.io/documents/api_v2)                                                           | Australia                               |
|![allcoin](https://user-images.githubusercontent.com/1294454/31561809-c316b37c-b061-11e7-8d5a-b547b4d730eb.jpg)            | allcoin            | [Allcoin](https://www.allcoin.com)                                           | 1   | [API](https://www.allcoin.com/About/APIReference)                                                | Canada                                  |
|![anxpro](https://user-images.githubusercontent.com/1294454/27765983-fd8595da-5ec9-11e7-82e3-adb3ab8c2612.jpg)             | anxpro             | [ANXPro](https://anxpro.com)                                                 | 2   | [API](http://docs.anxv2.apiary.io)                                                               | Japan, Singapore, Hong Kong, New Zealand|
|![anybits](https://user-images.githubusercontent.com/1294454/41388454-ae227544-6f94-11e8-82a4-127d51d34903.jpg)            | anybits            | [Anybits](https://anybits.com)                                               | *   | [API](https://anybits.com/help/api)                                                              | Ireland                                 |
|![bibox](https://user-images.githubusercontent.com/1294454/34902611-2be8bf1a-f830-11e7-91a2-11b2f292e750.jpg)              | bibox              | [Bibox](https://www.bibox.com)                                               | 1   | [API](https://github.com/Biboxcom/api_reference/wiki/home_en)                                    | China, US, South Korea                  |
|![bigone](https://user-images.githubusercontent.com/1294454/42803606-27c2b5ec-89af-11e8-8d15-9c8c245e8b2c.jpg)             | bigone             | [BigONE](https://b1.run/users/new?code=D3LLBVFT)                             | 2   | [API](https://open.big.one/docs/api.html)                                                        | UK                                      |
|![binance](https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg)            | binance            | [Binance](https://www.binance.com/?ref=10205187)                             | *   | [API](https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md)     | Japan                                   |
|![bit2c](https://user-images.githubusercontent.com/1294454/27766119-3593220e-5ece-11e7-8b3a-5a041f6bcc3f.jpg)              | bit2c              | [Bit2C](https://www.bit2c.co.il)                                             | *   | [API](https://www.bit2c.co.il/home/api)                                                          | Israel                                  |
|![bitbank](https://user-images.githubusercontent.com/1294454/37808081-b87f2d9c-2e59-11e8-894d-c1900b7584fe.jpg)            | bitbank            | [bitbank](https://bitbank.cc/)                                               | 1   | [API](https://docs.bitbank.cc/)                                                                  | Japan                                   |
|![bitbay](https://user-images.githubusercontent.com/1294454/27766132-978a7bd8-5ece-11e7-9540-bc96d1e9bbb8.jpg)             | bitbay             | [BitBay](https://bitbay.net)                                                 | *   | [API](https://bitbay.net/public-api)                                                             | Malta, EU                               |
|![bitfinex](https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg)           | bitfinex           | [Bitfinex](https://www.bitfinex.com)                                         | 1   | [API](https://bitfinex.readme.io/v1/docs)                                                        | British Virgin Islands                  |
|![bitfinex2](https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg)          | bitfinex2          | [Bitfinex v2](https://www.bitfinex.com)                                      | 2   | [API](https://bitfinex.readme.io/v2/docs)                                                        | British Virgin Islands                  |
|![bitflyer](https://user-images.githubusercontent.com/1294454/28051642-56154182-660e-11e7-9b0d-6042d1e6edd8.jpg)           | bitflyer           | [bitFlyer](https://bitflyer.jp)                                              | 1   | [API](https://bitflyer.jp/API)                                                                   | Japan                                   |
|![bithumb](https://user-images.githubusercontent.com/1294454/30597177-ea800172-9d5e-11e7-804c-b9d4fa9b56b0.jpg)            | bithumb            | [Bithumb](https://www.bithumb.com)                                           | *   | [API](https://www.bithumb.com/u1/US127)                                                          | South Korea                             |
|![bitkk](https://user-images.githubusercontent.com/1294454/32859187-cd5214f0-ca5e-11e7-967d-96568e2e2bd1.jpg)              | bitkk              | [bitkk](https://vip.zb.com/user/register?recommendCode=bn070u)               | 1   | [API](https://www.bitkk.com/i/developer)                                                         | China                                   |
|![bitlish](https://user-images.githubusercontent.com/1294454/27766275-dcfc6c30-5ed3-11e7-839d-00a846385d0b.jpg)            | bitlish            | [Bitlish](https://bitlish.com)                                               | 1   | [API](https://bitlish.com/api)                                                                   | UK, EU, Russia                          |
|![bitmarket](https://user-images.githubusercontent.com/1294454/27767256-a8555200-5ef9-11e7-96fd-469a65e2b0bd.jpg)          | bitmarket          | [BitMarket](https://www.bitmarket.pl)                                        | *   | [API](https://www.bitmarket.net/docs.php?file=api_public.html)                                   | Poland, EU                              |
|![bitmex](https://user-images.githubusercontent.com/1294454/27766319-f653c6e6-5ed4-11e7-933d-f0bc3699ae8f.jpg)             | bitmex             | [BitMEX](https://www.bitmex.com/register/rm3C16)                             | 1   | [API](https://www.bitmex.com/app/apiOverview)                                                    | Seychelles                              |
|![bitsane](https://user-images.githubusercontent.com/1294454/41387105-d86bf4c6-6f8d-11e8-95ea-2fa943872955.jpg)            | bitsane            | [Bitsane](https://bitsane.com)                                               | *   | [API](https://bitsane.com/info-api)                                                              | Ireland                                 |
|![bitso](https://user-images.githubusercontent.com/1294454/27766335-715ce7aa-5ed5-11e7-88a8-173a27bb30fe.jpg)              | bitso              | [Bitso](https://bitso.com)                                                   | 3   | [API](https://bitso.com/api_info)                                                                | Mexico                                  |
|![bitstamp](https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg)           | bitstamp           | [Bitstamp](https://www.bitstamp.net)                                         | 2   | [API](https://www.bitstamp.net/api)                                                              | UK                                      |
|![bitstamp1](https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg)          | bitstamp1          | [Bitstamp v1](https://www.bitstamp.net)                                      | 1   | [API](https://www.bitstamp.net/api)                                                              | UK                                      |
|![bittrex](https://user-images.githubusercontent.com/1294454/27766352-cf0b3c26-5ed5-11e7-82b7-f3826b7a97d8.jpg)            | bittrex            | [Bittrex](https://bittrex.com)                                               | 1.1 | [API](https://bittrex.com/Home/Api)                                                              | US                                      |
|![bitz](https://user-images.githubusercontent.com/1294454/35862606-4f554f14-0b5d-11e8-957d-35058c504b6f.jpg)               | bitz               | [Bit-Z](https://www.bit-z.com)                                               | 1   | [API](https://www.bit-z.com/api.html)                                                            | Hong Kong                               |
|![bl3p](https://user-images.githubusercontent.com/1294454/28501752-60c21b82-6feb-11e7-818b-055ee6d0e754.jpg)               | bl3p               | [BL3P](https://bl3p.eu)                                                      | 1   | [API](https://github.com/BitonicNL/bl3p-api/tree/master/docs)                                    | Netherlands, EU                         |
|![bleutrade](https://user-images.githubusercontent.com/1294454/30303000-b602dbe6-976d-11e7-956d-36c5049c01e7.jpg)          | bleutrade          | [Bleutrade](https://bleutrade.com)                                           | 2   | [API](https://bleutrade.com/help/API)                                                            | Brazil                                  |
|![braziliex](https://user-images.githubusercontent.com/1294454/34703593-c4498674-f504-11e7-8d14-ff8e44fb78c1.jpg)          | braziliex          | [Braziliex](https://braziliex.com/)                                          | *   | [API](https://braziliex.com/exchange/api.php)                                                    | Brazil                                  |
|![btcalpha](https://user-images.githubusercontent.com/1294454/42625213-dabaa5da-85cf-11e8-8f99-aa8f8f7699f0.jpg)           | btcalpha           | [BTC-Alpha](https://btc-alpha.com/?r=123788)                                 | 1   | [API](https://btc-alpha.github.io/api-docs)                                                      | US                                      |
|![btcbox](https://user-images.githubusercontent.com/1294454/31275803-4df755a8-aaa1-11e7-9abb-11ec2fad9f2d.jpg)             | btcbox             | [BtcBox](https://www.btcbox.co.jp/)                                          | 1   | [API](https://www.btcbox.co.jp/help/asm)                                                         | Japan                                   |
|![btcchina](https://user-images.githubusercontent.com/1294454/27766368-465b3286-5ed6-11e7-9a11-0f6467e1d82b.jpg)           | btcchina           | [BTCChina](https://www.btcchina.com)                                         | 1   | [API](https://www.btcchina.com/apidocs)                                                          | China                                   |
|![btcexchange](https://user-images.githubusercontent.com/1294454/27993052-4c92911a-64aa-11e7-96d8-ec6ac3435757.jpg)        | btcexchange        | [BTCExchange](https://www.btcexchange.ph)                                    | *   | [API](https://github.com/BTCTrader/broker-api-docs)                                              | Philippines                             |
|![btcmarkets](https://user-images.githubusercontent.com/1294454/29142911-0e1acfc2-7d5c-11e7-98c4-07d9532b29d7.jpg)         | btcmarkets         | [BTC Markets](https://btcmarkets.net/)                                       | *   | [API](https://github.com/BTCMarkets/API)                                                         | Australia                               |
|![btctradeim](https://user-images.githubusercontent.com/1294454/36770531-c2142444-1c5b-11e8-91e2-a4d90dc85fe8.jpg)         | btctradeim         | [BtcTrade.im](https://www.btctrade.im)                                       | *   | [API](https://www.btctrade.im/help.api.html)                                                     | Hong Kong                               |
|![btctradeua](https://user-images.githubusercontent.com/1294454/27941483-79fc7350-62d9-11e7-9f61-ac47f28fcd96.jpg)         | btctradeua         | [BTC Trade UA](https://btc-trade.com.ua)                                     | *   | [API](https://docs.google.com/document/d/1ocYA0yMy_RXd561sfG3qEPZ80kyll36HUxvCRe5GbhE/edit)      | Ukraine                                 |
|![btcturk](https://user-images.githubusercontent.com/1294454/27992709-18e15646-64a3-11e7-9fa2-b0950ec7712f.jpg)            | btcturk            | [BTCTurk](https://www.btcturk.com)                                           | *   | [API](https://github.com/BTCTrader/broker-api-docs)                                              | Turkey                                  |
|![btcx](https://user-images.githubusercontent.com/1294454/27766385-9fdcc98c-5ed6-11e7-8f14-66d5e5cd47e6.jpg)               | btcx               | [BTCX](https://btc-x.is)                                                     | 1   | [API](https://btc-x.is/custom/api-document.html)                                                 | Iceland, US, EU                         |
|![bxinth](https://user-images.githubusercontent.com/1294454/27766412-567b1eb4-5ed7-11e7-94a8-ff6a3884f6c5.jpg)             | bxinth             | [BX.in.th](https://bx.in.th)                                                 | *   | [API](https://bx.in.th/info/api)                                                                 | Thailand                                |
|![ccex](https://user-images.githubusercontent.com/1294454/27766433-16881f90-5ed8-11e7-92f8-3d92cc747a6c.jpg)               | ccex               | [C-CEX](https://c-cex.com)                                                   | *   | [API](https://c-cex.com/?id=api)                                                                 | Germany, EU                             |
|![cex](https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg)                | cex                | [CEX.IO](https://cex.io)                                                     | *   | [API](https://cex.io/cex-api)                                                                    | UK, EU, Cyprus, Russia                  |
|![chbtc](https://user-images.githubusercontent.com/1294454/28555659-f0040dc2-7109-11e7-9d99-688a438bf9f4.jpg)              | chbtc              | [CHBTC](https://vip.zb.com/user/register?recommendCode=bn070u)               | 1   | [API](https://www.chbtc.com/i/developer)                                                         | China                                   |
|![chilebit](https://user-images.githubusercontent.com/1294454/27991414-1298f0d8-647f-11e7-9c40-d56409266336.jpg)           | chilebit           | [ChileBit](https://chilebit.net)                                             | 1   | [API](https://blinktrade.com/docs)                                                               | Chile                                   |
|![cobinhood](https://user-images.githubusercontent.com/1294454/35755576-dee02e5c-0878-11e8-989f-1595d80ba47f.jpg)          | cobinhood          | [COBINHOOD](https://cobinhood.com)                                           | 1   | [API](https://cobinhood.github.io/api-public)                                                    | Taiwan                                  |
|![coinbase](https://user-images.githubusercontent.com/1294454/40811661-b6eceae2-653a-11e8-829e-10bfadb078cf.jpg)           | coinbase           | [coinbase](https://www.coinbase.com/join/58cbe25a355148797479dbd2)           | 2   | [API](https://developers.coinbase.com/api/v2)                                                    | US                                      |
|![coinbasepro](https://user-images.githubusercontent.com/1294454/41764625-63b7ffde-760a-11e8-996d-a6328fa9347a.jpg)        | coinbasepro        | [Coinbase Pro](https://pro.coinbase.com/)                                    | *   | [API](https://docs.gdax.com)                                                                     | US                                      |
|![coincheck](https://user-images.githubusercontent.com/1294454/27766464-3b5c3c74-5ed9-11e7-840e-31b32968e1da.jpg)          | coincheck          | [coincheck](https://coincheck.com)                                           | *   | [API](https://coincheck.com/documents/exchange/api)                                              | Japan, Indonesia                        |
|![coinegg](https://user-images.githubusercontent.com/1294454/36770310-adfa764e-1c5a-11e8-8e09-449daac3d2fb.jpg)            | coinegg            | [CoinEgg](https://www.coinegg.com)                                           | *   | [API](https://www.coinegg.com/explain.api.html)                                                  | China, UK                               |
|![coinex](https://user-images.githubusercontent.com/1294454/38046312-0b450aac-32c8-11e8-99ab-bc6b136b6cc7.jpg)             | coinex             | [CoinEx](https://www.coinex.com/account/signup?refer_code=yw5fz)             | 1   | [API](https://github.com/coinexcom/coinex_exchange_api/wiki)                                     | China                                   |
|![coinexchange](https://user-images.githubusercontent.com/1294454/34842303-29c99fca-f71c-11e7-83c1-09d900cb2334.jpg)       | coinexchange       | [CoinExchange](https://www.coinexchange.io)                                  | *   | [API](https://coinexchangeio.github.io/slate/)                                                   | India, Japan, South Korea, Vietnam, US  |
|![coinfalcon](https://user-images.githubusercontent.com/1294454/41822275-ed982188-77f5-11e8-92bb-496bcd14ca52.jpg)         | coinfalcon         | [CoinFalcon](https://coinfalcon.com/?ref=CFJSVGTUPASB)                       | 1   | [API](https://docs.coinfalcon.com)                                                               | UK                                      |
|![coinfloor](https://user-images.githubusercontent.com/1294454/28246081-623fc164-6a1c-11e7-913f-bac0d5576c90.jpg)          | coinfloor          | [coinfloor](https://www.coinfloor.co.uk)                                     | *   | [API](https://github.com/coinfloor/api)                                                          | UK                                      |
|![coingi](https://user-images.githubusercontent.com/1294454/28619707-5c9232a8-7212-11e7-86d6-98fe5d15cc6e.jpg)             | coingi             | [Coingi](https://coingi.com)                                                 | *   | [API](http://docs.coingi.apiary.io/)                                                             | Panama, Bulgaria, China, US             |
|![coinmarketcap](https://user-images.githubusercontent.com/1294454/28244244-9be6312a-69ed-11e7-99c1-7c1797275265.jpg)      | coinmarketcap      | [CoinMarketCap](https://coinmarketcap.com)                                   | 1   | [API](https://coinmarketcap.com/api)                                                             | US                                      |
|![coinmate](https://user-images.githubusercontent.com/1294454/27811229-c1efb510-606c-11e7-9a36-84ba2ce412d8.jpg)           | coinmate           | [CoinMate](https://coinmate.io)                                              | *   | [API](http://docs.coinmate.apiary.io)                                                            | UK, Czech Republic, EU                  |
|![coinnest](https://user-images.githubusercontent.com/1294454/38065728-7289ff5c-330d-11e8-9cc1-cf0cbcb606bc.jpg)           | coinnest           | [coinnest](https://www.coinnest.co.kr)                                       | *   | [API](https://www.coinnest.co.kr/doc/intro.html)                                                 | South Korea                             |
|![coinone](https://user-images.githubusercontent.com/1294454/38003300-adc12fba-323f-11e8-8525-725f53c4a659.jpg)            | coinone            | [CoinOne](https://coinone.co.kr)                                             | 2   | [API](https://doc.coinone.co.kr)                                                                 | South Korea                             |
|![coinsecure](https://user-images.githubusercontent.com/1294454/27766472-9cbd200a-5ed9-11e7-9551-2267ad7bac08.jpg)         | coinsecure         | [Coinsecure](https://coinsecure.in)                                          | 1   | [API](https://api.coinsecure.in)                                                                 | India                                   |
|![coinspot](https://user-images.githubusercontent.com/1294454/28208429-3cacdf9a-6896-11e7-854e-4c79a772a30f.jpg)           | coinspot           | [CoinSpot](https://www.coinspot.com.au)                                      | *   | [API](https://www.coinspot.com.au/api)                                                           | Australia                               |
|![cointiger](https://user-images.githubusercontent.com/1294454/39797261-d58df196-5363-11e8-9880-2ec78ec5bd25.jpg)          | cointiger          | [CoinTiger](https://www.cointiger.pro/exchange/register.html?refCode=FfvDtt) | 1   | [API](https://github.com/cointiger/api-docs-en/wiki)                                             | China                                   |
|![coolcoin](https://user-images.githubusercontent.com/1294454/36770529-be7b1a04-1c5b-11e8-9600-d11f1996b539.jpg)           | coolcoin           | [CoolCoin](https://www.coolcoin.com)                                         | *   | [API](https://www.coolcoin.com/help.api.html)                                                    | Hong Kong                               |
|![crypton](https://user-images.githubusercontent.com/1294454/41334251-905b5a78-6eed-11e8-91b9-f3aa435078a1.jpg)            | crypton            | [Crypton](https://cryptonbtc.com)                                            | 1   | [API](https://cryptonbtc.docs.apiary.io/)                                                        | EU                                      |
|![cryptopia](https://user-images.githubusercontent.com/1294454/29484394-7b4ea6e2-84c6-11e7-83e5-1fccf4b2dc81.jpg)          | cryptopia          | [Cryptopia](https://www.cryptopia.co.nz/Register?referrer=kroitor)           | *   | [API](https://support.cryptopia.co.nz/csm?id=kb_article&sys_id=a75703dcdbb9130084ed147a3a9619bc) | New Zealand                             |
|![deribit](https://user-images.githubusercontent.com/1294454/41933112-9e2dd65a-798b-11e8-8440-5bab2959fcb8.jpg)            | deribit            | [Deribit](https://www.deribit.com/reg-1189.4038)                             | 1   | [API](https://www.deribit.com/pages/docs/api)                                                    | Netherlands                             |
|![dsx](https://user-images.githubusercontent.com/1294454/27990275-1413158a-645a-11e7-931c-94717f7510e3.jpg)                | dsx                | [DSX](https://dsx.uk)                                                        | 3   | [API](https://api.dsx.uk)                                                                        | UK                                      |
|![ethfinex](https://user-images.githubusercontent.com/1294454/37555526-7018a77c-29f9-11e8-8835-8e415c038a18.jpg)           | ethfinex           | [Ethfinex](https://www.ethfinex.com)                                         | 1   | [API](https://bitfinex.readme.io/v1/docs)                                                        | British Virgin Islands                  |
|![exmo](https://user-images.githubusercontent.com/1294454/27766491-1b0ea956-5eda-11e7-9225-40d67b481b8d.jpg)               | exmo               | [EXMO](https://exmo.me/?ref=131685)                                          | 1   | [API](https://exmo.me/en/api_doc?ref=131685)                                                     | Spain, Russia                           |
|![exx](https://user-images.githubusercontent.com/1294454/37770292-fbf613d0-2de4-11e8-9f79-f2dc451b8ccb.jpg)                | exx                | [EXX](https://www.exx.com/)                                                  | *   | [API](https://www.exx.com/help/restApi)                                                          | China                                   |
|![fcoin](https://user-images.githubusercontent.com/1294454/42244210-c8c42e1e-7f1c-11e8-8710-a5fb63b165c4.jpg)              | fcoin              | [FCoin](https://www.fcoin.com/i/Z5P7V)                                       | 2   | [API](https://developer.fcoin.com)                                                               | China                                   |
|![flowbtc](https://user-images.githubusercontent.com/1294454/28162465-cd815d4c-67cf-11e7-8e57-438bea0523a2.jpg)            | flowbtc            | [flowBTC](https://trader.flowbtc.com)                                        | 1   | [API](https://www.flowbtc.com.br/api.html)                                                       | Brazil                                  |
|![foxbit](https://user-images.githubusercontent.com/1294454/27991413-11b40d42-647f-11e7-91ee-78ced874dd09.jpg)             | foxbit             | [FoxBit](https://foxbit.exchange)                                            | 1   | [API](https://blinktrade.com/docs)                                                               | Brazil                                  |
|![fybse](https://user-images.githubusercontent.com/1294454/27766512-31019772-5edb-11e7-8241-2e675e6797f1.jpg)              | fybse              | [FYB-SE](https://www.fybse.se)                                               | *   | [API](http://docs.fyb.apiary.io)                                                                 | Sweden                                  |
|![fybsg](https://user-images.githubusercontent.com/1294454/27766513-3364d56a-5edb-11e7-9e6b-d5898bb89c81.jpg)              | fybsg              | [FYB-SG](https://www.fybsg.com)                                              | *   | [API](http://docs.fyb.apiary.io)                                                                 | Singapore                               |
|![gatecoin](https://user-images.githubusercontent.com/1294454/28646817-508457f2-726c-11e7-9eeb-3528d2413a58.jpg)           | gatecoin           | [Gatecoin](https://gatecoin.com)                                             | *   | [API](https://gatecoin.com/api)                                                                  | Hong Kong                               |
|![gateio](https://user-images.githubusercontent.com/1294454/31784029-0313c702-b509-11e7-9ccc-bc0da6a0e435.jpg)             | gateio             | [Gate.io](https://gate.io/)                                                  | 2   | [API](https://gate.io/api2)                                                                      | China                                   |
|![gdax](https://user-images.githubusercontent.com/1294454/27766527-b1be41c6-5edb-11e7-95f6-5b496c469e2c.jpg)               | gdax               | [GDAX](https://www.gdax.com)                                                 | *   | [API](https://docs.gdax.com)                                                                     | US                                      |
|![gemini](https://user-images.githubusercontent.com/1294454/27816857-ce7be644-6096-11e7-82d6-3c257263229c.jpg)             | gemini             | [Gemini](https://gemini.com)                                                 | 1   | [API](https://docs.gemini.com/rest-api)                                                          | US                                      |
|![getbtc](https://user-images.githubusercontent.com/1294454/33801902-03c43462-dd7b-11e7-992e-077e4cd015b9.jpg)             | getbtc             | [GetBTC](https://getbtc.org)                                                 | *   | [API](https://getbtc.org/api-docs.php)                                                           | St. Vincent & Grenadines, Russia        |
|![hadax](https://user-images.githubusercontent.com/1294454/38059952-4756c49e-32f1-11e8-90b9-45c1eccba9cd.jpg)              | hadax              | [HADAX](https://www.huobi.br.com/en-us/topic/invited/?invite_code=rwrd3)     | 1   | [API](https://github.com/huobiapi/API_Docs/wiki)                                                 | China                                   |
|![hitbtc](https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg)             | hitbtc             | [HitBTC](https://hitbtc.com/?ref_id=5a5d39a65d466)                           | 1   | [API](https://github.com/hitbtc-com/hitbtc-api/blob/master/APIv1.md)                             | Hong Kong                               |
|![hitbtc2](https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg)            | hitbtc2            | [HitBTC v2](https://hitbtc.com/?ref_id=5a5d39a65d466)                        | 2   | [API](https://api.hitbtc.com)                                                                    | Hong Kong                               |
|![huobi](https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg)              | huobi              | [Huobi](https://www.huobi.com)                                               | 3   | [API](https://github.com/huobiapi/API_Docs_en/wiki)                                              | China                                   |
|![huobicny](https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg)           | huobicny           | [Huobi CNY](https://www.huobi.br.com/en-us/topic/invited/?invite_code=rwrd3) | 1   | [API](https://github.com/huobiapi/API_Docs/wiki/REST_api_reference)                              | China                                   |
|![huobipro](https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg)           | huobipro           | [Huobi Pro](https://www.huobi.br.com/en-us/topic/invited/?invite_code=rwrd3) | 1   | [API](https://github.com/huobiapi/API_Docs/wiki/REST_api_reference)                              | China                                   |
|![ice3x](https://user-images.githubusercontent.com/1294454/38012176-11616c32-3269-11e8-9f05-e65cf885bb15.jpg)              | ice3x              | [ICE3X](https://ice3x.com)                                                   | *   | [API](https://ice3x.co.za/ice-cubed-bitcoin-exchange-api-documentation-1-june-2017)              | South Africa                            |
|![independentreserve](https://user-images.githubusercontent.com/1294454/30521662-cf3f477c-9bcb-11e7-89bc-d1ac85012eda.jpg) | independentreserve | [Independent Reserve](https://www.independentreserve.com)                    | *   | [API](https://www.independentreserve.com/API)                                                    | Australia, New Zealand                  |
|![indodax](https://user-images.githubusercontent.com/1294454/37443283-2fddd0e4-281c-11e8-9741-b4f1419001b5.jpg)            | indodax            | [INDODAX](https://www.indodax.com)                                           | 1.8 | [API](https://indodax.com/downloads/BITCOINCOID-API-DOCUMENTATION.pdf)                           | Indonesia                               |
|![itbit](https://user-images.githubusercontent.com/1294454/27822159-66153620-60ad-11e7-89e7-005f6d7f3de0.jpg)              | itbit              | [itBit](https://www.itbit.com)                                               | 1   | [API](https://api.itbit.com/docs)                                                                | US                                      |
|![jubi](https://user-images.githubusercontent.com/1294454/27766581-9d397d9a-5edd-11e7-8fb9-5d8236c0e692.jpg)               | jubi               | [jubi.com](https://www.jubi.com)                                             | 1   | [API](https://www.jubi.com/help/api.html)                                                        | China                                   |
|![kraken](https://user-images.githubusercontent.com/1294454/27766599-22709304-5ede-11e7-9de1-9f33732e1509.jpg)             | kraken             | [Kraken](https://www.kraken.com)                                             | 0   | [API](https://www.kraken.com/en-us/help/api)                                                     | US                                      |
|![kucoin](https://user-images.githubusercontent.com/1294454/33795655-b3c46e48-dcf6-11e7-8abe-dc4588ba7901.jpg)             | kucoin             | [Kucoin](https://www.kucoin.com/?r=E5wkqe)                                   | 1   | [API](https://kucoinapidocs.docs.apiary.io)                                                      | Hong Kong                               |
|![kuna](https://user-images.githubusercontent.com/1294454/31697638-912824fa-b3c1-11e7-8c36-cf9606eb94ac.jpg)               | kuna               | [Kuna](https://kuna.io)                                                      | 2   | [API](https://kuna.io/documents/api)                                                             | Ukraine                                 |
|![lakebtc](https://user-images.githubusercontent.com/1294454/28074120-72b7c38a-6660-11e7-92d9-d9027502281d.jpg)            | lakebtc            | [LakeBTC](https://www.lakebtc.com)                                           | 2   | [API](https://www.lakebtc.com/s/api_v2)                                                          | US                                      |
|![lbank](https://user-images.githubusercontent.com/1294454/38063602-9605e28a-3302-11e8-81be-64b1e53c4cfb.jpg)              | lbank              | [LBank](https://www.lbank.info)                                              | 1   | [API](https://github.com/LBank-exchange/lbank-official-api-docs)                                 | China                                   |
|![liqui](https://user-images.githubusercontent.com/1294454/27982022-75aea828-63a0-11e7-9511-ca584a8edd74.jpg)              | liqui              | [Liqui](https://liqui.io)                                                    | 3   | [API](https://liqui.io/api)                                                                      | Ukraine                                 |
|![livecoin](https://user-images.githubusercontent.com/1294454/27980768-f22fc424-638a-11e7-89c9-6010a54ff9be.jpg)           | livecoin           | [LiveCoin](https://www.livecoin.net)                                         | *   | [API](https://www.livecoin.net/api?lang=en)                                                      | US, UK, Russia                          |
|![luno](https://user-images.githubusercontent.com/1294454/27766607-8c1a69d8-5ede-11e7-930c-540b5eb9be24.jpg)               | luno               | [luno](https://www.luno.com)                                                 | 1   | [API](https://www.luno.com/en/api)                                                               | UK, Singapore, South Africa             |
|![lykke](https://user-images.githubusercontent.com/1294454/34487620-3139a7b0-efe6-11e7-90f5-e520cef74451.jpg)              | lykke              | [Lykke](https://www.lykke.com)                                               | 1   | [API](https://hft-api.lykke.com/swagger/ui/)                                                     | Switzerland                             |
|![mercado](https://user-images.githubusercontent.com/1294454/27837060-e7c58714-60ea-11e7-9192-f05e86adb83f.jpg)            | mercado            | [Mercado Bitcoin](https://www.mercadobitcoin.com.br)                         | 3   | [API](https://www.mercadobitcoin.com.br/api-doc)                                                 | Brazil                                  |
|![mixcoins](https://user-images.githubusercontent.com/1294454/30237212-ed29303c-9535-11e7-8af8-fcd381cfa20c.jpg)           | mixcoins           | [MixCoins](https://mixcoins.com)                                             | 1   | [API](https://mixcoins.com/help/api/)                                                            | UK, Hong Kong                           |
|![negociecoins](https://user-images.githubusercontent.com/1294454/38008571-25a6246e-3258-11e8-969b-aeb691049245.jpg)       | negociecoins       | [NegocieCoins](https://www.negociecoins.com.br)                              | 3   | [API](https://www.negociecoins.com.br/documentacao-tradeapi)                                     | Brazil                                  |
|![nova](https://user-images.githubusercontent.com/1294454/30518571-78ca0bca-9b8a-11e7-8840-64b83a4a94b2.jpg)               | nova               | [Novaexchange](https://novaexchange.com)                                     | 2   | [API](https://novaexchange.com/remote/faq)                                                       | Tanzania                                |
|![okcoincny](https://user-images.githubusercontent.com/1294454/27766792-8be9157a-5ee5-11e7-926c-6d69b8d3378d.jpg)          | okcoincny          | [OKCoin CNY](https://www.okcoin.cn)                                          | 1   | [API](https://www.okcoin.cn/rest_getStarted.html)                                                | China                                   |
|![okcoinusd](https://user-images.githubusercontent.com/1294454/27766791-89ffb502-5ee5-11e7-8a5b-c5950b68ac65.jpg)          | okcoinusd          | [OKCoin USD](https://www.okcoin.com)                                         | 1   | [API](https://www.okcoin.com/rest_getStarted.html)                                               | China, US                               |
|![okex](https://user-images.githubusercontent.com/1294454/32552768-0d6dd3c6-c4a6-11e7-90f8-c043b64756a7.jpg)               | okex               | [OKEX](https://www.okex.com)                                                 | 1   | [API](https://github.com/okcoin-okex/API-docs-OKEx.com)                                          | China, US                               |
|![paymium](https://user-images.githubusercontent.com/1294454/27790564-a945a9d4-5ff9-11e7-9d2d-b635763f2f24.jpg)            | paymium            | [Paymium](https://www.paymium.com)                                           | 1   | [API](https://github.com/Paymium/api-documentation)                                              | France, EU                              |
|![poloniex](https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg)           | poloniex           | [Poloniex](https://poloniex.com)                                             | *   | [API](https://poloniex.com/support/api/)                                                         | US                                      |
|![qryptos](https://user-images.githubusercontent.com/1294454/30953915-b1611dc0-a436-11e7-8947-c95bd5a42086.jpg)            | qryptos            | [QRYPTOS](https://www.qryptos.com)                                           | 2   | [API](https://developers.quoine.com)                                                             | China, Taiwan                           |
|![quadrigacx](https://user-images.githubusercontent.com/1294454/27766825-98a6d0de-5ee7-11e7-9fa4-38e11a2c6f52.jpg)         | quadrigacx         | [QuadrigaCX](https://www.quadrigacx.com)                                     | 2   | [API](https://www.quadrigacx.com/api_info)                                                       | Canada                                  |
|![quoinex](https://user-images.githubusercontent.com/1294454/35047114-0e24ad4a-fbaa-11e7-96a9-69c1a756083b.jpg)            | quoinex            | [QUOINEX](https://quoinex.com/)                                              | 2   | [API](https://developers.quoine.com)                                                             | Japan, Singapore, Vietnam               |
|![rightbtc](https://user-images.githubusercontent.com/1294454/42633917-7d20757e-85ea-11e8-9f53-fffe9fbb7695.jpg)           | rightbtc           | [RightBTC](https://www.rightbtc.com)                                         | *   | [API](https://www.rightbtc.com/api/trader)                                                       | United Arab Emirates                    |
|![southxchange](https://user-images.githubusercontent.com/1294454/27838912-4f94ec8a-60f6-11e7-9e5d-bbf9bd50a559.jpg)       | southxchange       | [SouthXchange](https://www.southxchange.com)                                 | *   | [API](https://www.southxchange.com/Home/Api)                                                     | Argentina                               |
|![surbitcoin](https://user-images.githubusercontent.com/1294454/27991511-f0a50194-6481-11e7-99b5-8f02932424cc.jpg)         | surbitcoin         | [SurBitcoin](https://surbitcoin.com)                                         | 1   | [API](https://blinktrade.com/docs)                                                               | Venezuela                               |
|![therock](https://user-images.githubusercontent.com/1294454/27766869-75057fa2-5ee9-11e7-9a6f-13e641fa4707.jpg)            | therock            | [TheRockTrading](https://therocktrading.com)                                 | 1   | [API](https://api.therocktrading.com/doc/v1/index.html)                                          | Malta                                   |
|![tidebit](https://user-images.githubusercontent.com/1294454/39034921-e3acf016-4480-11e8-9945-a6086a1082fe.jpg)            | tidebit            | [TideBit](https://www.tidebit.com)                                           | 2   | [API](https://www.tidebit.com/documents/api_v2)                                                  | Hong Kong                               |
|![tidex](https://user-images.githubusercontent.com/1294454/30781780-03149dc4-a12e-11e7-82bb-313b269d24d4.jpg)              | tidex              | [Tidex](https://tidex.com)                                                   | 3   | [API](https://tidex.com/exchange/public-api)                                                     | UK                                      |
|![urdubit](https://user-images.githubusercontent.com/1294454/27991453-156bf3ae-6480-11e7-82eb-7295fe1b5bb4.jpg)            | urdubit            | [UrduBit](https://urdubit.com)                                               | 1   | [API](https://blinktrade.com/docs)                                                               | Pakistan                                |
|![vaultoro](https://user-images.githubusercontent.com/1294454/27766880-f205e870-5ee9-11e7-8fe2-0d5b15880752.jpg)           | vaultoro           | [Vaultoro](https://www.vaultoro.com)                                         | 1   | [API](https://api.vaultoro.com)                                                                  | Switzerland                             |
|![vbtc](https://user-images.githubusercontent.com/1294454/27991481-1f53d1d8-6481-11e7-884e-21d17e7939db.jpg)               | vbtc               | [VBTC](https://vbtc.exchange)                                                | 1   | [API](https://blinktrade.com/docs)                                                               | Vietnam                                 |
|![virwox](https://user-images.githubusercontent.com/1294454/27766894-6da9d360-5eea-11e7-90aa-41f2711b7405.jpg)             | virwox             | [VirWoX](https://www.virwox.com)                                             | *   | [API](https://www.virwox.com/developers.php)                                                     | Austria, EU                             |
|![wex](https://user-images.githubusercontent.com/1294454/30652751-d74ec8f8-9e31-11e7-98c5-71469fcef03e.jpg)                | wex                | [WEX](https://wex.nz)                                                        | 3   | [API](https://wex.nz/api/3/docs)                                                                 | New Zealand                             |
|![xbtce](https://user-images.githubusercontent.com/1294454/28059414-e235970c-662c-11e7-8c3a-08e31f78684b.jpg)              | xbtce              | [xBTCe](https://www.xbtce.com)                                               | 1   | [API](https://www.xbtce.com/tradeapi)                                                            | Russia                                  |
|![yobit](https://user-images.githubusercontent.com/1294454/27766910-cdcbfdae-5eea-11e7-9859-03fea873272d.jpg)              | yobit              | [YoBit](https://www.yobit.net)                                               | 3   | [API](https://www.yobit.net/en/api/)                                                             | Russia                                  |
|![yunbi](https://user-images.githubusercontent.com/1294454/28570548-4d646c40-7147-11e7-9cf6-839b93e6d622.jpg)              | yunbi              | [YUNBI](https://yunbi.com)                                                   | 2   | [API](https://yunbi.com/documents/api/guide)                                                     | China                                   |
|![zaif](https://user-images.githubusercontent.com/1294454/27766927-39ca2ada-5eeb-11e7-972f-1b4199518ca6.jpg)               | zaif               | [Zaif](https://zaif.jp)                                                      | 1   | [API](http://techbureau-api-document.readthedocs.io/ja/latest/index.html)                        | Japan                                   |
|![zb](https://user-images.githubusercontent.com/1294454/32859187-cd5214f0-ca5e-11e7-967d-96568e2e2bd1.jpg)                 | zb                 | [ZB](https://vip.zb.com/user/register?recommendCode=bn070u)                  | 1   | [API](https://www.zb.com/i/developer)                                                            | China                                   |

The list above is updated frequently, new crypto markets, altcoin exchanges, bug fixes, API endpoints are introduced and added on a regular basis. See the [Manual](https://github.com/ccxt/ccxt/wiki) for details. If you don't find a cryptocurrency exchange market in the list above and/or want another exchange to be added, post or send us a link to it by opening an issue here on GitHub or via email.

The library is under [MIT license](https://github.com/ccxt/ccxt/blob/master/LICENSE.txt), that means it's absolutely free for any developer to build commercial and opensource software on top of it, but use it at your own risk with no warranties, as is.

## Install

The easiest way to install the ccxt library is to use builtin package managers:

- [ccxt in **NPM**](http://npmjs.com/package/ccxt) (JavaScript / Node v7.6+)
- [ccxt in **PyPI**](https://pypi.python.org/pypi/ccxt) (Python 2 and 3.5.3+)
- [ccxt in **Packagist/Composer**](https://packagist.org/packages/ccxt/ccxt) (PHP 5.3+)

This library is shipped as an all-in-one module implementation with minimalistic dependencies and requirements:

- [`js/`](https://github.com/ccxt/ccxt/blob/master/js/) in JavaScript
- [`python/`](https://github.com/ccxt/ccxt/blob/master/python/) in Python (generated from JS)
- [`php/`](https://github.com/ccxt/ccxt/blob/master/php/) in PHP (generated from JS)

You can also clone it into your project directory from [ccxt GitHub repository](https://github.com/ccxt/ccxt):

```shell
git clone https://github.com/ccxt/ccxt.git
```

An alternative way of installing this library into your code is to copy a single file manually into your working directory with language extension appropriate for your environment.

### JavaScript (NPM)

JavaScript version of CCXT works both in Node and web browsers. Requires ES6 and `async/await` syntax support (Node 7.6.0+). When compiling with Webpack and Babel, make sure it is [not excluded](https://github.com/ccxt/ccxt/issues/225#issuecomment-331905178) in your `babel-loader` config.

[ccxt in **NPM**](http://npmjs.com/package/ccxt)

```shell
npm install ccxt
```

```JavaScript
var ccxt = require ('ccxt')

console.log (ccxt.exchanges) // print all available exchanges
```

### JavaScript (for use with the `<script>` tag):

[All-in-one browser bundle](https://unpkg.com/ccxt) (dependencies included), served from [unpkg CDN](https://unpkg.com/), which is a fast, global content delivery network for everything on NPM.

```HTML
<script type="text/javascript" src="https://unpkg.com/ccxt"></script>
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

[ccxt in PHP with **Packagist/Composer**](https://packagist.org/packages/ccxt/ccxt) (PHP 5.3+)

It requires common PHP modules:

- cURL
- mbstring (using UTF-8 is highly recommended)
- PCRE
- iconv

```PHP
include "ccxt.php";
var_dump (\ccxt\Exchange::$exchanges); // print a list of all available exchange classes
```

## Documentation

Read the [Manual](https://github.com/ccxt/ccxt/wiki) for more details.

## Usage

### Intro

The ccxt library consists of a public part and a private part. Anyone can use the public part out-of-the-box immediately after installation. Public APIs open access to public information from all exchange markets without registering user accounts and without having API keys.

Public APIs include the following:

- market data
- instruments/trading pairs
- price feeds (exchange rates)
- order books
- trade history
- tickers
- OHLC(V) for charting
- other public endpoints

For trading with private APIs you need to obtain API keys from/to exchange markets. It often means registering with exchanges and creating API keys with your account. Most exchanges require personal info or identification. Some kind of verification may be necessary as well. If you want to trade you need to register yourself, this library will not create accounts or API keys for you. Some exchange APIs expose interface methods for registering an account from within the code itself, but most of exchanges don't. You have to sign up and create API keys with their websites.

Private APIs allow the following:

- manage personal account info
- query account balances
- trade by making market and limit orders
- deposit and withdraw fiat and crypto funds
- query personal orders
- get ledger history
- transfer funds between accounts
- use merchant services

This library implements full public and private REST APIs for all exchanges. WebSocket and FIX implementations in JavaScript, PHP, Python and other languages coming soon.

The ccxt library supports both camelcase notation (preferred in JavaScript) and underscore notation (preferred in Python and PHP), therefore all methods can be called in either notation or coding style in any language.

```
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
    let huobi     = new ccxt.huobi ()
    let okcoinusd = new ccxt.okcoinusd ({
        apiKey: 'YOUR_PUBLIC_API_KEY',
        secret: 'YOUR_SECRET_PRIVATE_KEY',
    })

    console.log (kraken.id,    await kraken.loadMarkets ())
    console.log (bitfinex.id,  await bitfinex.loadMarkets  ())
    console.log (huobi.id,     await huobi.loadMarkets ())

    console.log (kraken.id,    await kraken.fetchOrderBook (kraken.symbols[0]))
    console.log (bitfinex.id,  await bitfinex.fetchTicker ('BTC/USD'))
    console.log (huobi.id,     await huobi.fetchTrades ('ETH/CNY'))

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

hitbtc = ccxt.hitbtc({'verbose': True})
bitmex = ccxt.bitmex()
huobi  = ccxt.huobi()
exmo   = ccxt.exmo({
    'apiKey': 'YOUR_PUBLIC_API_KEY',
    'secret': 'YOUR_SECRET_PRIVATE_KEY',
})
kraken = ccxt.kraken({
    'apiKey': 'YOUR_PUBLIC_API_KEY',
    'secret': 'YOUR_SECRET_PRIVATE_KEY',
})

hitbtc_markets = hitbtc.load_markets()

print(hitbtc.id, hitbtc_markets)
print(bitmex.id, bitmex.load_markets())
print(huobi.id, huobi.load_markets())

print(hitbtc.fetch_order_book(hitbtc.symbols[0]))
print(bitmex.fetch_ticker('BTC/USD'))
print(huobi.fetch_trades('LTC/CNY'))

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

We are investing a significant amount of time into the development of this library. If CCXT made your life easier and you like it and want to help us improve it further or if you want to speed up new features and exchanges, please, support us with a tip. We appreciate all contributions!

### Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website.

[[Become a sponsor](https://opencollective.com/ccxt#sponsor)]

<a href="https://opencollective.com/ccxt/sponsor/0/website" target="_blank"><img src="https://opencollective.com/ccxt/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/sponsor/1/website" target="_blank"><img src="https://opencollective.com/ccxt/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/sponsor/2/website" target="_blank"><img src="https://opencollective.com/ccxt/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/sponsor/3/website" target="_blank"><img src="https://opencollective.com/ccxt/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/sponsor/4/website" target="_blank"><img src="https://opencollective.com/ccxt/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/sponsor/5/website" target="_blank"><img src="https://opencollective.com/ccxt/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/sponsor/6/website" target="_blank"><img src="https://opencollective.com/ccxt/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/sponsor/7/website" target="_blank"><img src="https://opencollective.com/ccxt/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/sponsor/8/website" target="_blank"><img src="https://opencollective.com/ccxt/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/ccxt/sponsor/9/website" target="_blank"><img src="https://opencollective.com/ccxt/sponsor/9/avatar.svg"></a>

### Backers

Thank you to all our backers! [[Become a backer](https://opencollective.com/ccxt#backer)]

<a href="https://opencollective.com/ccxt#backers" target="_blank"><img src="https://opencollective.com/ccxt/backers.svg?width=890"></a>

### Crypto

```
ETH 0xa7c2b18b7c8b86984560cad3b1bc3224b388ded0
BTC 33RmVRfhK2WZVQR1R83h2e9yXoqRNDvJva
BCH 1GN9p233TvNcNQFthCgfiHUnj5JRKEc2Ze
LTC LbT8mkAqQBphc4yxLXEDgYDfEax74et3bP
```

Thank you!

