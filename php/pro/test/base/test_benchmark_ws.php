<?php
namespace ccxt\pro;

// Set memory limit to 1GB for benchmark testing
ini_set('memory_limit', '1G');

include_once (__DIR__.'/../../../../ccxt.php');

use ccxt\pro\binance;
use React\Async;
use React\EventLoop\Loop;
use Exception;
use React\Promise\Timer\sleep;
use React\Promise\all;
use function React\Async\async;
use function React\Async\await;

// Constants
const NUM_CONSUMERS = 30;
$SYMBOLS = [];

// Set up logger
function logger($message) {
    echo $message . "\n";
}

// Unified function to setup exchange with mock server
function setup_exchange($custom_ws_url, $symbol) {
    $exchange = new binance(array(
        'enableRateLimit' => false,
        'verbose' => false,
    ));
    // Configure WebSocket URLs to use mock server
    $exchange->urls['api']['ws']['spot'] = $custom_ws_url;
    $exchange->urls['api']['ws']['margin'] = $custom_ws_url;
    $exchange->urls['api']['ws']['future'] = $custom_ws_url;
    return $exchange;
}

// Unified function to calculate and display benchmark metrics
function calculate_and_display_metrics(
    $received,
    $dropped,
    $latency_sum,
    $min_latency,
    $max_latency,
    $latencies,
    $start_time,
    $benchmark_name,
    $actual_runtime_seconds
) {
    $avg_latency = $received > 0 ? $latency_sum / $received : 0;
    $median_latency = median($latencies);
    $p50_latency = percentile($latencies, 50);
    $p90_latency = percentile($latencies, 90);
    $p99_latency = percentile($latencies, 99);
    $elapsed_ms = (int)(microtime(true) * 1000) - $start_time;
    $throughput = $elapsed_ms > 0 ? $received / ($elapsed_ms / 1000) : 0;
    $elapsed_sec = $elapsed_ms / 1000;
    logger('--- Benchmark Results (' . $benchmark_name . ') ---');
    logger('Total messages received: ' . $received);
    logger('Dropped messages: ' . $dropped);
    logger('Throughput: ' . number_format($throughput, 2) . ' msg/sec');
    logger('Elapsed time (s): ' . number_format($elapsed_sec, 2));
    logger('Actual runtime (s): ' . number_format($actual_runtime_seconds, 2));
    logger('Latency (ms): avg=' . number_format($avg_latency, 2) . ', min=' . $min_latency . ', max=' . $max_latency . ', median=' . number_format($median_latency, 2) . ', p50=' . number_format($p50_latency, 2) . ', p90=' . number_format($p90_latency, 2) . ', p99=' . number_format($p99_latency, 2));
}

// Unified function to create benchmark metrics tracking object
function create_metrics_tracker() {
    return array(
        'received' => 0,
        'dropped' => 0,
        'last_id' => null,
        'first_id' => null,
        'latency_sum' => 0,
        'min_latency' => PHP_FLOAT_MAX,
        'max_latency' => PHP_FLOAT_MIN,
        'latencies' => array(),
        'count' => 0,
        'start_time' => (int)(microtime(true) * 1000)
    );
}

// Unified function to process a ticker message and update metrics
function process_ticker_message($ticker, &$metrics, $RESERVOIR_SIZE) {
    $metrics['received']++;
    $now = (int)(microtime(true) * 1000);
    $event_time = (float)($ticker['info']['E']) / 1e6; // E is in nanoseconds, convert to ms
    $latency = $now - $event_time;
    $metrics['latency_sum'] += $latency;
    $metrics['count']++;
    reservoir_sample_push($metrics['latencies'], $latency, $metrics['count'], $RESERVOIR_SIZE);
    if ($latency < $metrics['min_latency']) {
        $metrics['min_latency'] = $latency;
    }
    if ($latency > $metrics['max_latency']) {
        $metrics['max_latency'] = $latency;
    }
    $id = isset($ticker['info']['id']) ? $ticker['info']['id'] : null;
    if ($metrics['last_id'] !== null && $id !== null) {
        if ($id > $metrics['last_id'] + 1) {
            $metrics['dropped'] += $id - $metrics['last_id'] - 1;
        }
        // Never allow negative dropped
        if ($metrics['dropped'] < 0) {
            $metrics['dropped'] = 0;
        }
    }
    if ($metrics['first_id'] === null && $id !== null) {
        $metrics['first_id'] = $id;
    }
    $metrics['last_id'] = $id;
}

