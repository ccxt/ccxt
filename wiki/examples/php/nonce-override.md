- [Nonce Override](./examples/php/)


 ```php
 <?php

include './ccxt.php';

date_default_timezone_set('UTC');

class MillisecondsNonceExchange extends \ccxt\yobit {
    public function nonce() {
        return $this->milliseconds();
    }
}

$exchange = new MillisecondsNonceExchange(array(
    'apiKey' => 'YOUR_API_KEY',
    'secret' => 'YOUR_SECRET',
));

try {
    $symbol = 'ETH/BTC';
    $result = $exchange->fetch_balance($symbol);
    var_dump ($result);
} catch (\ccxt\NetworkError $e) {
    echo '[Network Error] ' . $e->getMessage() . "\n";
} catch (\ccxt\ExchangeError $e) {
    echo '[Exchange Error] ' . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo '[Error] ' . $e->getMessage() . "\n";
}

?> 
```