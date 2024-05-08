<?php

namespace ccxt;

use Exception; // a common import
require_once __DIR__ . '/helpers_for_tests.php';
require_once __DIR__ . '/base/functions_auto/test_extend.php';


$isBaseTests = getCliArgValue ('--baseTests');
$isExchangeTests = getCliArgValue ('--exchangeTests');
$isAllTest = !$isBaseTests && !$isExchangeTests; // if neither was chosen


// ####### base tests #######
if ($isBaseTests || $isAllTest) {
    (new BaseFunctionalitiesTestClass ()).init ();
    print('base tests passed!');
}

// ####### exchange tests #######
if ($isExchangeTests || $isAllTest) {
    (new testMainClass ()).init ($argvExchange, $argvSymbol, $argvMethod);
    print('exchange tests passed!');
}
