<?php
// Polymarket end-to-end example (read market data + place/fetch/cancel one order).
//
// Flow:
//   1. pick a high-volume event, a market inside it, and an outcome with a live two-sided book
//   2. fetch the order book, ticker and recent trades for that outcome
//   3. place a resting limit BUY well below the book, fetch it back, then cancel it
//
// Usage:
//   POLYMARKET_PRIVATEKEY=... POLYMARKET_WALLETADDRESS=0x... \
//   php examples/php/prediction/prediction-polymarket-end-to-end.php
//
// walletAddress is the polymarket account wallet (the proxy / deposit wallet shown in
// your polymarket profile), privateKey is the key of the EOA that owns it.

include dirname(dirname(dirname(dirname(__FILE__)))) . '/ccxt.php';
date_default_timezone_set('UTC');

use function React\Async\await;

const MAX_NOTIONAL_USD = 25;  // hard cap per trade
const ORDER_SIZE_SHARES = 5;  // polymarket minimum order size

$privateKey = getenv('POLYMARKET_PRIVATEKEY');
$walletAddress = getenv('POLYMARKET_WALLETADDRESS');
if (!$privateKey || !$walletAddress) {
    echo "Set POLYMARKET_PRIVATEKEY and POLYMARKET_WALLETADDRESS env vars first.\n";
    exit(0);
}

$exchange = new \ccxt\prediction\polymarket([
    'privateKey' => $privateKey,
    'walletAddress' => $walletAddress,
]);

// 1) pick a high-volume event and an outcome with a live two-sided book -------------------
// fetch_events requires a scope (query/queries/tags/eventId/slug); sort/limit apply within it
$events = await($exchange->fetch_events(['query' => 'fed', 'sort' => 'volume', 'limit' => 15]));
$chosen = null;
$probes = 0;
foreach ($events as $event) {
    foreach (($event['markets'] ?? []) as $market) {
        foreach (($market['outcomes'] ?? []) as $outcome) {
            if ($probes >= 20) {
                break;
            }
            $probes += 1;
            $orderbook = await($exchange->fetch_order_book($outcome['outcome']));
            if (count($orderbook['bids']) > 0 && count($orderbook['asks']) > 0) {
                $chosen = ['event' => $event, 'market' => $market, 'outcome' => $outcome, 'orderbook' => $orderbook];
                break;
            }
        }
        if ($chosen) break;
    }
    if ($chosen) break;
}
if ($chosen === null) {
    echo "Could not find an outcome with a live two-sided order book right now.\n";
    exit(0);
}
// the tradeable handle is the outcome's `outcome` field ("MARKET:LABEL")
$symbol = $chosen['outcome']['outcome'];
echo 'event:    ' . ($chosen['event']['title'] ?? '') . "\n";
echo 'market:   ' . ($chosen['market']['symbol'] ?? '') . "\n";
echo 'outcome:  ' . $symbol . ' (' . ($chosen['outcome']['label'] ?? '') . ")\n";

// 2) market data for the chosen outcome ---------------------------------------------------
$bestBid = $chosen['orderbook']['bids'][0];
$bestAsk = $chosen['orderbook']['asks'][0];
echo "\n--- market data ---\n";
echo 'orderbook bid/ask: ' . json_encode($bestBid) . ' / ' . json_encode($bestAsk) . "\n";
try {
    $ticker = await($exchange->fetch_ticker($symbol));
    echo 'ticker bid/ask/last: ' . $ticker['bid'] . ' / ' . $ticker['ask'] . ' / ' . $ticker['last'] . "\n";
} catch (\Exception $e) {
    echo 'ticker:        n/a (' . get_class($e) . ")\n";
}
try {
    $trades = await($exchange->fetch_trades($symbol, null, 3));
    echo 'recent trades: ' . count($trades) . (count($trades) ? (' last @ ' . $trades[0]['price']) : '') . "\n";
} catch (\Exception $e) {
    echo 'trades:        n/a (' . get_class($e) . ")\n";
}

// 3) place a resting limit BUY well below the book, fetch it, then cancel -----------------
$tick = $chosen['outcome']['precision']['price'] ?? 0.01;
$bidPrice = $bestBid[0];
// half the best bid, floored to the tick — far below the ask, so it cannot fill
$price = max($tick, round(floor(($bidPrice * 0.5) / $tick) * $tick, 4));
$notional = ORDER_SIZE_SHARES * $price;
echo "\n--- order ---\n";
echo 'placing limit BUY ' . ORDER_SIZE_SHARES . ' shares @ ' . $price . ' (notional ' . round($notional, 2) . " USD)\n";
if ($notional >= MAX_NOTIONAL_USD) {
    echo 'ABORT: notional >= ' . MAX_NOTIONAL_USD . " USD safety cap.\n";
    exit(0);
}

$order = null;
try {
    $order = await($exchange->create_order($symbol, 'limit', 'buy', ORDER_SIZE_SHARES, $price));
    echo 'placed:  id ' . $order['id'] . ' | status ' . $order['status'] . "\n";
    $fetched = await($exchange->fetch_order($order['id'], $symbol));
    echo 'fetched: id ' . $fetched['id'] . ' | status ' . $fetched['status'] . ' | remaining ' . $fetched['remaining'] . "\n";
} finally {
    if ($order !== null && isset($order['id'])) {
        $canceled = await($exchange->cancel_order($order['id'], $symbol));
        echo 'canceled: id ' . $canceled['id'] . ' | status ' . $canceled['status'] . "\n";
    }
}
