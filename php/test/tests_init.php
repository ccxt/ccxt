<?php

namespace ccxt;
use Exception; // a common import
require_once (__DIR__ . '/tests_helpers.php');
if (is_synchronous) {
    require_once __DIR__ . '/tests_sync.php';
} else {
    require_once __DIR__ . '/tests_async.php';
}

$isWs = get_cli_arg_value ('--ws');
$isBaseTests = get_cli_arg_value ('--baseTests');
$isAllTest = get_cli_arg_value ('--all'); // if neither was chosen


// ####### base tests #######
if ($isBaseTests) {
    if ($isWs) {
        require_once (__DIR__ . '/../pro/test/base/tests_init.php');
        \ccxt\pro\base_tests_init_ws();
    } else {
        // test base things
        require_once (__DIR__ . '/base/tests_init.php');
        base_tests_init();
    }
    print('base tests passed!');
    if (!$isAllTest) {
        exit(0);
    }
}

// ####### exchange tests #######
(new testMainClass ())->init($argvExchange, $argvSymbol, $argvMethod);
