<?php
namespace ccxt;
include_once (__DIR__.'/../../ccxt.php');

error_reporting(E_ALL | E_STRICT);
date_default_timezone_set('UTC');
// -----------------------------------------------------------------------------

// ###############################################
// ####### APPROACH 1: Overload the method #######
// ###############################################
function my_1() {
    $ex = new \ccxt\kucoin();
    $ex->add_method('fetch_ticker', function($symbol, $params = []) {
        return 'hello world';
    });
    var_dump($ex->call_method('fetch_ticker', ['BTC/USDT']));
}
my_1();


// ###############################################
// ####### APPROACH 2: extend the class    #######
// ###############################################
function my_2() {
    $ex = new class extends \ccxt\kucoin {
        public function fetch_ticker($symbol, $params = []) {
            return 'Hello from the anonymous class!';
        }
    };
    $ex->fetch_ticker('fetch_ticker', ['BTC/USDT']);
}
my_2();