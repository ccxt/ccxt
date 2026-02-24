- [Bitfinex2 Fetch Ohlcv Since Limit](./examples/php/)


 ```php
 <?php

include './ccxt.php';

date_default_timezone_set('UTC');

// instantiate the exchange by id
$exchange = '\\ccxt\\bitfinex2';
$exchange = new $exchange();

// load all markets from the exchange
$markets = $exchange->load_markets();

function run($exchange, $symbol, $timeframe, $since, $limit) {
    $ohlcvs = $exchange->fetch_ohlcv($symbol, $timeframe, $since, $limit);
    foreach ($ohlcvs as $v) {
        printf ("%s O:%.8f H:%.8f L:%.8f C:%.8f V:%.8f\n", $exchange->iso8601($v[0]), $v[1], $v[2], $v[3], $v[4], $v[5]);
    }
}

printf("--------------------------------------------------------------\n");
run($exchange, 'ETH/BTC', '1m', 1518842513569, 5);
printf("--------------------------------------------------------------\n");
run($exchange, 'ETH/BTC', '1m', 1518842513569, 10);
printf("--------------------------------------------------------------\n");

?> 
```