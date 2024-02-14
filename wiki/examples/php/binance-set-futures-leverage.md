- [Binance Set Futures Leverage](./examples/php/)


 ```php
 <?php

include './ccxt.php';

// https://github.com/ccxt/ccxt/wiki/Manual#instantiation

date_default_timezone_set('UTC');

$exchange_id = 'binance';
$exchange_class = "\\ccxt\\$exchange_id";
$exchange = new $exchange_class(array(
    'apiKey' => 'YOUR_API_KEY',
    'secret' => 'YOUR_SECRET',
    'options' => array(
        'defaultType' => 'future'
    ),
));

$exchange->load_markets(); // https://github.com/ccxt/ccxt/wiki/Manual#loading-markets

// $exchange->verbose = true; // verbose mode on, uncomment for debugging

$symbol = 'BTC/USDT';

$market = $exchange->market($symbol);

// https://github.com/ccxt/ccxt/wiki/Manual#passing-parameters-to-api-methods
$params = array(
    'symbol' => $market['id'], // convert a unified CCXT symbol to an exchange-specific market id
    'leverage' => 10,
);

// https://github.com/ccxt/ccxt/wiki/Manual#implicit-api-methods
$response = $exchange->fapiPrivate_post_leverage($params);

print_r ($response); 
```