// Unified function to calculate and return benchmark metrics as a dict
function store_metrics(
    $received,
    $dropped,
    $latency_sum,
    $min_latency,
    $max_latency,
    $latencies,
    $start_time,
    $benchmark_name,
    $actual_runtime_seconds
) {
    $avg_latency = $received > 0 ? $latency_sum / $received : 0;
    $median_latency = median($latencies);
    $p50_latency = percentile($latencies, 50);
    $p90_latency = percentile($latencies, 90);
    $p99_latency = percentile($latencies, 99);
    $elapsed_ms = (int)(microtime(true) * 1000) - $start_time;
    $throughput = $elapsed_ms > 0 ? $received / ($elapsed_ms / 1000) : 0;
    return array(
        'Test Name' => $benchmark_name,
        'Msgs Recv' => $received,
        'Dropped' => $dropped,
        'Thrput(msg/s)' => $throughput,
        'Avg Lat(ms)' => $avg_latency,
        'Min Lat(ms)' => $min_latency,
        'Max Lat(ms)' => $max_latency,
        'Med Lat(ms)' => $median_latency,
        'P50 Lat(ms)' => $p50_latency,
        'P90 Lat(ms)' => $p90_latency,
        'P99 Lat(ms)' => $p99_latency,
        'Runtime(s)' => $actual_runtime_seconds,
    );
}

// Function to display a table of all benchmark results
function display_results_table($results) {
    $headers = array(
        'Test Name', 'Msgs Recv', 'Dropped', 'Thrput(msg/s)',
        'Avg Lat(ms)', 'Min Lat(ms)', 'Max Lat(ms)', 'Med Lat(ms)',
        'P50 Lat(ms)', 'P90 Lat(ms)', 'P99 Lat(ms)', 'Runtime(s)'
    );
    // Calculate column widths
    $col_widths = array();
    foreach ($headers as $h) {
        $max_width = strlen($h);
        foreach ($results as $row) {
            $value = is_float($row[$h]) ? number_format($row[$h], 2) : (string)$row[$h];
            $max_width = max($max_width, strlen($value));
        }
        $col_widths[$h] = $max_width;
    }
    // Print header
    $header_row = '';
    foreach ($headers as $h) {
        $header_row .= str_pad($h, $col_widths[$h]) . ' | ';
    }
    $separator = '';
    foreach ($headers as $h) {
        $separator .= str_repeat('-', $col_widths[$h]) . '-+-';
    }
    echo "\n=== Benchmark Results Summary ===\n\n";
    echo $header_row . "\n";
    echo $separator . "\n";
    // Print rows
    foreach ($results as $row) {
        $row_str = '';
        foreach ($headers as $h) {
            $value = is_float($row[$h]) ? number_format($row[$h], 2) : (string)$row[$h];
            $row_str .= str_pad($value, $col_widths[$h]) . ' | ';
        }
        echo $row_str . "\n";
    }
}

// Helper functions
function median($arr) {
    if (empty($arr)) {
        return 0;
    }
    sort($arr);
    $mid = count($arr) / 2;
    if (count($arr) % 2 == 0) {
        return ($arr[$mid - 1] + $arr[$mid]) / 2;
    } else {
        return $arr[(int)$mid];
    }
}

function percentile($arr, $p) {
    if (empty($arr)) {
        return 0;
    }
    sort($arr);
    $k = (count($arr) - 1) * ($p / 100);
    $f = (int)$k;
    $c = $k - $f;
    if ($f + 1 < count($arr)) {
        return $arr[$f] * (1 - $c) + $arr[$f + 1] * $c;
    } else {
        return $arr[$f];
    }
}

