- [Cache Exchange Instance Reuse](./examples/php/)


 ```php
 <?php

error_reporting(E_ALL);
date_default_timezone_set('UTC');

include dirname(dirname(dirname(__FILE__))) . '/ccxt.php';

function create_exchange($exchange_id, $config) {

    $exchange_class = '\\ccxt\\' . $exchange_id;
    $exchange = new $exchange_class($config);
    $cache_location = "./cached_{$exchange_id}_data.json";
    $start_time = microtime(true);

    if (file_exists($cache_location)) {
        $loaded_cache = json_decode(file_get_contents($cache_location), true);
        $exchange->set_markets($loaded_cache['markets'], $loaded_cache['currencies']);
        print("{$exchange_id} Loaded markets from cache in " . (microtime(true) - $start_time) . " seconds\n");
    } else {
        $markets = $exchange->load_markets();
        file_put_contents($cache_location, json_encode(['markets'=>$markets, 'currencies'=>$exchange->currencies]));
        print("{$exchange_id} Loaded fresh markets in " . (microtime(true) - $start_time) . " seconds\n");
    }
    return $exchange;
}

$exchange1 = create_exchange('bittrex', ['custom_id'=>'mybittrex1']);
print ($exchange1->fetch_trades('BTC/USDT')[0]);
 
```