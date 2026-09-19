<?php

// OrderRouter — ask the router how to convert one asset into another.
//
// The router holds live L2 books from many venues and answers "what is the
// cheapest way to turn X into Y right now, and on which venues" — book-walked
// to your actual size, fee-adjusted, and split across venues when that beats
// any single one.
//
// This example is READ-ONLY: it asks for a recommendation and prints it. It
// never places an order. Execution lives behind $router->execute($plan, $venues),
// which defaults to dry_run and refuses to trade unless explicitly told to.
//
// Usage:
//   ORDER_ROUTER_API_KEY=or_live_... php examples/php/order-router.php
//
// Get a key from https://docs.ccxt.com/router

$root = dirname(dirname(dirname(__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set('UTC');

$apiKey = getenv('ORDER_ROUTER_API_KEY');
if (!$apiKey) {
    echo "set ORDER_ROUTER_API_KEY (get one at https://docs.ccxt.com/router)\n";
    exit(0);
}

$router = new \ccxt\OrderRouter(array(
    'apiKey' => $apiKey,
    // 'baseUrl' => 'https://docs.ccxt.com/router/api',  // the default
));

// Exactly one of amountIn or amountOut — never both, and never neither.
// They are different book traversals, not a unit conversion: amountIn walks
// until the money runs out, amountOut walks until the size is reached.
$route = $router->fetchRoute('USDT', 'BTC', array(
    'amountIn' => 20,
    'strategy' => 'split_optimal',
));

// An unroutable pair comes back as a result with a reason, NOT an exception.
// Refusing to quote is a deliberate outcome, not an error.
if (isset($route['unroutableReason']) && $route['unroutableReason'] !== null) {
    echo 'unroutable: ' . $route['unroutableReason'] . "\n";
    exit(0);
}

echo $route['amountIn'] . ' ' . $route['from'] . ' -> ' . $route['amountOut'] . ' ' . $route['to'] . "\n";
echo 'effective rate   ' . $route['effectiveRate'] . "\n";
echo 'price impact     ' . $route['impactBps'] . " bps\n";  // positive is worse
echo 'fill ratio       ' . $route['fillRatio'] . "\n";

// One hop is a direct conversion; more than one means it was bridged
// (e.g. SOL -> USDT -> BTC), and each hop is a separate order.
foreach ($route['hops'] as $i => $hop) {
    echo 'hop ' . ($i + 1) . ' ' . $hop['pair'] . ' ' . $hop['side']
        . ' - ' . count($hop['legs']) . " venue(s)\n";
    foreach ($hop['legs'] as $leg) {
        echo '    ' . $leg['exchangeId'] . ' ' . $leg['amount']
            . ' @ ' . $leg['effectivePrice'] . "\n";
    }
}
