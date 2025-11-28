- [Fetch Tickers](./examples/php/)


 ```php
 <?php
// ##########################################
// for asynchronous (async/await) version check: https://github.com/ccxt/ccxt/blob/master/examples/php/async-await.php
// ##########################################

include dirname(dirname(dirname(__FILE__))) . '/ccxt.php';
date_default_timezone_set('UTC');

$exchange =new \ccxt\binance(array(
    // 'verbose' => true, // for debugging
    'timeout' => 30000,
));

$markets = $exchange->load_markets();

try {
    if ($exchange->has['fetchTickers']) {
        // one API call for all tickers (preferred way)
        $result = $exchange->fetch_tickers (); // note, don't call it for specifically binance more than once in every few seconds.
        echo "Called fetchTickers() for all tickers at once. Results count: " . count($result) . "\n";
    } else if ($exchange->has['fetchTicker']) {
        // Individual API calls for all tickers one by one (non-preferred way)
        echo "fetchTickers() is not supported by " . $exchange->id . ", calling individual fetchTicker() for each symbol instead.\n";
        // fetch one by one (not recommended)
        $i = 0;
        $test_symbols_amount = 4;
        foreach ($markets as $symbol => $m) {
            if ($i++ && $i > $test_symbols_amount) {
                echo "Stopping after getting " . $test_symbols_amount . " test symbols.\n";
                break;
            }
            $result = $exchange->fetch_ticker($symbol);
            echo "Fetched ticker for " . $result['symbol'] . ", 24hr high: " . $result['high'] . "\n";
        }
    } else {
        echo "fetchTicker/s() not supported by " . $exchange->id . ", skipping.\n";
    }
} catch (Exception $e) {
    echo '[Error] ' . $e->getMessage() . "\n";
}
 
```