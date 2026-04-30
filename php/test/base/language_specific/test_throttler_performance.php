<?php
namespace ccxt;

use React\EventLoop\Factory;
use React\Promise\PromiseInterface;

function test_throttler_performance_helper($exchange, $num_requests) {
    $start_time = microtime(true);
    $promises = [];
    
    for ($i = 0; $i < $num_requests; $i++) {
        $promises[] = (function ($i) use ($exchange, $start_time): PromiseInterface {
            try {
                // Use the throttler directly without making any API calls
                return $exchange->throttle(1)->then(
                    function ($result) use ($i, $start_time) {
                        $mock_result = array(
                            'id' => 'mock',
                            'timestamp' => microtime(true) * 1000,
                            'data' => 'mock data',
                        );
                        assert($mock_result['id'] === 'mock');
                        return $mock_result;
                    }
                )->otherwise(
                    function ($error) use ($i, $start_time) {
                        echo "Throttle call " . ($i + 1) . " failed: " . $error->getMessage() . "\n";
                        throw $error;
                    }
                );
            } catch (Exception $e) {
                echo "Immediate exception in call " . ($i + 1) . ": " . $e->getMessage() . "\n";
                return \React\Promise\resolve(null);
            }
        })($i);
    }
    
    return \React\Promise\all($promises)->then(function () use ($start_time) {
        $end_time = microtime(true);
        $total_time = ($end_time - $start_time) * 1000;
        return $total_time;
    });
}

