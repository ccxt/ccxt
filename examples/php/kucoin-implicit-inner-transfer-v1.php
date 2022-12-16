<?php

$root = dirname(dirname(dirname(__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set('UTC');

$id = 'kucoin'; // edit this line

// ----------------------------------------------------------------------------

// instantiate the exchange by id
$exchange_class = '\\ccxt\\' . $id;
$exchange = new $exchange_class(array(

    // some exchanges may require additional API credentials
    'apiKey' => 'YOUR_API_KEY', // edit this line
    'secret' => 'YOUR_SECRET', // edit this line
    'password' => 'YOUR_APIKEY_PASSWORD', // edit this line

    // this is not required! uncomment only if you want to debug it
    // 'verbose' => true,

));

// ----------------------------------------------------------------------------
// https://docs.kucoin.com/#inner-transfer

// the difference between unified currency codes and exchange-specific
// currency ids is explained here: https://github.com/ccxt/ccxt/wiki/Manual#symbols-and-market-ids

$code = 'BTC'; // a unified currency code, edit this line

$from = 'main'; // or 'trade', edit this line
$to = 'trade'; // or 'main', edit this line

$amount = '0.123'; // edit this line

// ----------------------------------------------------------------------------
// load "from" and "to" accounts

function get_account_id($exchange, $type, $code) {

    // load markets first
    $exchange->load_markets(); // this will be executed only once

    // convert from a common unified currency code to exchange-specific currency id
    $currency_id = $exchange->currency_id($code);

    echo "Loading a '" . $type . "' account for '" . $code . "'\n";

    $accounts = $exchange->private_get_accounts(array(
        'type' => $type,
    ));
    $data = $exchange->safe_value($accounts, 'data', array());
    $accounts_by_currency_id = $exchange->index_by($accounts['data'], 'currency');

    $account_id = null;

    if (!array_key_exists($currency_id, $accounts_by_currency_id)) {

        echo "Could not find a '" . $type . "' account for '" . $code . "'\n";
        echo "Trying to create a new '" . $type . "' account for '" . $code . "'\n";

        try {

            $response = $exchange->private_post_accounts(array(
                'type' => $type,
                'currency' => $currency_id
            ));

            echo "Successfully created a new '" . $type . "' account for '" . $code . "'\n";

            $account_id = $response['data']['id'];

        } catch (Exception $e) {

            echo "Failed to create a new '" . $type . "' account for '" . $code . "'\n";
            echo get_class($e) . ': ' . $e->getMessage() . "\n";
            exit();
        }

    } else {

        $account_id = $accounts_by_currency_id[$currency_id]['id'];
    }

    echo "Successfully loaded a '" . $type . "' account for '" . $code . "': " . $account_id . "\n";
    return $account_id;
}

// ----------------------------------------------------------------------------

$from_account_id = get_account_id($exchange, $from, $code); // payer (obtained through the "list account" interface)
$to_account_id = get_account_id($exchange, $to, $code); // receiver

echo "Transferring '" . $amount . "' '" . $code . "' from '" . $from . "' account '" . $from_account_id . "' to '" . $to . "' account '" . $to_account_id . "'\n";

// set the arguments for the implicit method
$params = array(

    // set a unique identifier for this transfer
    // can be any arbitrary string that has not been used yet
    'clientOid' => $exchange->uuid(),

    'payAccountId' => $from_account_id,
    'recAccountId' => $to_account_id,

    'amount' => $amount, // a string, transfer amount
);

try {

    $response = $exchange->private_post_accounts_inner_transfer($params);
    print_r($response);

} catch (Exception $e) {

    echo get_class($e) . ': ' . $e->getMessage() . "\n";

}
