[![CCXT Pro](https://user-images.githubusercontent.com/1294454/71230147-79917b80-22f9-11ea-9c7e-dcd40123a1d0.png)](https://ccxt.pro)
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

The CCXT Pro library currently supports the following 12 cryptocurrency exchange markets and trading APIs:

|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;logo&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;                                                                                                       | id                 | name                                                                                    | ver | doc                                                                                          | certified                                                                                                                   | pro                                                                         |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------|-----------------------------------------------------------------------------------------|:---:|:--------------------------------------------------------------------------------------------:|-----------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|
|[![binance](https://user-images.githubusercontent.com/1294454/29604020-d5483cdc-87ee-11e7-94c7-d1a8d9169293.jpg)](https://www.binance.com/?ref=10205187)                                       | binance            | [Binance](https://www.binance.com/?ref=10205187)                                        | *   | [API](https://binance-docs.github.io/apidocs/spot/en)                                        | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![binanceje](https://user-images.githubusercontent.com/1294454/54874009-d526eb00-4df3-11e9-928c-ce6a2b914cd1.jpg)](https://www.binance.je/?ref=35047921)                                      | binanceje          | [Binance Jersey](https://www.binance.je/?ref=35047921)                                  | *   | [API](https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md) |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![binanceus](https://user-images.githubusercontent.com/1294454/65177307-217b7c80-da5f-11e9-876e-0b748ba0a358.jpg)](https://www.binance.us/?ref=35005074)                                      | binanceus          | [Binance US](https://www.binance.us/?ref=35005074)                                      | *   | [API](https://github.com/binance-us/binance-official-api-docs)                               |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![bitfinex](https://user-images.githubusercontent.com/1294454/27766244-e328a50c-5ed2-11e7-947b-041416579bb3.jpg)](https://www.bitfinex.com/?refcode=P61eYxFL)                                 | bitfinex           | [Bitfinex](https://www.bitfinex.com/?refcode=P61eYxFL)                                  | 1   | [API](https://docs.bitfinex.com/v1/docs)                                                     | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![bitmex](https://user-images.githubusercontent.com/1294454/27766319-f653c6e6-5ed4-11e7-933d-f0bc3699ae8f.jpg)](https://www.bitmex.com/register/rm3C16)                                       | bitmex             | [BitMEX](https://www.bitmex.com/register/rm3C16)                                        | 1   | [API](https://www.bitmex.com/app/apiOverview)                                                |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![bittrex](https://user-images.githubusercontent.com/1294454/27766352-cf0b3c26-5ed5-11e7-82b7-f3826b7a97d8.jpg)](https://bittrex.com)                                                         | bittrex            | [Bittrex](https://bittrex.com)                                                          | 1.1 | [API](https://bittrex.github.io/api/)                                                        | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![coinbaseprime](https://user-images.githubusercontent.com/1294454/44539184-29f26e00-a70c-11e8-868f-e907fc236a7c.jpg)](https://prime.coinbase.com)                                            | coinbaseprime      | [Coinbase Prime](https://prime.coinbase.com)                                            | *   | [API](https://docs.prime.coinbase.com)                                                       |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![coinbasepro](https://user-images.githubusercontent.com/1294454/41764625-63b7ffde-760a-11e8-996d-a6328fa9347a.jpg)](https://pro.coinbase.com/)                                               | coinbasepro        | [Coinbase Pro](https://pro.coinbase.com/)                                               | *   | [API](https://docs.pro.coinbase.com)                                                         |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![gateio](https://user-images.githubusercontent.com/1294454/31784029-0313c702-b509-11e7-9ccc-bc0da6a0e435.jpg)](https://www.gate.io/signup/2436035)                                           | gateio             | [Gate.io](https://www.gate.io/signup/2436035)                                           | 2   | [API](https://gate.io/api2)                                                                  |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![kraken](https://user-images.githubusercontent.com/1294454/27766599-22709304-5ede-11e7-9de1-9f33732e1509.jpg)](https://www.kraken.com)                                                       | kraken             | [Kraken](https://www.kraken.com)                                                        | 0   | [API](https://www.kraken.com/features/api)                                                   | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![kucoin](https://user-images.githubusercontent.com/1294454/57369448-3cc3aa80-7196-11e9-883e-5ebeb35e4f57.jpg)](https://www.kucoin.com/?rcode=E5wkqe)                                         | kucoin             | [KuCoin](https://www.kucoin.com/?rcode=E5wkqe)                                          | 2   | [API](https://docs.kucoin.com)                                                               |                                                                                                                             | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|
|[![poloniex](https://user-images.githubusercontent.com/1294454/27766817-e9456312-5ee6-11e7-9b3c-b628ca5626a5.jpg)](https://www.poloniex.com/?utm_source=ccxt&utm_medium=web)                   | poloniex           | [Poloniex](https://www.poloniex.com/?utm_source=ccxt&utm_medium=web)                    | *   | [API](https://docs.poloniex.com)                                                             | [![CCXT Certified](https://img.shields.io/badge/CCXT-Certified-green.svg)](https://github.com/ccxt/ccxt/wiki/Certification) | [![CCXT Pro](https://img.shields.io/badge/CCXT-Pro-black)](https://ccxt.pro)|

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

### JavaScript

```shell
# in your project directory

# if you're using Git/HTTPS authentication
npm install git+https://github.com/kroitor/ccxt.pro.git

# if you are connecting to GitHub with SSH
npm install ssh://git@github.com/kroitor/ccxt.pro.git
# or
npm install git@ssh://github.com/kroitor/ccxt.pro.git
# or if you have git and github.com in your ~/.ssh/config
npm install ssh://github.com/kroitor/ccxt.pro.git
```

### Python

```shell
# if you're using Git/HTTPS authentication
pip3 install git+https://github.com/kroitor/ccxt.pro.git#subdirectory=python

# if you are connecting to GitHub with SSH
pip3 install git+ssh://git@github.com/kroitor/ccxt.pro.git#subdirectory=python
```

### PHP

```shell
# in your project directory
composer config repositories.ccxtpro '{"type": "git", "url": "https://github.com/kroitor/ccxt.pro.git"}'
composer require ccxt/ccxtpro
```

## Documentation

Read the [Manual](https://github.com/ccxt/ccxt/wiki/ccxt.pro) for more details.

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

$loop = \React\EventLoop\Factory::create();
$exchange = new \ccxtpro\bitfinex(array('enableRateLimit' => true, 'loop' => $loop));

$main = function () use (&$exchange, &$main) {
  $exchange->watch_order_book('ETH/BTC')->then(function($ob) use (&$main) {
    echo date('c '), json_encode(array($ob['asks'][0], $ob['bids'][0])), "\n";
    $main();
  });
};

$loop->futureTick($main);
$loop->run ();
```

## Support

## [Manual](https://github.com/ccxt/ccxt/wiki/ccxt.pro) · [New issue](https://github.com/ccxt/ccxt/labels/ccxt.pro) · [Slack](https://slack.com/share/IUP8ZDR8C/IJwlcK21ARi8hG10BJmRBx71/enQtOTc1MzA1NDY3Mjg0LWZkOGE1NDNhOTg2ZDdmYzQ0ZGRhZWFlOWExYjVkYmRhZWRjMWM2ZmVlMGQyOGM0NDMyYWNmMGE0MjM3OTI1ZDQ) · [Gitter](https://gitter.im/ccxt-dev/ccxt) · [info@ccxt.pro](mailto:info@ccxt.pro)

© 2020 CCXT Pro
