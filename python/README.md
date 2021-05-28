[![CCXT Pro – A JavaScript / Python / PHP cryptocurrency exchange trading WebSocket API for professionals](https://user-images.githubusercontent.com/1294454/71230147-79917b80-22f9-11ea-9c7e-dcd40123a1d0.png)](https://ccxt.pro)
&nbsp;

CCXT Pro is a professional tool for algorithmic crypto-trading. It is a high-performance superset of the CCXT library, one of the world's leading open-source frameworks for crypto finance. CCXT Pro includes the standard CCXT library and wraps it with powerful new features and useful enhancements.

## [Home](https://ccxt.pro) · [License](#license) · [Exchanges](#exchanges) · [Install](#install) · [Usage](#usage) · [Manual](https://github.com/ccxt/ccxt/wiki/ccxt.pro) · [Examples](https://github.com/ccxt/ccxt/tree/master/examples) · [Support](#support)

## Features:

- Unified public and private WebSockets APIs
- Auto-connection and re-connection
- Connection timeouts
- Re-connection exponential backoff delay
- Keep-alive ping-pong
- Proxies
- Backward-compatible CCXT ←→ CCXT Pro adapters
- FIX protocol transports <sup>*planned*</sup>

## Exchanges

The CCXT Pro library currently supports the following 31 cryptocurrency exchange markets and WebSocket trading APIs:

| logo                                                                                                                                                                                         | id            | name                                                                                | ver | doc                                                                                | certified                                                                                                                   | pro                                                                          |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|-------------------------------------------------------------------------------------|:---:|:----------------------------------------------------------------------------------:|-----------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| [![aax](https://user-images.githubusercontent.com/1294454/104140087-a27f2580-53c0-11eb-87c1-5d9e81208fe9.jpg)](https://www.aaxpro.com/invite/sign-up?inviteCode=JXGm5Fy7R2MB)                | aax           | [AAX](https://www.aaxpro.com/invite/sign-up?inviteCode=JXGm5Fy7R2MB)                | 2   | [API](https://www.aaxpro.com/apidoc/index.html)                                    | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bequant](https://user-images.githubusercontent.com/1294454/55248342-a75dfe00-525a-11e9-8aa2-05e9dca943c6.jpg)](https://bequant.io)                                                        | bequant       | [Bequant](https://bequant.io)                                                       | 2   | [API](https://api.bequant.io/)                                                     |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![binance](https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg)](https://www.binance.com/?ref=10205187)                                     | binance       | [Binance](https://www.binance.com/?ref=10205187)                                    | *   | [API](https://binance-docs.github.io/apidocs/spot/en)                              | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![binancecoinm](https://user-images.githubusercontent.com/1294454/117738721-668c8d80-b205-11eb-8c49-3fad84c4a07f.jpg)](https://www.binance.com/?ref=10205187)                               | binancecoinm  | [Binance COIN-M](https://www.binance.com/?ref=10205187)                             | *   | [API](https://binance-docs.github.io/apidocs/spot/en)                              | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![binanceus](https://user-images.githubusercontent.com/1294454/65177307-217b7c80-da5f-11e9-876e-0b748ba0a358.jpg)](https://www.binance.us/?ref=35005074)                                    | binanceus     | [Binance US](https://www.binance.us/?ref=35005074)                                  | *   | [API](https://github.com/binance-us/binance-official-api-docs)                     |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![binanceusdm](https://user-images.githubusercontent.com/1294454/117738721-668c8d80-b205-11eb-8c49-3fad84c4a07f.jpg)](https://www.binance.com/?ref=10205187)                                | binanceusdm   | [Binance USDⓈ-M](https://www.binance.com/?ref=10205187)                             | *   | [API](https://binance-docs.github.io/apidocs/spot/en)                              | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitcoincom](https://user-images.githubusercontent.com/1294454/97296144-514fa300-1861-11eb-952b-3d55d492200b.jpg)](https://exchange.bitcoin.com/referral/da948b21d6c92d69)                 | bitcoincom    | [bitcoin.com](https://exchange.bitcoin.com/referral/da948b21d6c92d69)               | 2   | [API](https://api.exchange.bitcoin.com/api/2/explore)                              |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitfinex](https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg)](https://www.bitfinex.com/?refcode=P61eYxFL)                               | bitfinex      | [Bitfinex](https://www.bitfinex.com/?refcode=P61eYxFL)                              | 1   | [API](https://docs.bitfinex.com/v1/docs)                                           |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitmex](https://user-images.githubusercontent.com/1294454/27766319-f653c6e6-5ed4-11e7-933d-f0bc3699ae8f.jpg)](https://www.bitmex.com/register/upZpOX)                                     | bitmex        | [BitMEX](https://www.bitmex.com/register/upZpOX)                                    | 1   | [API](https://www.bitmex.com/app/apiOverview)                                      |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitstamp](https://user-images.githubusercontent.com/1294454/27786377-8c8ab57e-5fe9-11e7-8ea4-2b05b6bcceec.jpg)](https://www.bitstamp.net)                                                 | bitstamp      | [Bitstamp](https://www.bitstamp.net)                                                | 2   | [API](https://www.bitstamp.net/api)                                                |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bittrex](https://user-images.githubusercontent.com/51840849/87153921-edf53180-c2c0-11ea-96b9-f2a9a95a455b.jpg)](https://bittrex.com/Account/Register?referralCode=1ZE-G0G-M3B)            | bittrex       | [Bittrex](https://bittrex.com/Account/Register?referralCode=1ZE-G0G-M3B)            | 3   | [API](https://bittrex.github.io/api/v3)                                            |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![bitvavo](https://user-images.githubusercontent.com/1294454/83165440-2f1cf200-a116-11ea-9046-a255d09fb2ed.jpg)](https://bitvavo.com/?a=24F34952F7)                                         | bitvavo       | [Bitvavo](https://bitvavo.com/?a=24F34952F7)                                        | 2   | [API](https://docs.bitvavo.com/)                                                   | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![coinbaseprime](https://user-images.githubusercontent.com/1294454/44539184-29f26e00-a70c-11e8-868f-e907fc236a7c.jpg)](https://exchange.coinbase.com)                                       | coinbaseprime | [Coinbase Prime](https://exchange.coinbase.com)                                     | *   | [API](https://docs.exchange.coinbase.com)                                          |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![coinbasepro](https://user-images.githubusercontent.com/1294454/41764625-63b7ffde-760a-11e8-996d-a6328fa9347a.jpg)](https://pro.coinbase.com/)                                             | coinbasepro   | [Coinbase Pro](https://pro.coinbase.com/)                                           | *   | [API](https://docs.pro.coinbase.com)                                               |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![currencycom](https://user-images.githubusercontent.com/1294454/83718672-36745c00-a63e-11ea-81a9-677b1f789a4d.jpg)](https://currency.com/trading/signup?c=362jaimv&pid=referral)           | currencycom   | [Currency.com](https://currency.com/trading/signup?c=362jaimv&pid=referral)         | 1   | [API](https://currency.com/api)                                                    | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![ftx](https://user-images.githubusercontent.com/1294454/67149189-df896480-f2b0-11e9-8816-41593e17f9ec.jpg)](https://ftx.com/#a=1623029)                                                    | ftx           | [FTX](https://ftx.com/#a=1623029)                                                   | *   | [API](https://github.com/ftexchange/ftx)                                           | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![gateio](https://user-images.githubusercontent.com/1294454/31784029-0313c702-b509-11e7-9ccc-bc0da6a0e435.jpg)](https://www.gate.io/signup/2436035)                                         | gateio        | [Gate.io](https://www.gate.io/signup/2436035)                                       | 2   | [API](https://gate.io/api2)                                                        |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![gopax](https://user-images.githubusercontent.com/1294454/102897212-ae8a5e00-4478-11eb-9bab-91507c643900.jpg)](https://www.gopax.co.kr)                                                    | gopax         | [GOPAX](https://www.gopax.co.kr)                                                    | 1   | [API](https://gopax.github.io/API/index.en.html)                                   | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![hitbtc](https://user-images.githubusercontent.com/1294454/27766555-8eaec20e-5edc-11e7-9c5b-6dc69fc42f5e.jpg)](https://hitbtc.com/?ref_id=5a5d39a65d466)                                   | hitbtc        | [HitBTC](https://hitbtc.com/?ref_id=5a5d39a65d466)                                  | 2   | [API](https://api.hitbtc.com)                                                      |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![huobijp](https://user-images.githubusercontent.com/1294454/85734211-85755480-b705-11ea-8b35-0b7f1db33a2f.jpg)](https://www.huobi.co.jp/register/?invite_code=znnq3)                       | huobijp       | [Huobi Japan](https://www.huobi.co.jp/register/?invite_code=znnq3)                  | 1   | [API](https://api-doc.huobi.co.jp)                                                 |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![huobipro](https://user-images.githubusercontent.com/1294454/76137448-22748a80-604e-11ea-8069-6e389271911d.jpg)](https://www.huobi.com/en-us/topic/invited/?invite_code=rwrd3)             | huobipro      | [Huobi Pro](https://www.huobi.com/en-us/topic/invited/?invite_code=rwrd3)           | 1   | [API](https://huobiapi.github.io/docs/spot/v1/cn/)                                 |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![idex](https://user-images.githubusercontent.com/51840849/94481303-2f222100-01e0-11eb-97dd-bc14c5943a86.jpg)](https://idex.io)                                                             | idex          | [IDEX](https://idex.io)                                                             | 2   | [API](https://docs.idex.io/)                                                       | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![kraken](https://user-images.githubusercontent.com/51840849/76173629-fc67fb00-61b1-11ea-84fe-f2de582f58a3.jpg)](https://www.kraken.com)                                                    | kraken        | [Kraken](https://www.kraken.com)                                                    | 0   | [API](https://www.kraken.com/features/api)                                         | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![kucoin](https://user-images.githubusercontent.com/51840849/87295558-132aaf80-c50e-11ea-9801-a2fb0c57c799.jpg)](https://www.kucoin.com/?rcode=E5wkqe)                                      | kucoin        | [KuCoin](https://www.kucoin.com/?rcode=E5wkqe)                                      | 2   | [API](https://docs.kucoin.com)                                                     |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![ndax](https://user-images.githubusercontent.com/1294454/108623144-67a3ef00-744e-11eb-8140-75c6b851e945.jpg)](https://one.ndax.io/bfQiSL)                                                  | ndax          | [NDAX](https://one.ndax.io/bfQiSL)                                                  | *   | [API](https://apidoc.ndax.io/)                                                     |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![okcoin](https://user-images.githubusercontent.com/51840849/87295551-102fbf00-c50e-11ea-90a9-462eebba5829.jpg)](https://www.okcoin.com/account/register?flag=activity&channelId=600001513) | okcoin        | [OKCoin](https://www.okcoin.com/account/register?flag=activity&channelId=600001513) | 3   | [API](https://www.okcoin.com/docs/en/)                                             |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![okex](https://user-images.githubusercontent.com/1294454/32552768-0d6dd3c6-c4a6-11e7-90f8-c043b64756a7.jpg)](https://www.okex.com/join/1888677)                                            | okex          | [OKEX](https://www.okex.com/join/1888677)                                           | 3   | [API](https://www.okex.com/docs/en/)                                               |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![phemex](https://user-images.githubusercontent.com/1294454/85225056-221eb600-b3d7-11ea-930d-564d2690e3f6.jpg)](https://phemex.com/register?referralCode=EDNVJ)                             | phemex        | [Phemex](https://phemex.com/register?referralCode=EDNVJ)                            | 1   | [API](https://github.com/phemex/phemex-api-docs)                                   |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![poloniex](https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg)](https://poloniex.com/signup?c=UBFZJRPJ)                                   | poloniex      | [Poloniex](https://poloniex.com/signup?c=UBFZJRPJ)                                  | *   | [API](https://docs.poloniex.com)                                                   |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![ripio](https://user-images.githubusercontent.com/1294454/94507548-a83d6a80-0218-11eb-9998-28b9cec54165.jpg)](https://exchange.ripio.com)                                                  | ripio         | [Ripio](https://exchange.ripio.com)                                                 | 1   | [API](https://exchange.ripio.com/en/api/)                                          |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |
| [![upbit](https://user-images.githubusercontent.com/1294454/49245610-eeaabe00-f423-11e8-9cba-4b0aed794799.jpg)](https://upbit.com)                                                           | upbit         | [Upbit](https://upbit.com)                                                          | 1   | [API](https://docs.upbit.com/docs/%EC%9A%94%EC%B2%AD-%EC%88%98-%EC%A0%9C%ED%95%9C) |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro) |

## License

### See [LICENSE.txt](https://github.com/kroitor/ccxt.pro/tree/master/LICENSE.txt) for details

### Important Notes

```diff
- It is illegal to publish, distribute or sell the CCXT Pro source code without a separate permission from us.
- Violation of the licensing terms will trigger a ban followed by a legal pursuit.
```

The CCXT Pro is hosted in a private repository on GitHub. The access to the repository is licensed and granted by invitation only on a paid basis. In order to access the repository, the users must obtain prepaid subscription plans at https://ccxt.pro. The users pay for the continued access to the repository, including updates, support and maintenance (new exchanges, improvements, bugfixes and so on).

CCXT Pro does not enforce technical restrictions that would affect the efficiency of direct communications between the users and the exchanges. The protection is not technical but legal. We do not impose unnecessary limitations or intermediary code. If your CCXT Pro license expires, your software or system will not break down and will keep working fine with your most recent version by that time. However, if you discontinue your paid license you will lose the updates that will follow.

Any licensed user, developer, team, or company, having obtained paid access to the CCXT Pro repository from us, can use CCXT Pro as a dependency, subject to the terms and limitations of the CCXT Pro paid subscription plans.

Licensees can use, copy, and modify CCXT Pro as long as they<br />**DO NOT VENDOR, PUBLISH, SELL OR DISTRIBUTE THE SOURCE CODE OF CCXT PRO**.

It is allowed to specify CCXT Pro as a dependency of your software as long as you<br />**DO NOT INCLUDE A COPY OF THE CCXT PRO SOURCE CODE IN YOUR SOFTWARE**.

If you are a software developer you should specify CCXT Pro as your requirement. The end-user of your software is responsible for obtaining his own individual CCXT Pro license. The best practice is to make it clear in your docs or on your website. Since CCXT and CCXT Pro are interchangeable, auto-detection can be factored-in to let the end-user choose between the free CCXT and the paid CCXT Pro.

Thank you for using CCXT Pro legally!

## Install

Installing CCXT Pro requires visiting the https://ccxt.pro website and obtaining a CCXT Pro license. The license gives the access to the CCXT Pro codebase in a private GitHub repository.

```diff
- this part of the doc is currenty a work in progress
- there may be some issues and missing implementations here and there
- contributions, pull requests and feedback appreciated
```

See [CCXT Pro Install](https://github.com/ccxt/ccxt/wiki/ccxt.pro.install) for installation instructions.

## Documentation

Read the [CCXT Pro Manual](https://github.com/ccxt/ccxt/wiki/ccxt.pro) for more details.

## Usage

### JavaScript

```JavaScript
'use strict';
const ccxtpro = require ('ccxt.pro');

(async () => {
    const exchange = new ccxtpro.binance ({ enableRateLimit: true })
    while (true) {
        const orderbook = await exchange.watchOrderBook ('ETH/BTC')
        console.log (new Date (), orderbook['asks'][0], orderbook['bids'][0])
    }
}) ()
```

### Python

```Python
import ccxtpro
import asyncio

async def main():
    exchange = ccxtpro.poloniex({'enableRateLimit': True})
    while True:
        orderbook = await exchange.watch_order_book('ETH/BTC')
        print(orderbook['asks'][0], orderbook['bids'][0])

asyncio.get_event_loop().run_until_complete(main())
```

### PHP

```PHP
require_once 'vendor/autoload.php';

$exchange = new \ccxtpro\binance(array('enableRateLimit' => true));

$exchange::execute_and_run(function() use ($exchange) {
    while (true) {
        $orderbook = yield $exchange->watch_order_book('ETH/BTC');
        echo date('c '), json_encode(array($orderbook['asks'][0], $orderbook['bids'][0])), "\n";
    }
});
```

## Support

## [Manual](https://github.com/ccxt/ccxt/wiki/ccxt.pro) · [New issue](https://github.com/ccxt/ccxt/labels/ccxt.pro) · <sub>[![Discord](https://img.shields.io/discord/690203284119617602?logo=discord&logoColor=white)](https://discord.gg/dhzSKYU)</sub> · [info@ccxt.pro](mailto:info@ccxt.pro)

© 2020 CCXT Pro
