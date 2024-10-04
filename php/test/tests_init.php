<?php

namespace ccxt;
use Exception; // a common import
use function \React\Async\await;
require_once (__DIR__ . '/tests_helpers.php');
if (IS_SYNCHRONOUS) {
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
        await((new testMainClass ())->init_base_tests());
    }
    if (!$isAllTest) {
        exit(0);
    }
}

// ####### exchange tests #######
(new testMainClass ())->init($argvExchange, $argvSymbol, $argvMethod);
