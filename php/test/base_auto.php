<?php
namespace ccxt;
include_once (__DIR__.'/base/test_number.php');
include_once (__DIR__.'/base/test_crypto.php');

include_once (__DIR__.'/base/functions_auto/test_extend.php');

class BaseFunctionalitiesTestClass {

    public function init() {
        $exchange = new Exchange ([
            'id'=> 'xyzexchange',
        ]);

        testBaseFunctionsExtend($exchange);
    }
}