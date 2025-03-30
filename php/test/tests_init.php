<?php

namespace ccxt;
use Exception; // a common import
require_once (__DIR__ . '/tests_helpers.php');


$isWs = get_cli_arg_value ('--ws');
$isBaseTests = get_cli_arg_value ('--baseTests');
$runAll = get_cli_arg_value ('--all'); // if neither was chosen


// ####### base tests #######
if ($isBaseTests) {
    if ($isWs) {
        require_once (__DIR__ . '/../pro/test/base/tests_init.php');
        \ccxt\pro\base_tests_init_ws();
        print('base WS tests passed!');
    } else {
        // test base things
        require_once (__DIR__ . '/base/tests_init.php');
        base_tests_init();
        print('base REST tests passed!');
    }
    if (!$runAll) {
        exit(0);
    }
}

// ####### exchange tests #######
if (IS_SYNCHRONOUS) {
    require_once __DIR__ . '/tests_sync.php';
    (new testMainClass ())->init($argvExchange, $argvSymbol, $argvMethod);
} else {
    require_once __DIR__ . '/tests_async.php';
    \React\Async\await((new testMainClass ())->init($argvExchange, $argvSymbol, $argvMethod));
}
