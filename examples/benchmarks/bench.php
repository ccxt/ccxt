<?php
// CCXT cross-language benchmark — PHP (ReactPHP async)
//
// Mirrors bench.mjs: same workload, same metrics, same ##RESULT## output.
//   latency / network-vs-processing trace / CPU (getrusage) /
//   peak RSS (/proc/self/status VmHWM) / bandwidth
//
// The REST path wraps the base `fetch` and `parse_json` methods to split each
// call's wall time into time on the wire and time on the CPU:
//   network    = time inside fetch()  -  time inside JSON decode
//   processing = total fetch_order_book  -  network
//
// Usage:  php bench.php rest   |   php bench.php ws

error_reporting(E_ALL & ~E_DEPRECATED);
date_default_timezone_set('UTC');
include dirname(__DIR__, 2) . '/ccxt.php';

use React\Async;

$EXCHANGE = getenv('BENCH_EXCHANGE') ?: 'coinbase';
$SYMBOL = getenv('BENCH_SYMBOL') ?: 'BTC/USD';
$REST_ITERS = (int)(getenv('BENCH_REST_ITERS') ?: 60);
$WARMUP = (int)(getenv('BENCH_REST_WARMUP') ?: 5);
$WS_UPDATES = (int)(getenv('BENCH_WS_UPDATES') ?: 200);
$SLEEP_MS = (int)(getenv('BENCH_SLEEP_MS') ?: 250);
$LOAD_SECONDS = (int)(getenv('BENCH_LOAD_SECONDS') ?: 8);
$LOAD_LEVELS = (int)(getenv('BENCH_LOAD_LEVELS') ?: 1000);
$LOAD_RETAIN = (int)(getenv('BENCH_LOAD_RETAIN') ?: 2000);

function now_ms() {
    return microtime(true) * 1000.0;
}

function status_kb($field) {
    foreach (file('/proc/self/status') as $line) {
        if (strpos($line, $field . ':') === 0) {
            preg_match('/(\d+)/', $line, $m);
            return (int)$m[1];
        }
    }
    return 0;
}

function peak_rss_kb() {
    return status_kb('VmHWM');
}

function current_rss_kb() {
    return status_kb('VmRSS');
}

function build_raw_book($levels) {
    $bids = array();
    $asks = array();
    for ($i = 0; $i < $levels; $i++) {
        $bids[] = array(1000000 - $i, 500 + $i);
        $asks[] = array(1000000 + $i, 500 + $i);
    }
    return json_encode(array('bids' => $bids, 'asks' => $asks, 'timestamp' => 1700000000000));
}

function cpu_secs() {
    $r = getrusage();
    return array(
        'user' => $r['ru_utime.tv_sec'] + $r['ru_utime.tv_usec'] / 1e6,
        'system' => $r['ru_stime.tv_sec'] + $r['ru_stime.tv_usec'] / 1e6,
    );
}

function bstats($arr) {
    if (count($arr) === 0) {
        return array('min' => 0, 'p50' => 0, 'p90' => 0, 'p95' => 0, 'p99' => 0, 'max' => 0, 'avg' => 0);
    }
    sort($arr);
    $n = count($arr);
    $q = function($p) use ($arr, $n) { return $arr[min($n - 1, (int)($p * $n))]; };
    return array(
        'min' => round($arr[0], 2),
        'p50' => round($q(0.5), 2),
        'p90' => round($q(0.9), 2),
        'p95' => round($q(0.95), 2),
        'p99' => round($q(0.99), 2),
        'max' => round($arr[$n - 1], 2),
        'avg' => round(array_sum($arr) / $n, 2),
    );
}

function emit($obj) {
    echo '##RESULT## ' . json_encode($obj) . "\n";
}

