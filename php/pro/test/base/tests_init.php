<?php
namespace ccxt\pro;
include_once (__DIR__.'/../../../../ccxt.php');
// ----------------------------------------------------------------------------



function equals($a, $b) {
    return json_encode($a) === json_encode($b);
 }

 
include_once (__DIR__.'/test_order_book.php');
include_once (__DIR__.'/test_cache.php');
include_once (__DIR__.'/test_close.php');