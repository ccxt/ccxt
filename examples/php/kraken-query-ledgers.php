<?php

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';
// include 'Console/Table.php';

date_default_timezone_set ('UTC');

// instantiate the exchange by id

$exchange = '\\ccxt\\kraken';
$exchange = new $exchange (array (
    'apiKey' => 'YOUR_API_KEY',
    'secret' => 'YOUR_SECRET_KEY',
));

// get ledgers
$ledgers = $exchange->privatePostLedgers ();

// get ledger ids
$ids = array_keys ($ledgers['result']['ledger']);

// get ledger entries for ledger id
$ledger_entries = $exchange->privatePostQueryLedgers (array (
    'id' =>  $ids[0],
));

var_dump ($ledger_entries);

?>