function test_throttler_performance() {
    $loop = Factory::create();
    
    $exchange1 = new \ccxt\async\binance(array(
        'enableRateLimit' => true,
        'rateLimiterAlgorithm' => 'rollingWindow',
    ));
    
    $exchange2 = new \ccxt\async\binance(array(
        'enableRateLimit' => true,
        'rateLimiterAlgorithm' => 'leakyBucket',
    ));

    $exchange3 = new \ccxt\async\binance(array(
        'enableRateLimit' => true,
        'rollingWindowSize' => 0.0,
    ));
    
    $rolling_window_time = 0;
    $leaky_bucket_time = 0;
    $rolling_window_0_time = 0;
    
    // Test rolling window
    test_throttler_performance_helper($exchange1, 100)->then(
        function ($rolling_window_time) use ($exchange2, $exchange3, $loop) {
            
            // Test leaky bucket
            test_throttler_performance_helper($exchange2, 20)->then(
                function ($leaky_bucket_time) use ($rolling_window_time, $exchange3, $loop) {
                    
                    return test_throttler_performance_helper($exchange3, 20)->then(
                        function ($rolling_window_0_time) use ($rolling_window_time, $leaky_bucket_time, $loop) {

                            $rolling_window_time_string = strval($rolling_window_time);
                            $leaky_bucket_time_string = strval($leaky_bucket_time);
                            $rolling_window_0_time_string = strval($rolling_window_0_time);
                            
                            assert($rolling_window_time <= 1000, 'Rolling window throttler happen immediately, time was: ' . $rolling_window_time_string);
                            assert($leaky_bucket_time >= 500, 'Leaky bucket throttler should take at least half a second for 20 requests, time was: ' . $leaky_bucket_time_string);
                            assert($rolling_window_0_time >= 500, 'With rollingWindowSize === 0, the Leaky bucket throttler should be used and take at least half a second for 20 requests, time was: ' . $rolling_window_0_time_string);
                            
                            echo '┌───────────────────────────────────────────┬──────────────┬─────────────────┐' . "\n";
                            echo '│ Algorithm                                 │ Time (ms)    │ Expected (ms)   │' . "\n";
                            echo '├───────────────────────────────────────────┼──────────────┼─────────────────┤' . "\n";
                            echo '│ Rolling Window                            │ ' . str_pad(number_format($rolling_window_time, 2), 11) . '  │ ~3              │' . "\n";
                            echo '│ Leaky Bucket                              │ ' . str_pad(number_format($leaky_bucket_time, 2), 11) . '  │ ~950            │' . "\n";
                            echo '│ Leaky Bucket (rollingWindowSize === 0)    │ ' . str_pad(number_format($rolling_window_0_time_string, 2), 11) . '  │ ~950            │' . "\n";
                            echo '└───────────────────────────────────────────┴──────────────┴─────────────────┘' . "\n";
                            
                            $loop->stop();
                        }
                    );
                }
            );
        }
    )->otherwise(
        function ($error) use ($loop) {
            echo "Test failed: " . $error->getMessage() . "\n";
            $loop->stop();
        }
    );
    
    $loop->run();

    // --- syncUsedWeight tests (synchronous, no event loop needed) ---
    echo "--- syncUsedWeight tests ---\n";
    $exchange4 = new \ccxt\async\binance(['enableRateLimit' => true, 'rateLimiterAlgorithm' => 'rollingWindow']);
    $throttler = $exchange4->throttler;
    $now_ms = (int)(microtime(true) * 1000);

    // Test 1: Under-tracked
    $throttler->timestamps = [['timestamp' => $now_ms - 10000, 'cost' => 50], ['timestamp' => $now_ms - 5000, 'cost' => 30], ['timestamp' => $now_ms - 1000, 'cost' => 20]];
    $throttler->syncUsedWeight(150);
    $total = array_sum(array_column($throttler->timestamps, 'cost'));
    assert(abs($total - 150) < 1, 'under-tracked correction failed');
    echo "  1. under-tracked correction: passed\n";

    // Test 2: Over-tracked
    $throttler->timestamps = [['timestamp' => $now_ms - 10000, 'cost' => 50], ['timestamp' => $now_ms - 5000, 'cost' => 30], ['timestamp' => $now_ms - 1000, 'cost' => 20]];
    $throttler->syncUsedWeight(60);
    $total = array_sum(array_column($throttler->timestamps, 'cost'));
    assert(abs($total - 60) < 1, 'over-tracked correction failed');
    echo "  2. over-tracked correction: passed\n";

    // Test 3: Zero reset
    $throttler->timestamps = [['timestamp' => $now_ms - 1000, 'cost' => 50]];
    $throttler->syncUsedWeight(0);
    $total = array_sum(array_column($throttler->timestamps, 'cost'));
    assert($total == 0, 'zero reset failed');
    echo "  3. zero reset: passed\n";

    // Test 4: Within tolerance
    $throttler->timestamps = [['timestamp' => $now_ms - 1000, 'cost' => 50]];
    $length_before = count($throttler->timestamps);
    $throttler->syncUsedWeight(50);
    assert(count($throttler->timestamps) === $length_before, 'tolerance no-op failed');
    echo "  4. within tolerance (no-op): passed\n";

    // Test 5: Leaky bucket no-op
    $exchange5 = new \ccxt\async\binance(['enableRateLimit' => true, 'rateLimiterAlgorithm' => 'leakyBucket']);
    $exchange5->throttler->timestamps = [['timestamp' => $now_ms, 'cost' => 100]];
    $exchange5->throttler->syncUsedWeight(200);
    assert($exchange5->throttler->timestamps[0]['cost'] === 100, 'leaky bucket should not modify');
    echo "  5. leaky bucket no-op: passed\n";

    // Test 6: Expired entries pruned
    $throttler->timestamps = [['timestamp' => $now_ms - 120000, 'cost' => 999], ['timestamp' => $now_ms - 1000, 'cost' => 20]];
    $throttler->syncUsedWeight(20);
    $total = array_sum(array_column($throttler->timestamps, 'cost'));
    assert(abs($total - 20) < 1, 'expired entry pruning failed');
    echo "  6. expired entry pruning: passed\n";

    // Test 7: Rate limit hit
    $throttler->timestamps = [['timestamp' => $now_ms - 1000, 'cost' => 100]];
    $throttler->syncUsedWeight(1200);
    $total = array_sum(array_column($throttler->timestamps, 'cost'));
    assert(abs($total - 1200) < 1, 'rate limit hit failed');
    echo "  7. rate limit hit (maxWeight): passed\n";

    // Test 8: Custom windowSize
    $throttler->timestamps = [['timestamp' => $now_ms - 5000, 'cost' => 50]];
    $throttler->syncUsedWeight(10, 1000);
    $total = array_sum(array_column($throttler->timestamps, 'cost'));
    assert(abs($total - 10) < 1, 'custom windowSize failed');
    echo "  8. custom windowSize: passed\n";

    echo "--- all syncUsedWeight tests passed ---\n";
}