function reservoir_sample_push(&$reservoir, $value, $count, $size) {
    if (count($reservoir) < $size) {
        $reservoir[] = $value;
    } else {
        $j = (int)(mt_rand() / mt_getrandmax() * $count);
        if ($j < $size) {
            $reservoir[$j] = $value;
        }
    }
}

// Stream consumer function
function stream_consumer($binance, $symbol_name, $index, &$parallel_metrics, $RESERVOIR_SIZE, $end_time4) {
    return async(function() use ($binance, $symbol_name, $index, &$parallel_metrics, $RESERVOIR_SIZE, $end_time4) {
        while ((int)(microtime(true) * 1000) < $end_time4) {
            try {
                $ticker = await($binance->watch_ticker($symbol_name));
                process_ticker_message($ticker, $parallel_metrics[$index], $RESERVOIR_SIZE);
            } catch (Exception $e) {
                logger('Error in stream ' . $index . ': ' . $e->getMessage());
            }
        }
    })();
}

// Main benchmark function
function main() {
    return async(function() {
        $duration_seconds = 10;
        $symbol = 'BTC/USDT:USDT';
        $custom_ws_url = 'ws://localhost:8080/ws';
        $RESERVOIR_SIZE = 5000;

        $benchmark_results = array();

        // --- First Benchmark: watch_ticker ---
        logger('=== Starting Benchmark 1: watch_ticker ===');
        $benchmark_start_time = microtime(true);
        $binance = setup_exchange($custom_ws_url, $symbol);
        await($binance->load_markets());
        // Filter for swap/futures markets only
        $futures_markets = array();
        foreach ($binance->markets as $market) {
            if (isset($market['swap']) && $market['swap']) {
                $futures_markets[] = $market;
            }
        }
        global $SYMBOLS;
        $SYMBOLS = array();
        for ($i = 0; $i < min(count($futures_markets), NUM_CONSUMERS); $i++) {
            $SYMBOLS[] = $futures_markets[$i]['symbol'];
        }
        logger('Benchmarking for ' . $duration_seconds . 's...');
        $metrics1 = create_metrics_tracker();
        $end_time = $metrics1['start_time'] + $duration_seconds * 1000;
        while ((int)(microtime(true) * 1000) < $end_time) {
            try {
                $ticker = await($binance->watch_ticker($symbol));
                process_ticker_message($ticker, $metrics1, $RESERVOIR_SIZE);
            } catch (Exception $e) {
                logger('Error: ' . $e->getMessage());
            }
        }
        $actual_runtime1 = microtime(true) - $benchmark_start_time;
        calculate_and_display_metrics(
            $metrics1['received'],
            $metrics1['dropped'],
            $metrics1['latency_sum'],
            $metrics1['min_latency'],
            $metrics1['max_latency'],
            $metrics1['latencies'],
            $metrics1['start_time'],
            'watch_ticker',
            $actual_runtime1
        );
        $benchmark_results[] = store_metrics(
            $metrics1['received'],
            $metrics1['dropped'],
            $metrics1['latency_sum'],
            $metrics1['min_latency'],
            $metrics1['max_latency'],
            $metrics1['latencies'],
            $metrics1['start_time'],
            'watch_ticker',
            $actual_runtime1
        );

        // --- Second Benchmark: subscribe_ticker with callback (sync=true) ---
        logger('=== Starting Benchmark 2: subscribe_ticker with sync=true ===');
        $benchmark_start_time = microtime(true);
        $metrics2 = create_metrics_tracker();
        $on_ticker = function($msg) use (&$metrics2, $RESERVOIR_SIZE) {
            if (isset($msg->error) && $msg->error) {
                throw $msg->error;
            }
            process_ticker_message($msg->payload, $metrics2, $RESERVOIR_SIZE);
        };
        await($binance->subscribe_ticker($symbol, $on_ticker, true));
        await(\React\Promise\Timer\sleep($duration_seconds));
        $actual_runtime2 = microtime(true) - $benchmark_start_time;
        calculate_and_display_metrics(
            $metrics2['received'],
            $metrics2['dropped'],
            $metrics2['latency_sum'],
            $metrics2['min_latency'],
            $metrics2['max_latency'],
            $metrics2['latencies'],
            $metrics2['start_time'],
            'subscribe_ticker - sync=true',
            $actual_runtime2
        );
        $benchmark_results[] = store_metrics(
            $metrics2['received'],
            $metrics2['dropped'],
            $metrics2['latency_sum'],
            $metrics2['min_latency'],
            $metrics2['max_latency'],
            $metrics2['latencies'],
            $metrics2['start_time'],
            'subscribe_ticker - sync=true',
            $actual_runtime2
        );

        // --- Third Benchmark: subscribe_ticker with callback (sync=false) ---
        logger('=== Starting Benchmark 3: subscribe_ticker with sync=false ===');
        $benchmark_start_time = microtime(true);
        $binance->close();
        $binance3 = setup_exchange($custom_ws_url, $symbol);
        
        // Establish WebSocket connection first
        await($binance3->watch_ticker($symbol));
        
        $metrics3 = create_metrics_tracker();
        $on_ticker3 = function($msg) use (&$metrics3, $RESERVOIR_SIZE) {
            if (isset($msg->error) && $msg->error) {
                throw $msg->error;
            }
            process_ticker_message($msg->payload, $metrics3, $RESERVOIR_SIZE);
        };
        await($binance3->subscribe_ticker($symbol, $on_ticker3, false));
        await(\React\Promise\Timer\sleep($duration_seconds));
        $actual_runtime3 = microtime(true) - $benchmark_start_time;
        calculate_and_display_metrics(
            $metrics3['received'],
            $metrics3['dropped'],
            $metrics3['latency_sum'],
            $metrics3['min_latency'],
            $metrics3['max_latency'],
            $metrics3['latencies'],
            $metrics3['start_time'],
            'subscribe_ticker - sync=false',
            $actual_runtime3
        );
        $benchmark_results[] = store_metrics(
            $metrics3['received'],
            $metrics3['dropped'],
            $metrics3['latency_sum'],
            $metrics3['min_latency'],
            $metrics3['max_latency'],
            $metrics3['latencies'],
            $metrics3['start_time'],
            'subscribe_ticker - sync=false',
            $actual_runtime3
        );
        $binance3->close();

        // --- Fourth Benchmark: NUM_CONSUMERS subscribe_ticker consumers on the same topic (sync=false) ---
        logger('=== Starting Benchmark 4: ' . NUM_CONSUMERS . ' subscribe_ticker consumers on same topic (sync=false) ===');
        $benchmark_start_time = microtime(true);
        $binance4 = setup_exchange($custom_ws_url, $symbol);
        
        // Establish WebSocket connection first
        await($binance4->watch_ticker($symbol));
        
        $metrics_list = array();
        for ($i = 0; $i < NUM_CONSUMERS; $i++) {
            $metrics_list[] = create_metrics_tracker();
        }
        $make_on_ticker = function(&$metrics) use ($RESERVOIR_SIZE) {
            return function($msg) use (&$metrics, $RESERVOIR_SIZE) {
                if (isset($msg->error) && $msg->error) {
                    throw $msg->error;
                }
                process_ticker_message($msg->payload, $metrics, $RESERVOIR_SIZE);
            };
        };
        for ($i = 0; $i < NUM_CONSUMERS; $i++) {
            await($binance4->subscribe_ticker($symbol, $make_on_ticker($metrics_list[$i]), false));
        }
        await(\React\Promise\Timer\sleep($duration_seconds));
        $actual_runtime4 = microtime(true) - $benchmark_start_time;
        // Aggregate results
        $total_received = 0;
        $total_dropped = 0;
        $total_latency_sum = 0;
        $min_latency = PHP_FLOAT_MAX;
        $max_latency = PHP_FLOAT_MIN;
        $all_latencies = array();
        $start_time = PHP_INT_MAX;
        foreach ($metrics_list as $m) {
            $total_received += $m['received'];
            $total_dropped += $m['dropped'];
            $total_latency_sum += $m['latency_sum'];
            $min_latency = min($min_latency, $m['min_latency']);
            $max_latency = max($max_latency, $m['max_latency']);
            $all_latencies = array_merge($all_latencies, $m['latencies']);
            $start_time = min($start_time, $m['start_time']);
        }
        calculate_and_display_metrics(
            $total_received,
            $total_dropped,
            $total_latency_sum,
            $min_latency,
            $max_latency,
            $all_latencies,
            $start_time,
            NUM_CONSUMERS . ' subscribe_ticker (same topic, sync=false)',
            $actual_runtime4
        );
        $benchmark_results[] = store_metrics(
            $total_received,
            $total_dropped,
            $total_latency_sum,
            $min_latency,
            $max_latency,
            $all_latencies,
            $start_time,
            NUM_CONSUMERS . ' subscribe_ticker (same topic, sync=false)',
            $actual_runtime4
        );
        $binance4->close();

        // --- Fifth Benchmark: NUM_CONSUMERS subscribe_ticker consumers on the same topic (sync=true) ---
        logger('=== Starting Benchmark 5: ' . NUM_CONSUMERS . ' subscribe_ticker consumers on same topic (sync=true) ===');
        $benchmark_start_time = microtime(true);
        $binance5 = setup_exchange($custom_ws_url, $symbol);
        
        // Establish WebSocket connection first
        await($binance5->watch_ticker($symbol));
        
        $metrics_list_sync_true = array();
        for ($i = 0; $i < NUM_CONSUMERS; $i++) {
            $metrics_list_sync_true[] = create_metrics_tracker();
        }
        $make_on_ticker_sync_true = function(&$metrics) use ($RESERVOIR_SIZE) {
            return function($msg) use (&$metrics, $RESERVOIR_SIZE) {
                if (isset($msg->error) && $msg->error) {
                    throw $msg->error;
                }
                process_ticker_message($msg->payload, $metrics, $RESERVOIR_SIZE);
            };
        };
        for ($i = 0; $i < NUM_CONSUMERS; $i++) {
            await($binance5->subscribe_ticker($symbol, $make_on_ticker_sync_true($metrics_list_sync_true[$i]), true));
        }
        await(\React\Promise\Timer\sleep($duration_seconds));
        $actual_runtime5 = microtime(true) - $benchmark_start_time;
        // Aggregate results
        $total_received = 0;
        $total_dropped = 0;
        $total_latency_sum = 0;
        $min_latency = PHP_FLOAT_MAX;
        $max_latency = PHP_FLOAT_MIN;
        $all_latencies = array();
        $start_time = PHP_INT_MAX;
        foreach ($metrics_list_sync_true as $m) {
            $total_received += $m['received'];
            $total_dropped += $m['dropped'];
            $total_latency_sum += $m['latency_sum'];
            $min_latency = min($min_latency, $m['min_latency']);
            $max_latency = max($max_latency, $m['max_latency']);
            $all_latencies = array_merge($all_latencies, $m['latencies']);
            $start_time = min($start_time, $m['start_time']);
        }
        calculate_and_display_metrics(
            $total_received,
            $total_dropped,
            $total_latency_sum,
            $min_latency,
            $max_latency,
            $all_latencies,
            $start_time,
            NUM_CONSUMERS . ' subscribe_ticker (same topic, sync=true)',
            $actual_runtime5
        );
        $benchmark_results[] = store_metrics(
            $total_received,
            $total_dropped,
            $total_latency_sum,
            $min_latency,
            $max_latency,
            $all_latencies,
            $start_time,
            NUM_CONSUMERS . ' subscribe_ticker (same topic, sync=true)',
            $actual_runtime5
        );
        $binance5->close();

        // --- Sixth Benchmark: NUM_CONSUMERS consumers, each on a different topic (sync=true) ---
        logger('=== Starting Benchmark 6: ' . NUM_CONSUMERS . ' consumers on different topics (sync=true) ===');
        $benchmark_start_time = microtime(true);
        $binance6 = setup_exchange($custom_ws_url, $symbol);
        $symbols = array_slice($SYMBOLS, 0, NUM_CONSUMERS);
        $multi_topic_metrics = array();
        
        // Run watch_ticker calls in batches of 10
        $batch_size = 10;
        for ($i = 0; $i < count($symbols); $i += $batch_size) {
            $batch_symbols = array_slice($symbols, $i, $batch_size);
            $watch_tasks = array();
            foreach ($batch_symbols as $symbol_name) {
                $watch_tasks[] = $binance6->watch_ticker($symbol_name);
            }
            await(\React\Promise\all($watch_tasks));
        }
        
        $make_on_ticker_multi_topic = function(&$metrics) use ($RESERVOIR_SIZE) {
            return function($msg) use (&$metrics, $RESERVOIR_SIZE) {
                if (isset($msg->error) && $msg->error) {
                    throw $msg->error;
                }
                process_ticker_message($msg->payload, $metrics, $RESERVOIR_SIZE);
            };
        };
        for ($i = 0; $i < NUM_CONSUMERS; $i++) {
            $metrics = create_metrics_tracker();
            $multi_topic_metrics[] = $metrics;
            await($binance6->subscribe_ticker($symbols[$i], $make_on_ticker_multi_topic($multi_topic_metrics[$i]), true));
        }
        await(\React\Promise\Timer\sleep($duration_seconds));
        $actual_runtime6 = microtime(true) - $benchmark_start_time;
        $total_received = 0;
        $total_dropped = 0;
        $total_latency_sum = 0;
        $min_latency = PHP_FLOAT_MAX;
        $max_latency = PHP_FLOAT_MIN;
        $all_latencies = array();
        $start_time = PHP_INT_MAX;
        foreach ($multi_topic_metrics as $m) {
            $total_received += $m['received'];
            $total_dropped += $m['dropped'];
            $total_latency_sum += $m['latency_sum'];
            $min_latency = min($min_latency, $m['min_latency']);
            $max_latency = max($max_latency, $m['max_latency']);
            $all_latencies = array_merge($all_latencies, $m['latencies']);
            $start_time = min($start_time, $m['start_time']);
        }
        calculate_and_display_metrics(
            $total_received,
            $total_dropped,
            $total_latency_sum,
            $min_latency,
            $max_latency,
            $all_latencies,
            $start_time,
            NUM_CONSUMERS . ' subscribe_ticker (different topics, sync=true)',
            $actual_runtime6
        );
        $benchmark_results[] = store_metrics(
            $total_received,
            $total_dropped,
            $total_latency_sum,
            $min_latency,
            $max_latency,
            $all_latencies,
            $start_time,
            NUM_CONSUMERS . ' subscribe_ticker (different topics, sync=true)',
            $actual_runtime6
        );
        $binance6->close();

        // --- Seventh Benchmark: NUM_CONSUMERS consumers, each on a different topic (sync=false) ---
        logger('=== Starting Benchmark 7: ' . NUM_CONSUMERS . ' consumers on different topics (sync=false) ===');
        $benchmark_start_time = microtime(true);
        $binance7 = setup_exchange($custom_ws_url, $symbol);
        $symbols7 = array_slice($SYMBOLS, 0, NUM_CONSUMERS);
        $multi_topic_metrics_sync_false = array();
        
        // Run watch_ticker calls in batches of 10
        for ($i = 0; $i < count($symbols7); $i += $batch_size) {
            $batch_symbols = array_slice($symbols7, $i, $batch_size);
            $watch_tasks7 = array();
            foreach ($batch_symbols as $symbol_name) {
                $watch_tasks7[] = $binance7->watch_ticker($symbol_name);
            }
            await(\React\Promise\all($watch_tasks7));
        }
        
        $make_on_ticker_multi_topic_sync_false = function(&$metrics) use ($RESERVOIR_SIZE) {
            return function($msg) use (&$metrics, $RESERVOIR_SIZE) {
                if (isset($msg->error) && $msg->error) {
                    throw $msg->error;
                }
                process_ticker_message($msg->payload, $metrics, $RESERVOIR_SIZE);
            };
        };
        for ($i = 0; $i < NUM_CONSUMERS; $i++) {
            $metrics = create_metrics_tracker();
            $multi_topic_metrics_sync_false[] = $metrics;
            await($binance7->subscribe_ticker($symbols7[$i], $make_on_ticker_multi_topic_sync_false($multi_topic_metrics_sync_false[$i]), false));
        }
        await(\React\Promise\Timer\sleep($duration_seconds));
        $actual_runtime7 = microtime(true) - $benchmark_start_time;
        $total_received = 0;
        $total_dropped = 0;
        $total_latency_sum = 0;
        $min_latency = PHP_FLOAT_MAX;
        $max_latency = PHP_FLOAT_MIN;
        $all_latencies = array();
        $start_time = PHP_INT_MAX;
        foreach ($multi_topic_metrics_sync_false as $m) {
            $total_received += $m['received'];
            $total_dropped += $m['dropped'];
            $total_latency_sum += $m['latency_sum'];
            $min_latency = min($min_latency, $m['min_latency']);
            $max_latency = max($max_latency, $m['max_latency']);
            $all_latencies = array_merge($all_latencies, $m['latencies']);
            $start_time = min($start_time, $m['start_time']);
        }
        calculate_and_display_metrics(
            $total_received,
            $total_dropped,
            $total_latency_sum,
            $min_latency,
            $max_latency,
            $all_latencies,
            $start_time,
            NUM_CONSUMERS . ' subscribe_ticker (different topics, sync=false)',
            $actual_runtime7
        );
        $benchmark_results[] = store_metrics(
            $total_received,
            $total_dropped,
            $total_latency_sum,
            $min_latency,
            $max_latency,
            $all_latencies,
            $start_time,
            NUM_CONSUMERS . ' subscribe_ticker (different topics, sync=false)',
            $actual_runtime7
        );
        $binance7->close();

        // --- Eighth Benchmark: NUM_CONSUMERS parallel watch_ticker calls to different symbols ---
        logger('=== Starting Benchmark 8: ' . NUM_CONSUMERS . ' parallel watch_ticker calls to different symbols ===');
        $benchmark_start_time = microtime(true);
        $binance8 = setup_exchange($custom_ws_url, $symbol);
        $symbols8 = array_slice($SYMBOLS, 0, NUM_CONSUMERS);
        $parallel_metrics = array();
        for ($i = 0; $i < NUM_CONSUMERS; $i++) {
            $parallel_metrics[] = create_metrics_tracker();
        }
        $end_time8 = (int)(microtime(true) * 1000) + $duration_seconds * 1000;
        
        $stream_tasks = array();
        for ($i = 0; $i < NUM_CONSUMERS; $i++) {
            $stream_tasks[] = stream_consumer($binance8, $symbols8[$i], $i, $parallel_metrics, $RESERVOIR_SIZE, $end_time8);
        }
        await(\React\Promise\all($stream_tasks));
        
        $actual_runtime8 = microtime(true) - $benchmark_start_time;
        $total_received = 0;
        $total_dropped = 0;
        $total_latency_sum = 0;
        $min_latency = PHP_FLOAT_MAX;
        $max_latency = PHP_FLOAT_MIN;
        $all_latencies = array();
        $start_time = PHP_INT_MAX;
        
        foreach ($parallel_metrics as $m) {
            $total_received += $m['received'];
            $total_dropped += $m['dropped'];
            $total_latency_sum += $m['latency_sum'];
            $min_latency = min($min_latency, $m['min_latency']);
            $max_latency = max($max_latency, $m['max_latency']);
            $all_latencies = array_merge($all_latencies, $m['latencies']);
            $start_time = min($start_time, $m['start_time']);
        }
        
        calculate_and_display_metrics(
            $total_received,
            $total_dropped,
            $total_latency_sum,
            $min_latency,
            $max_latency,
            $all_latencies,
            $start_time,
            NUM_CONSUMERS . ' parallel watch_ticker (different symbols, total)',
            $actual_runtime8
        );
        $benchmark_results[] = store_metrics(
            $total_received,
            $total_dropped,
            $total_latency_sum,
            $min_latency,
            $max_latency,
            $all_latencies,
            $start_time,
            NUM_CONSUMERS . ' parallel watch_ticker (different symbols, total)',
            $actual_runtime8
        );
        $binance8->close();

        // Print summary table
        display_results_table($benchmark_results);
    })();
}

// Run the benchmark
await(main());
?> 