// PHP's `extends` needs a literal class name, so build the instrumented
// subclass with eval() to keep the exchange configurable. It wraps the two base
// methods every request goes through: fetch() (HTTP layer) and parse_json().
function traced_exchange($exchange_id, $config) {
    $base = "\\ccxt\\async\\$exchange_id";
    if (!class_exists('BenchTraced')) {
        eval('
        class BenchTraced extends ' . $base . ' {
            public $_http_ms = 0.0;
            public $_json_ms = 0.0;
            public function fetch($url, $method = "GET", $headers = null, $body = null) {
                $this->_json_ms = 0.0;
                $t0 = now_ms();
                $p = parent::fetch($url, $method, $headers, $body);
                return $p->then(function ($r) use ($t0) {
                    $this->_http_ms = now_ms() - $t0;
                    return $r;
                });
            }
            public function parse_json($json_string, $as_associative_array = true) {
                $t0 = now_ms();
                $r = parent::parse_json($json_string, $as_associative_array);
                $this->_json_ms += now_ms() - $t0;
                return $r;
            }
        }');
    }
    return new \BenchTraced($config);
}

$bench_rest = function() use ($EXCHANGE, $SYMBOL, $REST_ITERS, $SLEEP_MS, $WARMUP) {
    $ex = traced_exchange($EXCHANGE, array('enableRateLimit' => false));
    $w0 = now_ms();
    Async\await($ex->load_markets());
    $load_markets_ms = now_ms() - $w0;
    // warmup: prime the TCP/TLS connection and let tiered JITs settle before we measure
    for ($w = 0; $w < $WARMUP; $w++) {
        Async\await($ex->fetch_order_book($SYMBOL));
    }
    $c0 = cpu_secs();
    $latency = array();
    $network = array();
    $processing = array();
    $json_decode = array();
    $total_bytes = 0;
    for ($i = 0; $i < $REST_ITERS; $i++) {
        $t0 = now_ms();
        Async\await($ex->fetch_order_book($SYMBOL));
        $total = now_ms() - $t0;
        $wire = $ex->_http_ms - $ex->_json_ms;
        $latency[] = $total;
        $network[] = $wire;
        $processing[] = $total - $wire;
        $json_decode[] = $ex->_json_ms;
        $total_bytes += strlen($ex->last_http_response ?? '');
        usleep($SLEEP_MS * 1000);
    }
    $c1 = cpu_secs();
    $closed = $ex->close();
    if ($closed instanceof \React\Promise\PromiseInterface) {
        Async\await($closed);
    }
    emit(array(
        'language' => 'PHP',
        'runtime' => PHP_VERSION,
        'ccxt' => \ccxt\Exchange::VERSION,
        'mode' => 'rest',
        'exchange' => $EXCHANGE,
        'symbol' => $SYMBOL,
        'iterations' => $REST_ITERS,
        'loadMarketsMs' => round($load_markets_ms, 2),
        'latencyMs' => bstats($latency),
        // raw per-call samples so any percentile can be recomputed from the data
        'latencySamplesMs' => array_map(function ($x) { return round($x, 2); }, $latency),
        'networkMs' => bstats($network),
        'processingMs' => bstats($processing),
        'jsonDecodeMs' => bstats($json_decode),
        'cpuUserSec' => round($c1['user'] - $c0['user'], 3),
        'cpuSystemSec' => round($c1['system'] - $c0['system'], 3),
        'peakRssMb' => round(peak_rss_kb() / 1024.0, 1),
        'bytesTotal' => $total_bytes,
        'bytesPerCall' => (int)round($total_bytes / $REST_ITERS),
    ));
};

$bench_ws = function() use ($EXCHANGE, $SYMBOL, $WS_UPDATES) {
    $cls = "\\ccxt\\pro\\$EXCHANGE";
    $ex = new $cls(array());
    Async\await($ex->load_markets());
    // the first update builds the full snapshot (a large one-time cost); measure it
    // separately and start the CPU/steady-state counters only AFTER it
    $s0 = now_ms();
    Async\await($ex->watch_order_book($SYMBOL));
    $first_ms = now_ms() - $s0;
    $steady = $WS_UPDATES - 1;
    $c0 = cpu_secs();
    $t0 = now_ms();
    $last = $t0;
    $gaps = array();
    for ($i = 0; $i < $steady; $i++) {
        Async\await($ex->watch_order_book($SYMBOL));
        $t = now_ms();
        $gaps[] = $t - $last;
        $last = $t;
    }
    $steady_ms = now_ms() - $t0;
    $c1 = cpu_secs();
    $closed = $ex->close();
    if ($closed instanceof \React\Promise\PromiseInterface) {
        Async\await($closed);
    }
    $cpu_user = $c1['user'] - $c0['user'];
    emit(array(
        'language' => 'PHP',
        'runtime' => PHP_VERSION,
        'ccxt' => \ccxt\Exchange::VERSION,
        'mode' => 'ws',
        'exchange' => $EXCHANGE,
        'symbol' => $SYMBOL,
        'updates' => $steady,
        'firstUpdateMs' => round($first_ms, 2),
        'gapMs' => bstats($gaps),
        'updatesPerSec' => round($steady / ($steady_ms / 1000.0), 2),
        'cpuPerUpdateMs' => round($cpu_user * 1000.0 / $steady, 3),
        'cpuUserSec' => round($cpu_user, 3),
        'cpuSystemSec' => round($c1['system'] - $c0['system'], 3),
        'peakRssMb' => round(peak_rss_kb() / 1024.0, 1),
    ));
};

$bench_load = function() use ($EXCHANGE, $SYMBOL, $LOAD_SECONDS, $LOAD_LEVELS, $LOAD_RETAIN) {
    $cls = "\\ccxt\\$EXCHANGE";
    $ex = new $cls(array());
    $raw = build_raw_book($LOAD_LEVELS);
    for ($i = 0; $i < 200; $i++) {
        $ex->parse_order_book($ex->parse_json($raw), $SYMBOL);
    }
    // Part A — CPU throughput, time-boxed
    $c0 = cpu_secs();
    $t0 = now_ms();
    $deadline = $t0 + $LOAD_SECONDS * 1000;
    $ops = 0;
    $sink = 0;
    while (now_ms() < $deadline) {
        $ob = $ex->parse_order_book($ex->parse_json($raw), $SYMBOL);
        $sink += count($ob['bids']);
        $ops++;
    }
    $wall_a = now_ms() - $t0;
    $c1 = cpu_secs();
    $cpu = ($c1['user'] - $c0['user']) + ($c1['system'] - $c0['system']);
    // Part B — memory footprint of retained structures
    $rss_before = current_rss_kb();
    $kept = array();
    for ($i = 0; $i < $LOAD_RETAIN; $i++) {
        $kept[] = $ex->parse_order_book($ex->parse_json($raw), $SYMBOL);
    }
    $rss_after = current_rss_kb();
    $per_book_kb = round(($rss_after - $rss_before) / $LOAD_RETAIN, 2);
    emit(array(
        'language' => 'PHP',
        'runtime' => PHP_VERSION,
        'ccxt' => \ccxt\Exchange::VERSION,
        'mode' => 'load',
        'levels' => $LOAD_LEVELS,
        'seconds' => $LOAD_SECONDS,
        'ops' => $ops,
        'opsPerSec' => round($ops / ($wall_a / 1000.0), 1),
        'cpuUserSec' => round($c1['user'] - $c0['user'], 3),
        'cpuSystemSec' => round($c1['system'] - $c0['system'], 3),
        'cpuPerOpUs' => round($cpu * 1e6 / $ops, 2),
        'peakRssMb' => round(peak_rss_kb() / 1024.0, 1),
        'retainBooks' => $LOAD_RETAIN,
        'perBookKb' => $per_book_kb,
        'keptLen' => count($kept) + ($sink > -1 ? 0 : 1),
    ));
};

$mode = isset($argv[1]) ? $argv[1] : 'rest';
if ($mode === 'rest') {
    $bench_rest();
} elseif ($mode === 'ws') {
    $bench_ws();
} else {
    $bench_load();
}
