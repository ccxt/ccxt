<?php

namespace ccxt;

use Exception; // a common import
require_once (__DIR__ . '/helpers_for_tests.php');
if (is_synchronous) {
    require_once __DIR__ . '/test_sync.php';
} else {
    require_once __DIR__ . '/test_async.php';
}


$isBaseTests = get_cli_arg_value ('--baseTests');
$isExchangeTests = get_cli_arg_value ('--exchangeTests');
$reqResTests = get_cli_arg_value ('--responseTests') || get_cli_arg_value ('--requestTests');
$isAllTest = !$reqResTests && !$isBaseTests && !$isExchangeTests; // if neither was chosen


// ####### base tests #######
if ($isBaseTests || $isAllTest) {
    // test base things
    require_once __DIR__ . '/base_auto.php';
    (new BaseFunctionalitiesTestClass ())->init();
    print('base tests passed!');
}

// ####### exchange tests #######
if ($isExchangeTests || $reqResTests || $isAllTest) {
    // if (is_synchronous)
    (new testMainClass ())->init($argvExchange, $argvSymbol, $argvMethod);
    print('exchange tests passed!');
}
