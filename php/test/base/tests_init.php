<?php

namespace ccxt;

use Exception; // a common import

require_once (__DIR__ . '/test_number.php');
require_once (__DIR__ . '/test_crypto.php');
require_once (__DIR__ . '/test_extend.php');


$exchange = new Exchange ([
    'id'=> 'xyzexchange',
]);
test_number_all();
test_crypto_all();
test_base_functions_extend($exchange);