<?php
namespace ccxt;
include_once (__DIR__.'/../../ccxt.php');

error_reporting(E_ALL | E_STRICT);
date_default_timezone_set('UTC');
// -----------------------------------------------------------------------------


$ex = new \ccxt\kucoin();
$ex->add_method('fetch_xyz', function ($params = null) {
    return 'hello world';
});
print($ex->fetch_xyz());

