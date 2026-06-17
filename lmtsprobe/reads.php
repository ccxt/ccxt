<?php
error_reporting(E_ALL & ~E_DEPRECATED & ~E_WARNING);
date_default_timezone_set('UTC');
$root = dirname(__FILE__) . '/..';
include $root . '/ccxt.php';
use React\Async;

$keys = json_decode(file_get_contents($root . '/keys.local.json'), true)['limitless'];
$ex = new \ccxt\prediction\limitless(['apiKey' => $keys['apiKey'], 'secret' => $keys['secret'], 'walletAddress' => $keys['walletAddress'] ?? null]);

Async\await(Async\coroutine(function () use ($ex) {
    Async\await($ex->load_markets());
    $outcome = null; $slug = null;
    foreach ($ex->markets as $m) {
        $info = $m['info'] ?? [];
        $venue = $info['venue'] ?? [];
        if (!empty($venue['exchange']) && !empty($m['outcomes'])) { $outcome = $m['outcomes'][0]['outcome']; $slug = $info['slug'] ?? null; break; }
    }
    echo "using outcome $outcome slug $slug\n\n";
    $fake = '11111111-1111-4111-8111-111111111111';
    $tests = [
        ['fetchAccounts', fn() => $ex->fetch_accounts()],
        ['fetchPositions', fn() => $ex->fetch_positions()],
        ['fetchMyTrades (all)', fn() => $ex->fetch_my_trades()],
        ['fetchMyTrades (outcome)', fn() => $ex->fetch_my_trades($outcome)],
        ['fetchOrders (outcome)', fn() => $ex->fetch_orders($outcome)],
        ['fetchOpenOrders (outcome)', fn() => $ex->fetch_open_orders($outcome)],
        ['fetchClosedOrders (outcome)', fn() => $ex->fetch_closed_orders($outcome)],
        ['fetchOrder (fake id)', fn() => $ex->fetch_order($fake, $outcome)],
        ['fetchOrdersByIds (fake id)', fn() => $ex->fetch_orders_by_ids([$fake], $outcome)],
        ['cancelOrder (fake id)', fn() => $ex->cancel_order($fake, $outcome)],
        ['cancelOrders (fake id)', fn() => $ex->cancel_orders([$fake], $outcome)],
        ['cancelAllOrders (slug, no-op)', fn() => $ex->cancel_all_orders(null, ['slug' => $slug, 'warnOnCancelAllOrdersWithOutcome' => false])],
    ];
    foreach ($tests as [$label, $fn]) {
        try {
            $r = Async\await($fn());
            $n = is_array($r) ? count($r) : ($r ? 1 : 0);
            echo "PASS  $label  -> $n item(s)\n";
        } catch (\Throwable $e) {
            $name = get_class($e); $msg = $e->getMessage();
            $reached = (strpos($name, 'OrderNotFound') !== false) || strpos($msg, 'not found') !== false || strpos($msg, 'already canceled') !== false;
            echo ($reached ? 'PASS* ' : 'FAIL  ') . "$label  -> $name: " . substr($msg, 0, 90) . "\n";
        }
    }
}));
