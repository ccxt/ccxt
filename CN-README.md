# CCXT - 加密货币交易所接口库

[![Build Status](https://travis-ci.org/ccxt/ccxt.svg?branch=master)](https://travis-ci.org/ccxt/ccxt) [![npm](https://img.shields.io/npm/v/ccxt.svg)](https://npmjs.com/package/ccxt) [![PyPI](https://img.shields.io/pypi/v/ccxt.svg)](https://pypi.python.org/pypi/ccxt) [![NPM Downloads](https://img.shields.io/npm/dm/ccxt.svg)](https://www.npmjs.com/package/ccxt) [![NSP Status](https://nodesecurity.io/orgs/ccxt/projects/856d3088-8b46-4515-9324-6b7cd2470522/badge)](https://nodesecurity.io/orgs/ccxt/projects/856d3088-8b46-4515-9324-6b7cd2470522) [![Gitter](https://badges.gitter.im/ccxt-dev/ccxt.svg)](https://gitter.im/ccxt-dev/ccxt?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge) [![Supported Exchanges](https://img.shields.io/badge/exchanges-115-blue.svg)](https://github.com/ccxt/ccxt/wiki/Exchange-Markets) [![Open Collective](https://opencollective.com/ccxt/backers/badge.svg)](https://opencollective.com/ccxt)

一个用于加密货币电子化交易的 JavaScript / Python / PHP 库，支持诸多比特币/以太币/山寨币交易市场的交易 API 。



**CCXT** 库可用于世界各地的加密货币/山寨币交易所的连接和交易，以及转账支付处理服务。它提供了快速访问市场数据的途径，可用于存储数据，分析，可视化，指标开发，算法交易，策略回测，机器人程序，网上商店集成及其它相关的软件工程。


它可被**程序员，开发工程师，技术熟练的交易员，数据科学家和财务分析师**用于在其基础上构建交易算法。

当前具有的特性：

- 支持许多交易所，并将添加更多
- 为上述交易所实现了全部公共和私有 API
- 所有货币，山寨币和交易对，价格，订单簿，交易，行情等...
- 可选的用于跨交易所或跨币种分析和套利的标准化数据
- 一个非常容易集成的开箱即用的统一 API
- 可在 Node 7.6+，Python 2 和 3，PHP 5.3+ 及 Web 浏览器中使用    

[CCXT on GitHub ](https://github.com/ccxt/ccxt) | [安装](#安装) | [使用方法](#使用方法) | [指南](https://github.com/ccxt/ccxt/wiki) | [范例](https://github.com/ccxt/ccxt/tree/master/examples) | [更新日志](https://github.com/ccxt/ccxt/blob/master/CHANGELOG.md) | [贡献](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md)


## 支持的加密货币交易所 

CCXT 库目前支持以下 115 个加密货币交易所的交易 API：


|                                                                                                                           | id                 | 名称                                                                         | 版本 | 文档                                                                                          | 国家/地区                               |
|---------------------------------------------------------------------------------------------------------------------------|--------------------|------------------------------------------------------------------------------|:---:|:--------------------------------------------------------------------------------------------:|-----------------------------------------|
|![_1broker](https://user-images.githubusercontent.com/1294454/27766021-420bd9fc-5ecb-11e7-8ed6-56d0081efed2.jpg)           | _1broker           | [1Broker](https://1broker.com)                                               | 2   | [API](https://1broker.com/?c=en/content/api-documentation)                                   | 美国                                      |
|![_1btcxe](https://user-images.githubusercontent.com/1294454/27766049-2b294408-5ecc-11e7-85cc-adaff013dc1a.jpg)            | _1btcxe            | [1BTCXE](https://1btcxe.com)                                                 | *   | [API](https://1btcxe.com/api-docs.php)                                                       | 巴拿马                                  |
|![acx](https://user-images.githubusercontent.com/1294454/30247614-1fe61c74-9621-11e7-9e8c-f1a627afa279.jpg)                | acx                | [ACX](https://acx.io)                                                        | 2   | [API](https://acx.io/documents/api_v2)                                                       | 澳大利亚                               |
|![allcoin](https://user-images.githubusercontent.com/1294454/31561809-c316b37c-b061-11e7-8d5a-b547b4d730eb.jpg)            | allcoin            | [Allcoin](https://www.allcoin.com)                                           | 1   | [API](https://www.allcoin.com/About/APIReference)                                            | 加拿大                                  |
|![anxpro](https://user-images.githubusercontent.com/1294454/27765983-fd8595da-5ec9-11e7-82e3-adb3ab8c2612.jpg)             | anxpro             | [ANXPro](https://anxpro.com)                                                 | 2   | [API](http://docs.anxv2.apiary.io)                                                           | 日本, 新加坡, 香港, 新西兰|
|![bibox](https://user-images.githubusercontent.com/1294454/34902611-2be8bf1a-f830-11e7-91a2-11b2f292e750.jpg)              | bibox              | [Bibox](https://www.bibox.com)                                               | 1   | [API](https://github.com/Biboxcom/api_reference/wiki/home_en)                                | 中国, 美国, 韩国                  |
|![binance](https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg)            | binance            | [Binance](https://www.binance.com)                                           | *   | [API](https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md) | 日本                                   |
|![bit2c](https://user-images.githubusercontent.com/1294454/27766119-3593220e-5ece-11e7-8b3a-5a041f6bcc3f.jpg)              | bit2c              | [Bit2C](https://www.bit2c.co.il)                                             | *   | [API](https://www.bit2c.co.il/home/api)                                                      | 以色列                                  |
|![bitbank](https://user-images.githubusercontent.com/1294454/37808081-b87f2d9c-2e59-11e8-894d-c1900b7584fe.jpg)            | bitbank            | [bitbank](https://bitbank.cc/)                                               | 1   | [API](https://docs.bitbank.cc/)                                                              | 日本                                   |
|![bitbay](https://user-images.githubusercontent.com/1294454/27766132-978a7bd8-5ece-11e7-9540-bc96d1e9bbb8.jpg)             | bitbay             | [BitBay](https://bitbay.net)                                                 | *   | [API](https://bitbay.net/public-api)                                                         | 波兰, 欧盟                              |
|![bitfinex](https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg)           | bitfinex           | [Bitfinex](https://www.bitfinex.com)                                         | 1   | [API](https://bitfinex.readme.io/v1/docs)                                                    | 英属维尔京群岛                  |
|![bitfinex2](https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg)          | bitfinex2          | [Bitfinex v2](https://www.bitfinex.com)                                      | 2   | [API](https://bitfinex.readme.io/v2/docs)                                                    | 英属维尔京群岛                  |
|![bitflyer](https://user-images.githubusercontent.com/1294454/28051642-56154182-660e-11e7-9b0d-6042d1e6edd8.jpg)           | bitflyer           | [bitFlyer](https://bitflyer.jp)                                              | 1   | [API](https://bitflyer.jp/API)                                                               | 日本                                   |
|![bithumb](https://user-images.githubusercontent.com/1294454/30597177-ea800172-9d5e-11e7-804c-b9d4fa9b56b0.jpg)            | bithumb            | [Bithumb](https://www.bithumb.com)                                           | *   | [API](https://www.bithumb.com/u1/US127)                                                      | 韩国                             |
|![bitkk](https://user-images.githubusercontent.com/1294454/32859187-cd5214f0-ca5e-11e7-967d-96568e2e2bd1.jpg)              | bitkk              | [bitkk](https://www.bitkk.com)                                               | 1   | [API](https://www.bitkk.com/i/developer)                                                     | 中国                                   |
|![bitlish](https://user-images.githubusercontent.com/1294454/27766275-dcfc6c30-5ed3-11e7-839d-00a846385d0b.jpg)            | bitlish            | [Bitlish](https://bitlish.com)                                               | 1   | [API](https://bitlish.com/api)                                                               | 英国, 欧盟, 俄罗斯                          |
|![bitmarket](https://user-images.githubusercontent.com/1294454/27767256-a8555200-5ef9-11e7-96fd-469a65e2b0bd.jpg)          | bitmarket          | [BitMarket](https://www.bitmarket.pl)                                        | *   | [API](https://www.bitmarket.net/docs.php?file=api_public.html)                               | 波兰, 欧盟                              |
|![bitmex](https://user-images.githubusercontent.com/1294454/27766319-f653c6e6-5ed4-11e7-933d-f0bc3699ae8f.jpg)             | bitmex             | [BitMEX](https://www.bitmex.com)                                             | 1   | [API](https://www.bitmex.com/app/apiOverview)                                                | 塞舌尔                              |
|![bitso](https://user-images.githubusercontent.com/1294454/27766335-715ce7aa-5ed5-11e7-88a8-173a27bb30fe.jpg)              | bitso              | [Bitso](https://bitso.com)                                                   | 3   | [API](https://bitso.com/api_info)                                                            | 墨西哥                                  |
|![bitstamp](https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg)           | bitstamp           | [Bitstamp](https://www.bitstamp.net)                                         | 2   | [API](https://www.bitstamp.net/api)                                                          | 英国                                      |
|![bitstamp1](https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg)          | bitstamp1          | [Bitstamp v1](https://www.bitstamp.net)                                      | 1   | [API](https://www.bitstamp.net/api)                                                          | 英国                                      |
|![bittrex](https://user-images.githubusercontent.com/1294454/27766352-cf0b3c26-5ed5-11e7-82b7-f3826b7a97d8.jpg)            | bittrex            | [Bittrex](https://bittrex.com)                                               | 1.1 | [API](https://bittrex.com/Home/Api)                                                          | 美国                                      |
|![bitz](https://user-images.githubusercontent.com/1294454/35862606-4f554f14-0b5d-11e8-957d-35058c504b6f.jpg)               | bitz               | [Bit-Z](https://www.bit-z.com)                                               | 1   | [API](https://www.bit-z.com/api.html)                                                        | 香港                               |
|![bl3p](https://user-images.githubusercontent.com/1294454/28501752-60c21b82-6feb-11e7-818b-055ee6d0e754.jpg)               | bl3p               | [BL3P](https://bl3p.eu)                                                      | 1   | [API](https://github.com/BitonicNL/bl3p-api/tree/master/docs)                                | 荷兰, 欧盟                         |
|![bleutrade](https://user-images.githubusercontent.com/1294454/30303000-b602dbe6-976d-11e7-956d-36c5049c01e7.jpg)          | bleutrade          | [Bleutrade](https://bleutrade.com)                                           | 2   | [API](https://bleutrade.com/help/API)                                                        | 巴西                                  |
|![braziliex](https://user-images.githubusercontent.com/1294454/34703593-c4498674-f504-11e7-8d14-ff8e44fb78c1.jpg)          | braziliex          | [Braziliex](https://braziliex.com/)                                          | *   | [API](https://braziliex.com/exchange/api.php)                                                | 巴西                                  |
|![btcbox](https://user-images.githubusercontent.com/1294454/31275803-4df755a8-aaa1-11e7-9abb-11ec2fad9f2d.jpg)             | btcbox             | [BtcBox](https://www.btcbox.co.jp/)                                          | 1   | [API](https://www.btcbox.co.jp/help/asm)                                                     | 日本                                   |
|![btcchina](https://user-images.githubusercontent.com/1294454/27766368-465b3286-5ed6-11e7-9a11-0f6467e1d82b.jpg)           | btcchina           | [BTCChina](https://www.btcchina.com)                                         | 1   | [API](https://www.btcchina.com/apidocs)                                                      | 中国                                   |
|![btcexchange](https://user-images.githubusercontent.com/1294454/27993052-4c92911a-64aa-11e7-96d8-ec6ac3435757.jpg)        | btcexchange        | [BTCExchange](https://www.btcexchange.ph)                                    | *   | [API](https://github.com/BTCTrader/broker-api-docs)                                          | 菲律宾                             |
|![btcmarkets](https://user-images.githubusercontent.com/1294454/29142911-0e1acfc2-7d5c-11e7-98c4-07d9532b29d7.jpg)         | btcmarkets         | [BTC Markets](https://btcmarkets.net/)                                       | *   | [API](https://github.com/BTCMarkets/API)                                                     | 澳大利亚                               |
|![btctradeim](https://user-images.githubusercontent.com/1294454/36770531-c2142444-1c5b-11e8-91e2-a4d90dc85fe8.jpg)         | btctradeim         | [BtcTrade.im](https://www.btctrade.im)                                       | *   | [API](https://www.btctrade.im/help.api.html)                                                 | 香港                               |
|![btctradeua](https://user-images.githubusercontent.com/1294454/27941483-79fc7350-62d9-11e7-9f61-ac47f28fcd96.jpg)         | btctradeua         | [BTC Trade UA](https://btc-trade.com.ua)                                     | *   | [API](https://docs.google.com/document/d/1ocYA0yMy_RXd561sfG3qEPZ80kyll36HUxvCRe5GbhE/edit)  | 乌克兰                                 |
|![btcturk](https://user-images.githubusercontent.com/1294454/27992709-18e15646-64a3-11e7-9fa2-b0950ec7712f.jpg)            | btcturk            | [BTCTurk](https://www.btcturk.com)                                           | *   | [API](https://github.com/BTCTrader/broker-api-docs)                                          | 土耳其                                  |
|![btcx](https://user-images.githubusercontent.com/1294454/27766385-9fdcc98c-5ed6-11e7-8f14-66d5e5cd47e6.jpg)               | btcx               | [BTCX](https://btc-x.is)                                                     | 1   | [API](https://btc-x.is/custom/api-document.html)                                             | 冰岛, 美国, 欧盟                         |
|![bxinth](https://user-images.githubusercontent.com/1294454/27766412-567b1eb4-5ed7-11e7-94a8-ff6a3884f6c5.jpg)             | bxinth             | [BX.in.th](https://bx.in.th)                                                 | *   | [API](https://bx.in.th/info/api)                                                             | 泰国                                |
|![ccex](https://user-images.githubusercontent.com/1294454/27766433-16881f90-5ed8-11e7-92f8-3d92cc747a6c.jpg)               | ccex               | [C-CEX](https://c-cex.com)                                                   | *   | [API](https://c-cex.com/?id=api)                                                             | 德国, 欧盟                             |
|![cex](https://user-images.githubusercontent.com/1294454/27766442-8ddc33b0-5ed8-11e7-8b98-f786aef0f3c9.jpg)                | cex                | [CEX.IO](https://cex.io)                                                     | *   | [API](https://cex.io/cex-api)                                                                | 英国, 欧盟, 塞浦路斯, 俄罗斯                  |
|![chbtc](https://user-images.githubusercontent.com/1294454/28555659-f0040dc2-7109-11e7-9d99-688a438bf9f4.jpg)              | chbtc              | [CHBTC](https://trade.chbtc.com/api)                                         | 1   | [API](https://www.chbtc.com/i/developer)                                                     | 中国                                   |
|![chilebit](https://user-images.githubusercontent.com/1294454/27991414-1298f0d8-647f-11e7-9c40-d56409266336.jpg)           | chilebit           | [ChileBit](https://chilebit.net)                                             | 1   | [API](https://blinktrade.com/docs)                                                           | 智利                                   |
|![cobinhood](https://user-images.githubusercontent.com/1294454/35755576-dee02e5c-0878-11e8-989f-1595d80ba47f.jpg)          | cobinhood          | [COBINHOOD](https://cobinhood.com)                                           | *   | [API](https://cobinhood.github.io/api-public)                                                | 台湾                                  |
|![coincheck](https://user-images.githubusercontent.com/1294454/27766464-3b5c3c74-5ed9-11e7-840e-31b32968e1da.jpg)          | coincheck          | [coincheck](https://coincheck.com)                                           | *   | [API](https://coincheck.com/documents/exchange/api)                                          | 日本, 印度尼西亚                        |
|![coinegg](https://user-images.githubusercontent.com/1294454/36770310-adfa764e-1c5a-11e8-8e09-449daac3d2fb.jpg)            | coinegg            | [CoinEgg](https://www.coinegg.com)                                           | *   | [API](https://www.coinegg.com/explain.api.html)                                              | 中国, 英国                               |
|![coinex](https://user-images.githubusercontent.com/1294454/38046312-0b450aac-32c8-11e8-99ab-bc6b136b6cc7.jpg)             | coinex             | [CoinEx](https://www.coinex.com)                                             | 1   | [API](https://github.com/coinexcom/coinex_exchange_api/wiki)                                 | 中国                                   |
|![coinexchange](https://user-images.githubusercontent.com/1294454/34842303-29c99fca-f71c-11e7-83c1-09d900cb2334.jpg)       | coinexchange       | [CoinExchange](https://www.coinexchange.io)                                  | *   | [API](https://coinexchangeio.github.io/slate/)                                               | 印度, 日本, 韩国, 越南, 美国  |
|![coinfloor](https://user-images.githubusercontent.com/1294454/28246081-623fc164-6a1c-11e7-913f-bac0d5576c90.jpg)          | coinfloor          | [coinfloor](https://www.coinfloor.co.uk)                                     | *   | [API](https://github.com/coinfloor/api)                                                      | 英国                                      |
|![coingi](https://user-images.githubusercontent.com/1294454/28619707-5c9232a8-7212-11e7-86d6-98fe5d15cc6e.jpg)             | coingi             | [Coingi](https://coingi.com)                                                 | *   | [API](http://docs.coingi.apiary.io/)                                                         | 巴拿马, 保加利亚, 中国, 美国             |
|![coinmarketcap](https://user-images.githubusercontent.com/1294454/28244244-9be6312a-69ed-11e7-99c1-7c1797275265.jpg)      | coinmarketcap      | [CoinMarketCap](https://coinmarketcap.com)                                   | 1   | [API](https://coinmarketcap.com/api)                                                         | 美国                                      |
|![coinmate](https://user-images.githubusercontent.com/1294454/27811229-c1efb510-606c-11e7-9a36-84ba2ce412d8.jpg)           | coinmate           | [CoinMate](https://coinmate.io)                                              | *   | [API](http://docs.coinmate.apiary.io)                                                        | 英国, 捷克, 欧盟                  |
|![coinnest](https://user-images.githubusercontent.com/1294454/38065728-7289ff5c-330d-11e8-9cc1-cf0cbcb606bc.jpg)           | coinnest           | [coinnest](https://www.coinnest.co.kr)                                       | *   | [API](https://www.coinnest.co.kr/doc/intro.html)                                             | 韩国                             |
|![coinone](https://user-images.githubusercontent.com/1294454/38003300-adc12fba-323f-11e8-8525-725f53c4a659.jpg)            | coinone            | [CoinOne](https://coinone.co.kr)                                             | 2   | [API](https://doc.coinone.co.kr)                                                             | 韩国                             |
|![coinsecure](https://user-images.githubusercontent.com/1294454/27766472-9cbd200a-5ed9-11e7-9551-2267ad7bac08.jpg)         | coinsecure         | [Coinsecure](https://coinsecure.in)                                          | 1   | [API](https://api.coinsecure.in)                                                             | 印度                                   |
|![coinspot](https://user-images.githubusercontent.com/1294454/28208429-3cacdf9a-6896-11e7-854e-4c79a772a30f.jpg)           | coinspot           | [CoinSpot](https://www.coinspot.com.au)                                      | *   | [API](https://www.coinspot.com.au/api)                                                       | 澳大利亚                               |
|![cointiger](https://user-images.githubusercontent.com/1294454/39797261-d58df196-5363-11e8-9880-2ec78ec5bd25.jpg)          | cointiger          | [CoinTiger](https://www.cointiger.com/exchange/register.html?refCode=FfvDtt) | 1   | [API](https://github.com/cointiger/api-docs-en/wiki)                                         | 中国                                   |
|![coolcoin](https://user-images.githubusercontent.com/1294454/36770529-be7b1a04-1c5b-11e8-9600-d11f1996b539.jpg)           | coolcoin           | [CoolCoin](https://www.coolcoin.com)                                         | *   | [API](https://www.coolcoin.com/help.api.html)                                                | 香港                               |
|![cryptopia](https://user-images.githubusercontent.com/1294454/29484394-7b4ea6e2-84c6-11e7-83e5-1fccf4b2dc81.jpg)          | cryptopia          | [Cryptopia](https://www.cryptopia.co.nz/Register?referrer=kroitor)           | *   | [API](https://www.cryptopia.co.nz/Forum/Category/45)                                         | 新西兰                             |
|![dsx](https://user-images.githubusercontent.com/1294454/27990275-1413158a-645a-11e7-931c-94717f7510e3.jpg)                | dsx                | [DSX](https://dsx.uk)                                                        | 3   | [API](https://api.dsx.uk)                                                                    | 英国                                      |
|![ethfinex](https://user-images.githubusercontent.com/1294454/37555526-7018a77c-29f9-11e8-8835-8e415c038a18.jpg)           | ethfinex           | [Ethfinex](https://www.ethfinex.com)                                         | 1   | [API](https://bitfinex.readme.io/v1/docs)                                                    | 英属维尔京群岛                  |
|![exmo](https://user-images.githubusercontent.com/1294454/27766491-1b0ea956-5eda-11e7-9225-40d67b481b8d.jpg)               | exmo               | [EXMO](https://exmo.me/?ref=131685)                                          | 1   | [API](https://exmo.me/en/api_doc?ref=131685)                                                 | 西班牙, 俄罗斯                           |
|![exx](https://user-images.githubusercontent.com/1294454/37770292-fbf613d0-2de4-11e8-9f79-f2dc451b8ccb.jpg)                | exx                | [EXX](https://www.exx.com/)                                                  | *   | [API](https://www.exx.com/help/restApi)                                                      | 中国                                   |
|![flowbtc](https://user-images.githubusercontent.com/1294454/28162465-cd815d4c-67cf-11e7-8e57-438bea0523a2.jpg)            | flowbtc            | [flowBTC](https://trader.flowbtc.com)                                        | 1   | [API](http://www.flowbtc.com.br/api/)                                                        | 巴西                                  |
|![foxbit](https://user-images.githubusercontent.com/1294454/27991413-11b40d42-647f-11e7-91ee-78ced874dd09.jpg)             | foxbit             | [FoxBit](https://foxbit.exchange)                                            | 1   | [API](https://blinktrade.com/docs)                                                           | 巴西                                  |
|![fybse](https://user-images.githubusercontent.com/1294454/27766512-31019772-5edb-11e7-8241-2e675e6797f1.jpg)              | fybse              | [FYB-SE](https://www.fybse.se)                                               | *   | [API](http://docs.fyb.apiary.io)                                                             | 瑞典                                  |
|![fybsg](https://user-images.githubusercontent.com/1294454/27766513-3364d56a-5edb-11e7-9e6b-d5898bb89c81.jpg)              | fybsg              | [FYB-SG](https://www.fybsg.com)                                              | *   | [API](http://docs.fyb.apiary.io)                                                             | 新加坡                               |
|![gatecoin](https://user-images.githubusercontent.com/1294454/28646817-508457f2-726c-11e7-9eeb-3528d2413a58.jpg)           | gatecoin           | [Gatecoin](https://gatecoin.com)                                             | *   | [API](https://gatecoin.com/api)                                                              | 香港                               |
|![gateio](https://user-images.githubusercontent.com/1294454/31784029-0313c702-b509-11e7-9ccc-bc0da6a0e435.jpg)             | gateio             | [Gate.io](https://gate.io/)                                                  | 2   | [API](https://gate.io/api2)                                                                  | 中国                                   |
|![gdax](https://user-images.githubusercontent.com/1294454/27766527-b1be41c6-5edb-11e7-95f6-5b496c469e2c.jpg)               | gdax               | [GDAX](https://www.gdax.com)                                                 | *   | [API](https://docs.gdax.com)                                                                 | 美国                                      |
|![gemini](https://user-images.githubusercontent.com/1294454/27816857-ce7be644-6096-11e7-82d6-3c257263229c.jpg)             | gemini             | [Gemini](https://gemini.com)                                                 | 1   | [API](https://docs.gemini.com/rest-api)                                                      | 美国                                      |
|![getbtc](https://user-images.githubusercontent.com/1294454/33801902-03c43462-dd7b-11e7-992e-077e4cd015b9.jpg)             | getbtc             | [GetBTC](https://getbtc.org)                                                 | *   | [API](https://getbtc.org/api-docs.php)                                                       | 圣文森特和格林纳丁斯, 俄罗斯        |
|![hadax](https://user-images.githubusercontent.com/1294454/38059952-4756c49e-32f1-11e8-90b9-45c1eccba9cd.jpg)              | hadax              | [HADAX](https://www.hadax.com)                                               | 1   | [API](https://github.com/huobiapi/API_Docs/wiki)                                             | 中国                                   |
|![hitbtc](https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg)             | hitbtc             | [HitBTC](https://hitbtc.com)                                                 | 1   | [API](https://github.com/hitbtc-com/hitbtc-api/blob/master/APIv1.md)                         | 香港                               |
|![hitbtc2](https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg)            | hitbtc2            | [HitBTC v2](https://hitbtc.com/?ref_id=5a5d39a65d466)                        | 2   | [API](https://api.hitbtc.com)                                                                | 香港                               |
|![huobi](https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg)              | huobi              | [Huobi](https://www.huobi.com)                                               | 3   | [API](https://github.com/huobiapi/API_Docs_en/wiki)                                          | 中国                                   |
|![huobicny](https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg)           | huobicny           | [Huobi CNY](https://www.huobi.com)                                           | 1   | [API](https://github.com/huobiapi/API_Docs/wiki/REST_api_reference)                          | 中国                                   |
|![huobipro](https://user-images.githubusercontent.com/1294454/27766569-15aa7b9a-5edd-11e7-9e7f-44791f4ee49c.jpg)           | huobipro           | [Huobi Pro](https://www.huobipro.com)                                        | 1   | [API](https://github.com/huobiapi/API_Docs/wiki/REST_api_reference)                          | 中国                                   |
|![ice3x](https://user-images.githubusercontent.com/1294454/38012176-11616c32-3269-11e8-9f05-e65cf885bb15.jpg)              | ice3x              | [ICE3X](https://ice3x.com)                                                   | *   | [API](https://ice3x.co.za/ice-cubed-bitcoin-exchange-api-documentation-1-june-2017)          | 南非                            |
|![independentreserve](https://user-images.githubusercontent.com/1294454/30521662-cf3f477c-9bcb-11e7-89bc-d1ac85012eda.jpg) | independentreserve | [Independent Reserve](https://www.independentreserve.com)                    | *   | [API](https://www.independentreserve.com/API)                                                | 澳大利亚, 新西兰                  |
|![indodax](https://user-images.githubusercontent.com/1294454/37443283-2fddd0e4-281c-11e8-9741-b4f1419001b5.jpg)            | indodax            | [INDODAX](https://www.indodax.com)                                           | 1.7 | [API](https://indodax.com/downloads/BITCOINCOID-API-DOCUMENTATION.pdf)                       | 印度尼西亚                               |
|![itbit](https://user-images.githubusercontent.com/1294454/27822159-66153620-60ad-11e7-89e7-005f6d7f3de0.jpg)              | itbit              | [itBit](https://www.itbit.com)                                               | 1   | [API](https://api.itbit.com/docs)                                                            | 美国                                      |
|![jubi](https://user-images.githubusercontent.com/1294454/27766581-9d397d9a-5edd-11e7-8fb9-5d8236c0e692.jpg)               | jubi               | [jubi.com](https://www.jubi.com)                                             | 1   | [API](https://www.jubi.com/help/api.html)                                                    | 中国                                   |
|![kraken](https://user-images.githubusercontent.com/1294454/27766599-22709304-5ede-11e7-9de1-9f33732e1509.jpg)             | kraken             | [Kraken](https://www.kraken.com)                                             | 0   | [API](https://www.kraken.com/en-us/help/api)                                                 | 美国                                      |
|![kucoin](https://user-images.githubusercontent.com/1294454/33795655-b3c46e48-dcf6-11e7-8abe-dc4588ba7901.jpg)             | kucoin             | [Kucoin](https://www.kucoin.com/?r=E5wkqe)                                   | 1   | [API](https://kucoinapidocs.docs.apiary.io)                                                  | 香港                               |
|![kuna](https://user-images.githubusercontent.com/1294454/31697638-912824fa-b3c1-11e7-8c36-cf9606eb94ac.jpg)               | kuna               | [Kuna](https://kuna.io)                                                      | 2   | [API](https://kuna.io/documents/api)                                                         | 乌克兰                                 |
|![lakebtc](https://user-images.githubusercontent.com/1294454/28074120-72b7c38a-6660-11e7-92d9-d9027502281d.jpg)            | lakebtc            | [LakeBTC](https://www.lakebtc.com)                                           | 2   | [API](https://www.lakebtc.com/s/api_v2)                                                      | 美国                                      |
|![lbank](https://user-images.githubusercontent.com/1294454/38063602-9605e28a-3302-11e8-81be-64b1e53c4cfb.jpg)              | lbank              | [LBank](https://www.lbank.info)                                              | 1   | [API](https://www.lbank.info/api/api-overview)                                               | 中国                                   |
|![liqui](https://user-images.githubusercontent.com/1294454/27982022-75aea828-63a0-11e7-9511-ca584a8edd74.jpg)              | liqui              | [Liqui](https://liqui.io)                                                    | 3   | [API](https://liqui.io/api)                                                                  | 乌克兰                                 |
|![livecoin](https://user-images.githubusercontent.com/1294454/27980768-f22fc424-638a-11e7-89c9-6010a54ff9be.jpg)           | livecoin           | [LiveCoin](https://www.livecoin.net)                                         | *   | [API](https://www.livecoin.net/api?lang=en)                                                  | 美国, 英国, 俄罗斯                          |
|![luno](https://user-images.githubusercontent.com/1294454/27766607-8c1a69d8-5ede-11e7-930c-540b5eb9be24.jpg)               | luno               | [luno](https://www.luno.com)                                                 | 1   | [API](https://www.luno.com/en/api)                                                           | 英国, 新加坡, 南非             |
|![lykke](https://user-images.githubusercontent.com/1294454/34487620-3139a7b0-efe6-11e7-90f5-e520cef74451.jpg)              | lykke              | [Lykke](https://www.lykke.com)                                               | 1   | [API](https://hft-api.lykke.com/swagger/ui/)                                                 | 瑞士                             |
|![mercado](https://user-images.githubusercontent.com/1294454/27837060-e7c58714-60ea-11e7-9192-f05e86adb83f.jpg)            | mercado            | [Mercado Bitcoin](https://www.mercadobitcoin.com.br)                         | 3   | [API](https://www.mercadobitcoin.com.br/api-doc)                                             | 巴西                                  |
|![mixcoins](https://user-images.githubusercontent.com/1294454/30237212-ed29303c-9535-11e7-8af8-fcd381cfa20c.jpg)           | mixcoins           | [MixCoins](https://mixcoins.com)                                             | 1   | [API](https://mixcoins.com/help/api/)                                                        | 英国, 香港                           |
|![negociecoins](https://user-images.githubusercontent.com/1294454/38008571-25a6246e-3258-11e8-969b-aeb691049245.jpg)       | negociecoins       | [NegocieCoins](https://www.negociecoins.com.br)                              | 3   | [API](https://www.negociecoins.com.br/documentacao-tradeapi)                                 | 巴西                                  |
|![nova](https://user-images.githubusercontent.com/1294454/30518571-78ca0bca-9b8a-11e7-8840-64b83a4a94b2.jpg)               | nova               | [Novaexchange](https://novaexchange.com)                                     | 2   | [API](https://novaexchange.com/remote/faq)                                                   | 坦桑尼亚                                |
|![okcoincny](https://user-images.githubusercontent.com/1294454/27766792-8be9157a-5ee5-11e7-926c-6d69b8d3378d.jpg)          | okcoincny          | [OKCoin CNY](https://www.okcoin.cn)                                          | 1   | [API](https://www.okcoin.cn/rest_getStarted.html)                                            | 中国                                   |
|![okcoinusd](https://user-images.githubusercontent.com/1294454/27766791-89ffb502-5ee5-11e7-8a5b-c5950b68ac65.jpg)          | okcoinusd          | [OKCoin USD](https://www.okcoin.com)                                         | 1   | [API](https://www.okcoin.com/rest_getStarted.html)                                           | 中国, 美国                               |
|![okex](https://user-images.githubusercontent.com/1294454/32552768-0d6dd3c6-c4a6-11e7-90f8-c043b64756a7.jpg)               | okex               | [OKEX](https://www.okex.com)                                                 | 1   | [API](https://github.com/okcoin-okex/API-docs-OKEx.com)                                      | 中国, 美国                               |
|![paymium](https://user-images.githubusercontent.com/1294454/27790564-a945a9d4-5ff9-11e7-9d2d-b635763f2f24.jpg)            | paymium            | [Paymium](https://www.paymium.com)                                           | 1   | [API](https://github.com/Paymium/api-documentation)                                          | 法国, 欧盟                              |
|![poloniex](https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg)           | poloniex           | [Poloniex](https://poloniex.com)                                             | *   | [API](https://poloniex.com/support/api/)                                                     | 美国                                      |
|![qryptos](https://user-images.githubusercontent.com/1294454/30953915-b1611dc0-a436-11e7-8947-c95bd5a42086.jpg)            | qryptos            | [QRYPTOS](https://www.qryptos.com)                                           | 2   | [API](https://developers.quoine.com)                                                         | 中国, 台湾                           |
|![quadrigacx](https://user-images.githubusercontent.com/1294454/27766825-98a6d0de-5ee7-11e7-9fa4-38e11a2c6f52.jpg)         | quadrigacx         | [QuadrigaCX](https://www.quadrigacx.com)                                     | 2   | [API](https://www.quadrigacx.com/api_info)                                                   | 加拿大                                  |
|![quoinex](https://user-images.githubusercontent.com/1294454/35047114-0e24ad4a-fbaa-11e7-96a9-69c1a756083b.jpg)            | quoinex            | [QUOINEX](https://quoinex.com/)                                              | 2   | [API](https://developers.quoine.com)                                                         | 日本, 新加坡, 越南               |
|![southxchange](https://user-images.githubusercontent.com/1294454/27838912-4f94ec8a-60f6-11e7-9e5d-bbf9bd50a559.jpg)       | southxchange       | [SouthXchange](https://www.southxchange.com)                                 | *   | [API](https://www.southxchange.com/Home/Api)                                                 | 阿根廷                               |
|![surbitcoin](https://user-images.githubusercontent.com/1294454/27991511-f0a50194-6481-11e7-99b5-8f02932424cc.jpg)         | surbitcoin         | [SurBitcoin](https://surbitcoin.com)                                         | 1   | [API](https://blinktrade.com/docs)                                                           | 委内瑞拉                               |
|![therock](https://user-images.githubusercontent.com/1294454/27766869-75057fa2-5ee9-11e7-9a6f-13e641fa4707.jpg)            | therock            | [TheRockTrading](https://therocktrading.com)                                 | 1   | [API](https://api.therocktrading.com/doc/v1/index.html)                                      | 马耳他                                   |
|![tidebit](https://user-images.githubusercontent.com/1294454/39034921-e3acf016-4480-11e8-9945-a6086a1082fe.jpg)            | tidebit            | [TideBit](https://www.tidebit.com)                                           | 2   | [API](https://www.tidebit.com/documents/api_v2)                                              | 香港                               |
|![tidex](https://user-images.githubusercontent.com/1294454/30781780-03149dc4-a12e-11e7-82bb-313b269d24d4.jpg)              | tidex              | [Tidex](https://tidex.com)                                                   | 3   | [API](https://tidex.com/exchange/public-api)                                                 | 英国                                      |
|![urdubit](https://user-images.githubusercontent.com/1294454/27991453-156bf3ae-6480-11e7-82eb-7295fe1b5bb4.jpg)            | urdubit            | [UrduBit](https://urdubit.com)                                               | 1   | [API](https://blinktrade.com/docs)                                                           | 巴基斯坦                                |
|![vaultoro](https://user-images.githubusercontent.com/1294454/27766880-f205e870-5ee9-11e7-8fe2-0d5b15880752.jpg)           | vaultoro           | [Vaultoro](https://www.vaultoro.com)                                         | 1   | [API](https://api.vaultoro.com)                                                              | 瑞士                             |
|![vbtc](https://user-images.githubusercontent.com/1294454/27991481-1f53d1d8-6481-11e7-884e-21d17e7939db.jpg)               | vbtc               | [VBTC](https://vbtc.exchange)                                                | 1   | [API](https://blinktrade.com/docs)                                                           | 越南                                 |
|![virwox](https://user-images.githubusercontent.com/1294454/27766894-6da9d360-5eea-11e7-90aa-41f2711b7405.jpg)             | virwox             | [VirWoX](https://www.virwox.com)                                             | *   | [API](https://www.virwox.com/developers.php)                                                 | 澳大利亚, 欧盟                             |
|![wex](https://user-images.githubusercontent.com/1294454/30652751-d74ec8f8-9e31-11e7-98c5-71469fcef03e.jpg)                | wex                | [WEX](https://wex.nz)                                                        | 3   | [API](https://wex.nz/api/3/docs)                                                             | 新西兰                             |
|![xbtce](https://user-images.githubusercontent.com/1294454/28059414-e235970c-662c-11e7-8c3a-08e31f78684b.jpg)              | xbtce              | [xBTCe](https://www.xbtce.com)                                               | 1   | [API](https://www.xbtce.com/tradeapi)                                                        | 俄罗斯                                  |
|![yobit](https://user-images.githubusercontent.com/1294454/27766910-cdcbfdae-5eea-11e7-9859-03fea873272d.jpg)              | yobit              | [YoBit](https://www.yobit.net)                                               | 3   | [API](https://www.yobit.net/en/api/)                                                         | 俄罗斯                                  |
|![yunbi](https://user-images.githubusercontent.com/1294454/28570548-4d646c40-7147-11e7-9cf6-839b93e6d622.jpg)              | yunbi              | [YUNBI](https://yunbi.com)                                                   | 2   | [API](https://yunbi.com/documents/api/guide)                                                 | 中国                                   |
|![zaif](https://user-images.githubusercontent.com/1294454/27766927-39ca2ada-5eeb-11e7-972f-1b4199518ca6.jpg)               | zaif               | [Zaif](https://zaif.jp)                                                      | 1   | [API](http://techbureau-api-document.readthedocs.io/ja/latest/index.html)                    | 日本                                   |
|![zb](https://user-images.githubusercontent.com/1294454/32859187-cd5214f0-ca5e-11e7-967d-96568e2e2bd1.jpg)                 | zb                 | [ZB](https://www.zb.com)                                                     | 1   | [API](https://www.zb.com/i/developer)                                                        | 中国                                   |

上面的列表经常更新，新的加密货币市场，山寨币交易所，bug修复，API接口将定期被引入、添加。详细信息请参见[ 手册 ](https://github.com/ccxt/ccxt/wiki)。如果您没有在上面的列表中找到加密货币交易所并且/或者想要添加另一个交易所，请通过在GitHub上创建issue或或通过电子邮件向我们发送链接。

本仓库使用[ MIT 许可](https://github.com/ccxt/ccxt/blob/master/LICENSE.txt)，这意味着任何开发人员都可以免费在其上构建商业和开源软件，但如果使用该软件，则风险自担，不作任何担保。

## 安装

安装 CCXT 库的最简单方法是使用内置包管理器：

- [ccxt in **NPM**](http://npmjs.com/package/ccxt) (JavaScript / Node v7.6+)
- [ccxt in **PyPI**](https://pypi.python.org/pypi/ccxt) (Python 2 and 3.5.3+)
- [ccxt in **Packagist/Composer**](https://packagist.org/packages/ccxt/ccxt) (PHP 5.3+)

本仓库提供一个整合的模块实现，具有最小依赖和要求：

- [`js/`](https://github.com/ccxt/ccxt/blob/master/js/) in JavaScript
- [`python/`](https://github.com/ccxt/ccxt/blob/master/python/) in Python (由 JS 生成)
- [`php/`](https://github.com/ccxt/ccxt/blob/master/php/) in PHP (由 JS 生成)

您也可以从[ CCXT GitHub 仓库](https://github.com/ccxt/ccxt)中将它克隆到您的项目目录中

```shell
git clone https://github.com/ccxt/ccxt.git
```

将该库集成到代码中的另一种方法，是将单个文件手动复制到您的工作目录中，并使用适合您环境的语言扩展。

### JavaScript (NPM)

CCXT的JavaScript版本在Node和Web浏览器中均可以使用。需要 ES6 和 `async/await` 语法支持( Node 7.6.0+ )。在使用Webpack和Babel进行编译时，请确保它不会在您的 `babel-loader` 配置中[被排除](https://github.com/ccxt/ccxt/issues/225#issuecomment-331905178)。

[ccxt in **NPM**](http://npmjs.com/package/ccxt)

```shell
npm install ccxt
```

```JavaScript
var ccxt = require ('ccxt')

console.log (ccxt.exchanges) // print all available exchanges
```

### JavaScript（与 <script> 标签一起使用）：    
包含所有功能于一身的浏览器软件包（包括依赖项），由 [unpkg CDN](https://unpkg.com/) 提供。[unpkg CDN](https://unpkg.com/) 是一个快速的全球性的内容分发网络，适用于NPM上的所有内容。

```HTML
<script type="text/javascript" src="https://unpkg.com/ccxt"></script>
```

创建一个全局的 `ccxt` 对象： 

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

本仓库支持在Python 3.5.3+中使用asyncio和async / await进行异步并发模式

```Python
import ccxt.async as ccxt # link against the asynchronous version of ccxt
```

### PHP

PHP版的 CCXT 库：[ccxt.php](https://raw.githubusercontent.com/ccxt/ccxt/master/ccxt.php)    

它需要以下PHP模块：

- cURL
- mbstring (强烈推荐使用 UTF-8 )
- PCRE
- iconv

```PHP
include "ccxt.php";
var_dump (\ccxt\Exchange::$exchanges); // 打印所有支持的交易所
```

## 文档

阅读[操作手册](https://github.com/ccxt/ccxt/wiki)以获得更多详细信息。

## 使用方法

#### 介绍


CCXT 库由公共接口部分和私有接口部分组成。任何人都可以在安装后立即使用公共部分。公共 API 具有获取所有交易所公开信息的权限，无需注册用户账户，也无需 API 密钥。  
公共 API 包括以下内容：  

- 市场数据
- 交易对
- 交易手续费
- 订单簿 / 深度数据
- 交易历史
- 行情 / Tickers 
- 用以制图的 OHLC(V) / K线
- 其他公共接口


对于通过私有 API 进行交易，您需要从交易所获取 API 密钥。它通常意味着在交易所注册，并使用您的账户创建 API 密钥。大多数交易所需要个人信息或身份证明。其他验证材料也可能是必要的。如果你想要交易，你需要自己注册，这个库不会为你创建账户或 API 密钥。一些交易所 API 提供了用代码本身注册帐户的接口，但大多数交易所并没有。因此您必须注册并在网站上创建 API 密钥。

私有API允许以下内容：

- 管理个人帐户信息
- 查询账户余额
- 通过市价单和限价单进行交易
- 存入和提取法币和加密货币
- 查询个人订单
- 获取交易明细/历史
- 在账户之间转移资金
- 使用商业服务

本仓库实现了所有交易所的公共和私有REST API。JavaScript，PHP，Python及其他语言的WebSocket实现和FIX将尽快推出。

CCXT 库同时支持驼峰命名法(常用于 JavaScript)和下划线命名法(常用于 Python 和 PHP)，因此在任意一种语言中，两种命名法/编码风格均可调用所有方法。

```
// 以下两种格式在JavaScript/Python/PHP下均有效    
exchange.methodName ()  //  驼峰命名法  
exchange.method_name () //  下划线命名法
```

阅读 [指南](https://github.com/ccxt/ccxt/wiki)以获得更多详细信息。

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

    // 以市价卖出 1BTC，并立马得到1比特币等值的欧元
    console.log (okcoinusd.id, await okcoinusd.createMarketSellOrder ('BTC/USD', 1))

    // 以 $2500 购买 1 BTC, 当该订单成交时，你会付出 $2500 美金并获得 1BTC 
    console.log (okcoinusd.id, await okcoinusd.createLimitBuyOrder ('BTC/USD', 1, 2500.00))

    // 传递/重定义特定交易所的订单自定义参数：类型，数量，价格 等等
    // 使用一个交易所专有的订单类型
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

hitbtc_markets = hitbtc.load_markets()

print(hitbtc.id, hitbtc_markets)
print(bitmex.id, bitmex.load_markets())
print(huobi.id, huobi.load_markets())

print(hitbtc.fetch_order_book(hitbtc.symbols[0]))
print(bitmex.fetch_ticker('BTC/USD'))
print(huobi.fetch_trades('LTC/CNY'))

print(exmo.fetch_balance())

# 以市价卖出 1BTC，并立马得到美元现金
print(exmo.id, exmo.create_market_sell_order('BTC/USD', 1))

# 限价买入 BTC/EUR, 当该订单成交时，你会以 €2500 欧元的价格收到 1BTC 
print(exmo.id, exmo.create_limit_buy_order('BTC/EUR', 1, 2500.00))

# 传递/重定义特定交易所的订单自定义参数：类型，数量，价格，flags 等等
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

$poloniex_markets = $poloniex->load_markets ();

var_dump ($poloniex_markets);
var_dump ($bittrex->load_markets ());
var_dump ($quoinex->load_markets ());

var_dump ($poloniex->fetch_order_book ($poloniex->symbols[0]));
var_dump ($bittrex->fetch_trades ('BTC/USD'));
var_dump ($quoinex->fetch_ticker ('ETH/EUR'));
var_dump ($zaif->fetch_ticker ('BTC/JPY'));

var_dump ($zaif->fetch_balance ());

// 以市价卖出 1 BTC/JPY，你将会立即卖出比特币并收到日元
var_dump ($zaif->id, $zaif->create_market_sell_order ('BTC/JPY', 1));

// 买入 BTC/JPY, 当该订单成交时，你会以 ¥285000 日元的价格收到 1BTC 
var_dump ($zaif->id, $zaif->create_limit_buy_order ('BTC/JPY', 1, 285000));

// 为你的订单设置一个用户自定义的 id    
$hitbtc->create_order ('BTC/USD', 'limit', 'buy', 1, 3000, array ('clientOrderId' => '123'));
```

## 贡献力量
    
在您做出一些修改并希望合并进代码之前，请阅读 [贡献](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) 文档。 另外，您可通过阅读 [指南](https://github.com/ccxt/ccxt/wiki) 来获取更多详细信息.


## 支持开发团队

我们对此仓库的开发正在投入大量的时间。如果 CCXT 使得您的生活更加简单，并且您喜欢它，并希望帮助我们进一步改进它，或者如果您想加快开发新功能和交易所，请通过小费支持我们。我们感谢所有的支持！

### 赞助商

通过成为赞助商支持本项目，您的 logo 将会展现在这里，并附带您的网站链接。

[[成为赞助商](https://opencollective.com/ccxt#sponsor)]

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

### 支持者

谢谢我们所有的支持者! [[成为支持者](https://opencollective.com/ccxt#backer)]

<a href="https://opencollective.com/ccxt#backers" target="_blank"><img src="https://opencollective.com/ccxt/backers.svg?width=890"></a>

### 加密货币捐助地址

```
ETH 0xa7c2b18b7c8b86984560cad3b1bc3224b388ded0
BTC 33RmVRfhK2WZVQR1R83h2e9yXoqRNDvJva
BCH 1GN9p233TvNcNQFthCgfiHUnj5JRKEc2Ze
LTC LbT8mkAqQBphc4yxLXEDgYDfEax74et3bP
```
    
谢谢！

## 中文社区资源
- [CCXTCN](https://github.com/bilibilihuangyifan/ccxtcn) 是 CCXT 文档中文翻译项目，开始于 2018.05.14，欢迎加入我们一起完成这个项目。
- CCXT 中文文档翻译 QQ 群：749640693
- CCXT 使用问题交流 QQ 群：150134435
- [discourse 社区](http://discourse.blockhedging.com/c/ccxt)


