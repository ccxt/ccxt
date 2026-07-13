<?php
// Prediction markets example (async / ReactPHP)
//
// Prediction-market exchanges are async-only in PHP and live in the
// \ccxt\prediction namespace, extending PredictionExchange (events/outcomes
// helpers) on top of the ReactPHP \ccxt\async\Exchange.

include dirname(dirname(dirname(dirname(__FILE__)))) . '/ccxt.php';
date_default_timezone_set('UTC');

use function React\Async\await;

$exchange = new \ccxt\prediction\polymarket([]);
echo 'id: ' . $exchange->id . "\n";
echo 'isPrediction: ' . ($exchange->is_prediction() ? 'true' : 'false') . "\n";
try {
    $events = await($exchange->fetch_events(['query' => 'Fed Chair']));
    echo 'fetchEvents({query}): ' . count($events) . "\n";
    $markets = await($exchange->fetch_markets(['query' => 'Fed']));
    echo 'fetched markets: ' . count($markets) . "\n";
} catch (\Exception $e) {
    echo 'fetchMarkets skipped (offline/geo): ' . get_class($e) . "\n";
}
