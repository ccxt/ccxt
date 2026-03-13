<?php
namespace ccxt;
include_once __DIR__ . '/test_throttler_performance.php';

function test_language_specific() {
    return \React\Async\async(function () {
        test_throttler_performance();
    });
}
