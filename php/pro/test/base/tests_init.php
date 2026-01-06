<?php
namespace ccxt\pro;
include_once (__DIR__.'/../../../../ccxt.php');
// ----------------------------------------------------------------------------



include_once (__DIR__.'/test_order_book.php');
include_once (__DIR__.'/test_cache.php');
// todo : include_once (__DIR__.'/test_close.php');


function base_tests_init_ws() {
    return \React\Async\async(function () {
        test_ws_order_book();
        test_ws_cache();
    })();
}
