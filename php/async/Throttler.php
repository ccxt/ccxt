<?php

namespace ccxt\async;

use React\Promise\Deferred;
use React\Promise\Promise;
use React\EventLoop\Loop;
use React\Async;

class Throttler {
    public $config;
    public $queue;
    public $running;
    public $timestamps;

    public function __construct($config) {
        $this->config = array_merge(array(
            'refillRate' => 1.0,
            'delay' => 0.001,
            'cost' => 1.0,
            'tokens' => 0.0,
            'maxLimiterRequests' => 2000,
            'capacity' => 1.0,
            'algorithm' => 'leakyBucket',
            'rateLimit' => 0,
            'windowSize' => 60000.0,
            'maxWeight' => 0
        ), $config);
        $this->queue = new \SplQueue();
        $this->running = false;
        $this->timestamps = array();
    }

    public function leakyBucketLoop() {
        return Async\async(function () {
            $last_timestamp = microtime(true) * 1000.0;
            while ($this->running) {
                list($future, $cost) = $this->queue->bottom();
                $cost = $cost ? $cost : $this->config['cost'];
                if ($this->config['tokens'] >= 0) {
                    $this->config['tokens'] -= $cost;
                    $future->resolve(null);
                    $this->queue->dequeue();
                    # context switch?
                    # yield 0;
                    if ($this->queue->count() === 0) {
                        $this->running = false;
                    }
                } else {
                    $time = $this->config['delay'];
                    $sleep = new Promise(function ($resolve) use ($time) {
                        Loop::addTimer($time, function () use ($resolve) {
                            $resolve(null);
                        });
                    });
                    Async\await($sleep);
                    $now = microtime(true) * 1000;
                    $elapsed = $now - $last_timestamp;
                    $last_timestamp = $now;
                    $this->config['tokens'] = min($this->config['tokens'] + ($elapsed * $this->config['refillRate']), $this->config['capacity']);
                }
            }
        }) ();
    }

    public function rollingWindowLoop() {
        return Async\async(function () {
            while ($this->running) {
                list($future, $cost) = $this->queue->bottom();
                $cost = $cost ? $cost : $this->config['cost'];
                $now = microtime(true) * 1000.0;
                $this->timestamps = array_values(array_filter($this->timestamps, function ($entry) use ($now) {
                    return ($now - $entry['timestamp']) < $this->config['windowSize'];
                }));
                $total_cost = array_reduce($this->timestamps, function ($sum, $entry) {
                    return $sum + $entry['cost'];
                }, 0);
                if ($total_cost + $cost <= $this->config['maxWeight']) {
                    $this->timestamps[] = array('timestamp' => $now, 'cost' => $cost);
                    $future->resolve(null);
                    $this->queue->dequeue();
                    # context switch?
                    # yield 0;
                    if ($this->queue->count() === 0) {
                        $this->running = false;
                    }
                } else {
                    $earliest = $this->timestamps[0]['timestamp'];
                    $wait_time = ($earliest + $this->config['windowSize']) - $now;
                    if ($wait_time > 0) {
                        $sleep = new Promise(function ($resolve) use ($wait_time) {
                            Loop::addTimer($wait_time / 1000, function () use ($resolve) {
                                $resolve(null);
                            });
                        });
                        Async\await($sleep);
                    }
                }
            }
        }) ();
    }

    public function loop() {
        if ($this->config['algorithm'] === 'leakyBucket') {
            return $this->leakyBucketLoop();
        } else {
            return $this->rollingWindowLoop();
        }
    }

    public function __invoke($cost = null) {
        $future = new Deferred();
        if ($this->queue->count() > $this->config['maxLimiterRequests']) {
            throw new \RuntimeException('throttle queue is over maxLimiterRequests (' . strval($this->config['maxLimiterRequests']) . '), see https://github.com/ccxt/ccxt/issues/11645#issuecomment-1195695526');
        }
        $this->queue->enqueue(array($future, $cost));
        if (!$this->running) {
            Loop::futureTick(array($this, 'loop'));
            $this->running = true;
        }
        return $future->promise();
    }
}
