<?php

use React\Promise;

function throttle($config, $loop) {
    // {
    //    delay:       1,
    //    capacity:    1,
    //    defaultCost: 1,
    //    maxCapacity: 1000,
    // }

    // ported from js implementation for reference
    $default = array(
        'capacity' => 1,
        'delay' => 1,
        'defaultCost' => 1,
        'maxCapacity' => 1000,
    );
    $config = array_merge($default, $config);
    $last_timestamp = microtime(true) * 1000;
    $running = false;
    $queue = new SplQueue();
    $tokens = $config['capacity'];

    $resolver = function($rate_limit) use (&$resolver, &$last_timestamp, &$running, &$tokens, $queue, $config, $loop) {
             // bit of a weird recursive translation
             //
             //  <<">>
             // /<: :>\
             //
             // crab approves this code
             if (count($queue) && !$running) {
                 $running = true;
                 if ($tokens > 0) {
                     $first = $queue->dequeue();
                     list($cost, $resolve) = $first;
                     // allow tokens to become  negative
                     $tokens -= $cost;
                     $resolve();
                 }
                 $now = microtime(true) * 1000;
                 $elapsed = $now - $last_timestamp;
                 $last_timestamp = $now;
                 $tokens = min($config['capacity'], $tokens + $elapsed / $rate_limit);
                 Promise\Timer\resolve($config['delay'] / 1000, $loop)->then(function ($elapsed) use (&$running, $resolver, $rate_limit) {
                     $running = false;
                     $resolver($rate_limit);
                 });
             }
         };

    return function($rate_limit, $cost = null) use ($config, &$last_timestamp, &$running, $queue, &$tokens, $loop, $resolver) {
        if (count($queue) > $config['maxCapacity']) {
            throw new Error ("Backlog is over max capacity of " . $config['maxCapacity']);
        }

        return new React\Promise\Promise(function($resolve) use ($queue, $cost, $resolver, $rate_limit, $config) {
            // add the resolve function to a queue
            // promises get resolved FIFO with a minimum of $config['delay'] delay
            // the maximum delay depends on the $cost of the call and the $tokens available
            $cost = $cost ? $cost : $config['defaultCost'];
            $queue->enqueue(array($cost, $resolve));
            $resolver($rate_limit);
        });
    };
}
