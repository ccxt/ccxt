<?php

namespace ccxt;

use Exception; // a common import

require_once (__DIR__ . '/test_number.php');
require_once (__DIR__ . '/test_crypto.php');
require_once (__DIR__ . '/test_extend.php');
require_once (__DIR__ . '/test_datetime.php');


$exchange = new Exchange ([
    'id'=> 'xyzexchange',
]);
test_base_datetime_all();
test_base_number_all();
test_base_crypto_All();
test_base_functions_extend($exchange);