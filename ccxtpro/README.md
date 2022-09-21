## Documentation

Read the [CCXT Pro Manual](https://github.com/ccxt/ccxt/wiki/ccxt) for more details.

## Usage

### JavaScript

```JavaScript
'use strict';
const ccxt = require ('ccxt');

(async () => {
    const exchange = new ccxt.binance ({ enableRateLimit: true })
    while (true) {
        const orderbook = await exchange.watchOrderBook ('ETH/BTC')
        console.log (new Date (), orderbook['asks'][0], orderbook['bids'][0])
    }
}) ()
```

### Python

```Python
import ccxt
import asyncio

async def main():
    exchange = ccxt.poloniex({'enableRateLimit': True})
    while True:
        orderbook = await exchange.watch_order_book('ETH/BTC')
        print(orderbook['asks'][0], orderbook['bids'][0])

asyncio.get_event_loop().run_until_complete(main())
```

### PHP

```PHP
require_once 'vendor/autoload.php';

$exchange = new \ccxt\async\binance(array('enableRateLimit' => true));

$exchange::execute_and_run(function() use ($exchange) {
    while (true) {
        $orderbook = yield $exchange->watch_order_book('ETH/BTC');
        echo date('c '), json_encode(array($orderbook['asks'][0], $orderbook['bids'][0])), "\n";
    }
});
```

## Support

## [Manual](https://github.com/ccxt/ccxt/wiki/ccxt) · [New issue](https://github.com/ccxt/ccxt/labels/ccxt) · <sub>[![Discord](https://img.shields.io/discord/690203284119617602?logo=discord&logoColor=white)](https://discord.gg/dhzSKYU)</sub> · [info@ccxt](mailto:info@ccxt)

© 2020 CCXT Pro
