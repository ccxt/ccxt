<?php
error_reporting(E_ALL & ~E_DEPRECATED & ~E_WARNING);
date_default_timezone_set('UTC');
$root = dirname(__FILE__) . '/..';
include $root . '/ccxt.php';
use React\Async;

$k = json_decode(file_get_contents($root . '/keys.local.json'), true)['limitless'];
$ex = new \ccxt\prediction\limitless(['apiKey' => $k['apiKey'], 'secret' => $k['secret'], 'walletAddress' => $k['walletAddress'], 'privateKey' => $k['privateKey']]);

Async\await(Async\coroutine(function () use ($ex) {
    Async\await($ex->load_markets());
    $outcome = null; $book = null;
    foreach ($ex->markets as $m) {
        $info = $m['info'] ?? []; $venue = $info['venue'] ?? []; $slug = $info['slug'] ?? null;
        if (!(!empty($venue['exchange']) && !empty($m['outcomes']) && $slug)) continue;
        if (strpos($slug, '5-min') !== false || strpos($slug, 'hourly') !== false) continue;
        try {
            $ob = Async\await($ex->fetch_order_book($m['outcomes'][0]['outcome']));
            if ($ob && !empty($ob['bids']) && $ob['bids'][0][0] > 0.05) { $outcome = $m['outcomes'][0]['outcome']; $book = $ob; break; }
        } catch (\Throwable $e) {}
    }
    echo "outcome $outcome bestBid " . json_encode($book['bids'][0]) . "\n";
    $placed = Async\await($ex->create_order($outcome, 'limit', 'buy', 5, 0.02, ['timeInForce' => 'GTC', 'postOnly' => true]));
    echo "PLACED id " . $placed['id'] . " status " . $placed['status'] . "\n";
    Async\await(\React\Promise\Timer\sleep(4.5));
    $open = Async\await($ex->fetch_open_orders($outcome));
    $mine = array_filter($open, fn($o) => $o['id'] === $placed['id']);
    echo "fetchOpenOrders: " . count($open) . " mine present: " . (count($mine) > 0 ? 'true' : 'false') . "\n";
    $canceled = Async\await($ex->cancel_order($placed['id'], $outcome));
    echo "CANCELED: " . substr(json_encode($canceled['info'] ?? $canceled), 0, 120) . "\n";
    Async\await(\React\Promise\Timer\sleep(1.5));
    $after = Async\await($ex->fetch_open_orders($outcome));
    $still = array_filter($after, fn($o) => $o['id'] === $placed['id']);
    echo "after cancel, mine still open: " . (count($still) > 0 ? 'true' : 'false') . " (should be false)\n";
}));
