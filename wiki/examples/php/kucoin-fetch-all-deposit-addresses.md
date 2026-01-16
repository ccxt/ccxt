- [Kucoin Fetch All Deposit Addresses](./examples/php/)


 ```php
 <?php

include './ccxt.php';


date_default_timezone_set('UTC');


echo 'PHP v' . PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION . '.' . PHP_RELEASE_VERSION . "\n";
echo 'CCXT v' . \ccxt\Exchange::VERSION . "\n";


$exchange = new \ccxt\kucoin(array(
    'apiKey' => 'YOUR_API_KEY',
    'secret' => 'YOUR_API_SECRET',
    'password' => 'YOUR_API_PASSWORD',
    'options' => array(
        'versions' => array(
            'public' => array(
                'GET' => array(
                    'currencies/{currency}' => 'v2',
                ),
            ),
        ),
    ),
));

$markets = $exchange->load_markets();

// $exchange->verbose = true; // uncomment for debugging purposes if necessary

function fetch_create_deposit_address_helper($exchange, $code, $chain = null) {
    $response = null;
    try {
        $response = $exchange->fetch_deposit_address($code, $chain ? array('chain' => strtolower($chain)) : array());
        if ((!$response['address']) || (!strlen($response['address']))) {
            throw new \ccxt\ExchangeError ($exchange->id);
        }
    } catch (\ccxt\ExchangeError $e) {
        $response = $exchange->create_deposit_address($code, $chain ? array('chain' => strtolower($chain)) : array());
    }
    return $response;
}

function fetch_create_deposit_address($exchange, $code, $chainName, $chain = null) {
    try {
        $response = fetch_create_deposit_address_helper($exchange, $code, $chain);
        echo $code, ' has a ', $chainName, ' address ', $response['address'], ($response['tag'] && strlen($response['tag'])) ? ':' . $response['tag'] : '', "\n";
        return $response;
    } catch (\ccxt\ExchangeError $e) {
        echo 'Failed to fetch or create ', $code, ' ', $chainName, ' address: ', $e->getMessage(), "\n";
    }
}

$codes = array_keys($exchange->currencies);
$results = array();
foreach ($codes as $code) {
    $response = $exchange->public_get_currencies_currency(array('currency' => $code));
    $currency = $exchange->safe_value($response, 'data');
    if ($currency)  {
        $chains = $exchange->safe_value($currency, 'chains');
        if ((count($chains) > 1) && ($code !== 'BNB')) {
            foreach ($chains as $chain) {
                echo "\n\nhere", $code, "\n\n";
                $chainName = $exchange->safe_string($chain, 'chainName');
                $address = fetch_create_deposit_address($exchange, $code, $chainName, $chainName);
                if (!isset($results[$code])) {
                    $results[$code] = array();
                }
                $results[$code][$chainName] = $address;
            }
        } else {
            $chain = $exchange->safe_value($chains, 0);
            $chainName = $exchange->safe_string($chain, 'chainName');
            $address = fetch_create_deposit_address($exchange, $code, $chainName);
            if (!isset($results[$code])) {
                $results[$code] = array();
            }
            $results[$code][$chainName] = $address;
    }
    } else {
        echo $code, ' has no addresses', "\n";
    }
}


print_r($results);
 
```