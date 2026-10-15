<?php
namespace ccxt;
include_once __DIR__ . '/test_throttler_performance.php';
include_once __DIR__ . '/test_option_types.php';

function test_language_specific() {
    return \React\Async\async(function () {
        test_option_types();
        test_throttler_performance();
    })();
}
