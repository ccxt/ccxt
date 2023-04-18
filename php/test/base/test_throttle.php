<?php

use ccxt\async\Throttle;

include '../../vendor/autoload.php';

use Recoil\React\ReactKernel;
use React\EventLoop\Loop;


$delta = 10;

$test_cases = array(
    array(
        'tokens' => 0,
        'refillRate' => 1 / 50,
        'cost' => 1,
        'runs' => 100,
    ),
    array(
        'tokens' => 20,
        'refillRate' => 1 / 50,
        'cost' => 1,
        'runs' => 100,
    ),
    array(
        'tokens' => 40,
        'refillRate' => 1 / 50,
        'cost' => 1,
        'runs' => 100,
    ),
    array(
        'tokens' => 0,
        'refillRate' => 1 / 20,
        'cost' => 1,
        'runs' => 100,
    ),
    array(
        'tokens' => 100,
        'refillRate' => 1 / 20,
        'cost' => 5,
        'runs' => 50,
    ),
    array(
        'tokens' => 0,
        'refillRate' => 1 / 40,
        'cost' => 2,
        'runs' => 50,
    ),
    array(
        'tokens' => 1,
        'refillRate' => 1 / 100,
        'cost' => 1,
        'runs' => 10,
    ),
    array(
        'tokens' => 5,
        'refillRate' => 1 / 100,
        'cost' => 1,
        'runs' => 10,
    ),
    array(
        'tokens' => 0,
        'refillRate' => 1 / 500,
        'cost' => 1,
        'runs' => 10,
    ),
    array(
        'tokens' => 0,
        'refillRate' => 1 / 10,
        'cost' => 1,
        'runs' => 500,
    ),
);

# add any more tests you want above


for ($i = 0; $i < count($test_cases); $i++) {
    $case = &$test_cases[$i];
    $case['number'] = $i;
    $instantly_complete = $case['tokens'] / $case['cost'];
    $remaining = $case['runs'] - $instantly_complete - 1;
    $case['expected'] = $remaining * $case['cost'] / $case['refillRate'];
}


$kernel = ReactKernel::create(Loop::get());

$scheduler = function ($case) use ($kernel, $delta) {
    $throttle = new Throttle(array(
        'refillRate' => $case['refillRate'],
        'tokens' => $case['tokens'],
    ), $kernel);
    $start = microtime(true);
    for ($i = 0; $i < $case['runs']; $i++) {
        yield $throttle($case['cost']);
    }
    $end = microtime(true);
    $elapsed_ms = ($end - $start) * 1000;
    $result = abs($case['expected'] - $elapsed_ms) < $delta;
    $success = $result ? 'succeeded' : 'failed';
    printf("case ${case['number']} $success in ${elapsed_ms}ms expected ${case['expected']}\n");
};

foreach ($test_cases as $test) {
    $kernel->execute($scheduler($test));
}

$kernel->run();

/*
case 7 succeeded in 400ms expected 400
case 6 succeeded in 800ms expected 800
case 3 succeeded in 1980ms expected 1980
case 4 succeeded in 2902ms expected 2900
case 2 succeeded in 2951ms expected 2950
case 5 succeeded in 3921ms expected 3920
case 1 succeeded in 3951ms expected 3950
case 8 succeeded in 4500ms expected 4500
case 8 succeeded in 4500ms expected 4500
case 0 succeeded in 4952ms expected 4950
*/