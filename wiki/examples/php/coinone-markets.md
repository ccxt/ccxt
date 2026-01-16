- [Coinone Markets](./examples/php/)


 ```php
 <?php

include './ccxt.php';

$exchange = new \ccxt\coinone(array(
    // 'verbose' => true, // uncomment for verbose output
));

$markets = $exchange->load_markets();

var_dump($markets);
echo "\n" . $exchange->name . " supports " . count($markets) . " pairs\n";

?>
 
```