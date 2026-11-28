<?php
namespace ccxt;
include_once __DIR__ . '/test_option_types.php';

function test_language_specific() {
    return \React\Async\async(function () {
        test_option_types();
        $wei = \Web3\Utils::toWei('10.000000000000000001', 'ether');
        assert($wei->toString() === '10000000000000000001');
    })();
}
