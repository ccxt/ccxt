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
}
