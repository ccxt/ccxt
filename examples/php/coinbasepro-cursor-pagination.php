<?php

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set ('UTC');

$exchange = new \ccxt\coinbasepro(array(
    'apiKey' => 'YOUR_API_KEY',  // required for fetch_orders, fetch_my_trades
    'secret' => 'YOUR_SECRET',  // required for fetch_orders, fetch_my_trades
    'password' => 'YOUR_PASSWORD',  // required for fetch_orders, fetch_my_trades
    // 'verbose' => true, // uncomment for debugging
    // https://github.com/ccxt/ccxt/wiki/Manual#rate-limit
    'enableRateLimit' => true, // rate-limiting is required by the Manual
));

$exchange->load_markets ();

// $exchange->verbose = true; // uncomment for debugging

$all_results = array();

$symbol = 'ETH/USD';
$since = null;
$limit = 100;
$params = array();

do {
    // any of the following methods should work:
    // $results = $exchange->fetch_orders($symbol, $since, $limit, $params);
    // $results = $exchange->fetch_my_trades($symbol, $since, $limit, $params);
    $results = $exchange->fetch_trades($symbol, $since, $limit, $params);
    echo $exchange->iso8601($exchange->milliseconds());
    echo ' fetched ' . count($results) . " results\n";
    $all_results = array_merge ($all_results, $results);
    if (count($results) > 0) {
        $last = count($results) - 1;
        echo '     last result ' . $results[$last]['id'] . ' ' . $results[$last]['datetime'] . "\n";
        echo '    first result ' . $results[0]['id'] . ' ' . $results[0]['datetime'] . "\n";
    } else {
        break;
    }
    @$params['after'] = $exchange->last_response_headers['cb-after'][0];

// uncomment one of the following:
// } while (true); // fetch all results forever
} while (count($all_results) < 1000); // fetch up to 1000 results

echo "fetched " . count($all_results) . " results in total\n";

?>