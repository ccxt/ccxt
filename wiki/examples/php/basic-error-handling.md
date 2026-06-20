```php
<?php

include './ccxt.php';

date_default_timezone_set('UTC');

$exchange = new \ccxt\kucoin ();

$message = null;

try {

    $result = $exchange->fetch_ticker ('NONEXISTENT_SYMBOL');
    var_dump ($result);

} catch (Exception $e) {

    // print it
    echo $e->getMessage() . "\n";

    // save to $message (for whatever needs)
    $message = $e->getMessage();
}

?>

```
