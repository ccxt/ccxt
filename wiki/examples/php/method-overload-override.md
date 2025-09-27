- [Method Overload Override](./examples/php/)


 ```php
 <?php
namespace ccxt;
include_once (__DIR__.'/../../ccxt.php');

error_reporting(E_ALL);
date_default_timezone_set('UTC');
// -----------------------------------------------------------------------------

// ###############################################
// ####### APPROACH 1: Overload the method #######
// ###############################################
function example_1() {
    $ex = new \ccxt\kucoin();
    $ex->add_method('fetch_ticker', function($symbol, $params = []) {
        return 'hello from the overload method';
    });
    var_dump($ex->call_method('fetch_ticker', ['BTC/USDT']));
}
example_1();


// ###############################################
// ####### APPROACH 2: extend the class    #######
// ###############################################
function example_2() {
    $ex = new class extends \ccxt\kucoin {
        public function fetch_ticker($symbol, $params = []) {
            return 'Hello from the anonymous class!';
        }
    };
    var_dump($ex->fetch_ticker('fetch_ticker', ['BTC/USDT']));
}
example_2(); 
```