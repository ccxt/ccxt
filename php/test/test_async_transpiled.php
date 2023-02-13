<?php

namespace ccxt;
error_reporting(E_ALL | E_STRICT);
date_default_timezone_set('UTC');

include_once 'vendor/autoload.php';
include_once 'test_trade.php';
include_once 'test_order.php';
include_once 'test_ohlcv.php';
include_once 'test_position.php';
include_once 'test_transaction.php';
include_once 'test_account.php';

use React\Async;

function style($s, $style) {
    return $style . $s . "\033[0m";
}
function green($s) {
    return style($s, "\033[92m");
}
function blue($s) {
    return style($s, "\033[94m");
}
function yellow($s) {
    return style($s, "\033[93m");
}
function red($s) {
    return style($s, "\033[91m");
}
function pink($s) {
    return style($s, "\033[95m");
}
function bold($s) {
    return style($s, "\033[1m");
}
function underline($s) {
    return style($s, "\033[4m");
}
function dump($s) {
    echo implode(' ', func_get_args()) . "\n";
}

ini_set('memory_limit', '512M');

$exchanges = null;

// $shortopts = '';
// $longopts = array (
//     "nonce::", // '::' means optional, ':' means required
// );

// $options = getopt ($shortopts, $longopts);
// var_dump ($options);
// exit ();

# first we filter the args
$verbose = count(array_filter($argv, function ($option) { return strstr($option, '--verbose') !== false; })) > 0;
$args = array_values(array_filter($argv, function ($option) { return strstr($option, '--verbose') === false; }));

//-----------------------------------------------------------------------------

foreach (Exchange::$exchanges as $id) {
    $exchange = '\\ccxt\\async\\' . $id;
    $exchanges[$id] = new $exchange();
}

$keys_global = './keys.json';
$keys_local = './keys.local.json';
$keys_file = file_exists($keys_local) ? $keys_local : $keys_global;

var_dump($keys_file);

$config = json_decode(file_get_contents($keys_file), true);

foreach ($config as $id => $params) {
    foreach ($params as $key => $value) {
        if (array_key_exists($id, $exchanges)) {
            if (property_exists($exchanges[$id], $key)) {
                $exchanges[$id]->$key = is_array($exchanges[$id]->$key) ? array_replace_recursive($exchanges[$id]->$key, $value) : $value;
            }
        }
    }
}

// ### AUTO-TRANSPILER-START ###


// ### AUTO-TRANSPILER-END ###

$promise = Async\coroutine($main);
Async\await($promise);
