<?php

namespace ccxt;

use Exception; // a common import
require_once (__DIR__ . '/helpers_for_tests.php');
if (is_synchronous) {
    require_once __DIR__ . '/tests_sync.php';
} else {
    require_once __DIR__ . '/tests_async.php';
}


$isWs = get_cli_arg_value ('--ws');
$isBaseTests = get_cli_arg_value ('--baseTests');
$isExchangeTests = get_cli_arg_value ('--exchangeTests');
$reqResTests = get_cli_arg_value ('--responseTests') || get_cli_arg_value ('--requestTests');
$isAllTest = !$reqResTests && !$isBaseTests && !$isExchangeTests; // if neither was chosen


// ####### base tests #######
if ($isBaseTests || $isAllTest) {
    if ($isWs) {
        // no ws tests yet
    } else {
        // test base things
        require_once (__DIR__ . '/base/tests_init.php');
        $exchange = new Exchange ([
            'id'=> 'xyzexchange',
        ]);
        test_base_rest_all($exchange);
        print('base tests passed!');
    }

}

// ####### exchange tests #######
if ($isExchangeTests || $reqResTests || $isAllTest) {
    // if (is_synchronous)
    (new testMainClass ())->init($argvExchange, $argvSymbol, $argvMethod);
    print('exchange tests passed!');
}
