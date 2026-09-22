<?php
namespace ccxt\pro;
include_once (__DIR__.'/../../../../ccxt.php');
// ----------------------------------------------------------------------------



include_once (__DIR__.'/test_order_book.php');
include_once (__DIR__.'/test_cache.php');
// php-only cache regressions - `test_cache.php` above is generated from
// `ts/src/pro/test/base/test.cache.ts` and cannot host them
include_once (__DIR__.'/test_cache_native.php');
// php-only: the hand-written php/pro/Client.php keepalive teardown (ccxt/ccxt#30293 parity)
include_once (__DIR__.'/test_client_keepalive_timeout.php');
// todo : include_once (__DIR__.'/test_close.php');


function base_tests_init_ws() {
    return \React\Async\async(function () {
        test_ws_order_book();
        test_ws_cache();
        test_ws_cache_php();
        test_ws_client_keepalive_timeout();
    })();
}
