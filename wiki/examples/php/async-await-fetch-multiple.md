- [Async Await Fetch Multiple](./examples/php/)


 ```php
 <?php
// Instead of yield generators, now users can use modern Async/Await syntax
include dirname(dirname(dirname(__FILE__))) . '/ccxt.php';
date_default_timezone_set('UTC');

use function React\Async\async;
use function React\Async\await;
use function React\Promise\all;

$exchange = new ccxt\async\binance([]);
await($exchange->load_markets());
$symbols = array('BTC/USDT', 'ETH/USDT', 'DOGE/USDT');


echo "########### Combined await ###########\n";
$promises = [];
foreach ($symbols as $symbol) {
    $promises[] = $exchange->fetch_ticker($symbol);
}
$tickers = await(all($promises));

echo "{$tickers[0]['symbol']} {$tickers[0]['close']}  |  {$tickers[1]['symbol']} {$tickers[1]['close']}  |  {$tickers[21]['symbol']} {$tickers[2]['close']}\n";
 
```