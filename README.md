[![CCXT Pro](https://user-images.githubusercontent.com/1294454/71230147-79917b80-22f9-11ea-9c7e-dcd40123a1d0.png)](https://ccxt.pro)
&nbsp;

CCXT Pro is a professional tool for algorithmic crypto-trading. It is a high-performance superset of the CCXT library, one of the world's leading open-source frameworks for crypto finance. CCXT Pro includes the standard CCXT library and wraps it with powerful new features and useful enhancements.

## [Home](https://ccxt.pro) · [Install](#install) · [Usage](#usage) · [Manual](https://github.com/ccxt/ccxt/wiki/ccxt.pro) · [Examples](https://github.com/kroitor/ccxt.pro/tree/master/examples) · [Support](#support)

## Features:

- Unified public and private WebSockets APIs
- Auto-connection and re-connection
- Connection timeouts
- Re-connection exponential backoff delay
- Keep-alive ping-pong
- Proxies
- Backward-compatible CCXT ←→ CCXT Pro adapters
- FIX protocol transports <sup>*planned*</sup>

## CCXT Pro License

```diff
- It is illegal to publish, distribute or sell the CCXT Pro source code without a separate permission from us.
- Violation of the licensing terms will trigger a ban followed by a legal pursuit.
```

The CCXT Pro is hosted in a private repository on GitHub. The access to the repository is licensed and granted by invitation only on a paid basis. In order to access the repository, the users must obtain prepaid subscription plans at https://ccxt.pro. The users pay for the continued access to the repository, including updates, support and maintenance (new exchanges, improvements, bugfixes and so on).

CCXT Pro does not enforce technical restrictions that would affect the efficiency of direct communications between the users and the exchanges. The protection is not technical but legal. We do not impose unnecessary limitations or intermediary code. If your CCXT Pro license expires, your software or system will not break down and will keep working fine with your most recent version by that time. However, if you discontinue your paid license you will lose the updates that will follow.

Any licensed user, developer, team, or company, having obtained paid access to the CCXT repository from us, can use CCXT Pro as a dependency, subject to the terms and limitations of the CCXT Pro paid subscription plans.

Licensees can use, copy, and modify CCXT Pro as long as they<br />**DO NOT VENDOR, PUBLISH, SELL OR REDISTRIBUTE THE SOURCE CODE OF CCXT PRO**.

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
npm install git@github.com/kroitor/ccxt.pro.git
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
