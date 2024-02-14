- [Load All At Once](./examples/php/)


 ```php
 <?php

include './ccxt.php';

date_default_timezone_set('UTC');

$exchanges = \ccxt\Exchange::$exchanges;

foreach ($exchanges as $exchange) {
    $id = "\\ccxt\\".$exchange;
    $exchange = new $id();
    echo "--------------------------------------------\n";
    echo $exchange->id . "\n";

    try {
        $markets = $exchange->load_markets ();
        echo count (array_values ($exchange->markets)) . " markets: " .
            implode (', ', array_slice ($exchange->symbols, 0, 5)) . "...\n";
    } catch (\ccxt\RequestTimeout $e) {
        echo '[Timeout Error] ' . $e->getMessage() . ' (ignoring)' . "\n";
    } catch (\ccxt\DDoSProtection $e) {
        echo '[DDoS Protection Error] ' . $e->getMessage() . ' (ignoring)' . "\n";
    } catch (\ccxt\AuthenticationError $e) {
        echo '[Authentication Error] ' . $e->getMessage() . ' (ignoring)' . "\n";
    } catch (\ccxt\ExchangeNotAvailable $e) {
        echo '[Exchange Not Available] ' . $e->getMessage() . ' (ignoring)' . "\n";
    } catch (\ccxt\NotSupported $e) {
        echo '[Not Supported] ' . $e->getMessage() . ' (ignoring)' . "\n";
    } catch (\ccxt\NetworkError $e) {
        echo '[Network Error] ' . $e->getMessage() . ' (ignoring)' . "\n";
    } catch (\ccxt\ExchangeError $e) {
        echo '[Exchange Error] ' . $e->getMessage() . ' (ignoring)' . "\n";
    } catch (Exception $e) {
        echo '[Error] ' . $e->getMessage() . "\n";
    }
    echo "\n";
}


?> 
```