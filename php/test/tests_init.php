<?php

namespace ccxt;
use Exception; // a common import
require_once (__DIR__ . '/tests_helpers.php');
require_once PATH_TO_CCXT . '/test/exchange/base/test_shared_methods.php';


$isWs = get_cli_arg_value ('--ws');
$isBaseTests = get_cli_arg_value ('--baseTests');
$runAll = get_cli_arg_value ('--all'); // if neither was chosen


// ####### base tests #######
function run_base_tests() {
    global $isWs, $isBaseTests, $runAll;
    return \React\Async\async(function () use ($isWs, $isBaseTests, $runAll) {
        if ($isBaseTests) {
            if ($isWs) {
                require_once (__DIR__ . '/../pro/test/base/tests_init.php');
                \React\Async\await(\ccxt\pro\base_tests_init_ws())  ;
                print('base WS tests passed!');
            } else {
                // test base things
                require_once (__DIR__ . '/base/tests_init.php');
                \React\Async\await(\ccxt\base_tests_init())  ;
                print('base REST tests passed!');
            }
            if (!$runAll) {
                exit(0);
            }
        }
    })();
}

// ####### exchange tests #######
if (IS_SYNCHRONOUS) {
    require_once __DIR__ . '/tests_sync.php';
    (new testMainClass ())->init($argvExchange, $argvSymbol, $argvMethod);
} else {
    \React\Async\await(run_base_tests() );
    require_once __DIR__ . '/tests_async.php';
    \React\Async\await((new testMainClass ())->init($argvExchange, $argvSymbol, $argvMethod));
}
