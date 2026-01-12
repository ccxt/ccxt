- [Binance Fetch All Trades For All Traded Symbols](./examples/php/)


 ```php
 <?php

include './ccxt.php';

date_default_timezone_set('UTC');

$id = "\\ccxt\\binance";
$exchange = new $id(array(
    'apiKey' => 'YOUR_API_KEY',
    'secret' => 'YOUR_SECRET',
));

$exchange->load_markets();
$balance = $exchange->fetch_balance();

$total = $balance['total'];

$all_matching_symbols = array();

foreach ($total as $currency_code => $value) {

    echo "-------------------------------------------------------------------\n";
    echo "Currency code: ", $currency_code, " value: ", $value, "\n";

    if ($value > 0) {

        // get all related markets with
        //   either base currency === currency code from the balance structure
        //      or quote currency === currency code from the balance structure

        $matching_markets = array_filter(array_values($exchange->markets), function ($market) use ($currency_code) {
            return ($market['base'] === $currency_code) || ($market['quote'] === $currency_code);
        });

        $matching_symbols = $exchange->pluck($matching_markets, 'symbol');

        echo "Matching symbols:\n";
        print_r($matching_symbols);

        $all_matching_symbols = array_merge($all_matching_symbols, $matching_symbols);
    }
}

echo "========================================================================\n";
$unique_symbols = $exchange->unique($all_matching_symbols);
print_r($unique_symbols);

$all_trades_for_all_symbols = array();

// ----------------------------------------------------------------------------

function fetch_all_my_trades($exchange, $symbol) {

    $from_id = '0';
    $params = array('fromId' => $from_id);
    $previous_from_id = $from_id;

    $all_trades = array();

    while (true) {

        echo "------------------------------------------------------------------\n";
        echo "Fetching with params:\n";
        print_r($params);
        $trades = $exchange->fetch_my_trades($symbol, null, null, $params);
        echo "Fetched ", count($trades), ' ', $symbol, " trades\n";
        if (count($trades)) {
            $last_trade = $trades[count($trades) - 1];
            if ($last_trade['id'] == $previous_from_id) {
                break;
            } else {
                $params['fromId'] = $last_trade['id'];
                $previous_from_id = $last_trade['id'];
                $all_trades = array_merge ($all_trades, $trades);
            }
        } else {
            break;
        }
    }

    echo "Fetched ", count($all_trades), ' ', $symbol, " trades\n";
    for ($i = 0; $i < count($all_trades); $i++) {
        $trade = $all_trades[$i];
        echo $i, ' ', $trade['symbol'], ' ', $trade['id'], ' ', $trade['datetime'], ' ', $trade['amount'], "\n";
    }

    return $all_trades;
}

// ----------------------------------------------------------------------------

foreach ($unique_symbols as $symbol) {

    echo "=================================================================\n";
    echo "Fetching all ", $symbol, " trades\n";

    // fetch all trades for the $symbol, with pagination
    $trades = fetch_all_my_trades($exchange, $symbol);

    echo count($trades), ' ' , $symbol, " trades\n";

    $all_trades_for_all_symbols = array_merge($all_trades_for_all_symbols, $trades);

}

// do whatever you want with $all_trades_for_all_symbols

?> 
```