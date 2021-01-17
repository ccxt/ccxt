<?php

use React\Promise;

function throttle($config, $loop) {
    function now() {
        return microtime(true) * 1000;
    }
    // {
    //    delay:       1,
    //    capacity:    1,
    //    defaultCost: 1,
    //    maxCapacity: 1000,
    // }

    // ported from js implementation for reference
    $last_timestamp = time();
    $running = false;
    $queue = new SplQueue();
    $tokens = $config['capacity'];

    return function($rate_limit, $cost = null) use ($config, &$last_timestamp, &$running, $queue, &$tokens, $loop) {
        if (count($queue) > $config['maxCapacity']) {
            throw new Error ("Backlog is over max capacity of " . $config['maxCapacity']);
        }

        $resolver = function() use (&$resolver, $rate_limit, $cost, $config, &$last_timestamp, &$running, $queue, &$tokens, $loop) {
            // bit of a weird recursive translation
            if (count($queue) && !$running) {
                $running = true;
                $cost = $cost ? $cost : $config['defaultCost'];
                if ($tokens >= min($cost, $config['capacity'])) {
                    $first = $queue->dequeue();
                    list($cost, $resolve, $reject) = $first;
                    // allow tokens to become  negative
                    $tokens -= $cost;
                    $resolve();
                }
                $now = now();
                $elapsed = $now - $last_timestamp;
                $last_timestamp = $now;
                $tokens = min($config['capacity'], $tokens + $elapsed / $rate_limit);
                Promise\Timer\resolve($config['delay'] / 1000, $loop)->then(function ($elapsed) use($resolver, $resolve, $reject, &$running) {
                    $running = false;
                    $resolver($resolve, $reject);
                });
            }
        };
        return new React\Promise\Promise(function($resolve, $reject) use ($queue, $cost, $resolver) {
            $queue->enqueue(array($cost, $resolve, $reject));
            $resolver();
        });
    };
}
