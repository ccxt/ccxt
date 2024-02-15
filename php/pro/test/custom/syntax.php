<?php

echo "Checking PHP Syntax...\n";
echo "In case of failure, follow the rules: https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md\n\n";

function on_error ($errno, $message, $file, $line) {
    $message = "$message in $file on line $line";
    throw new ErrorException ($message, $errno);
}

set_error_handler ('on_error');

// this script should be launched from the root of the repo
require_once 'vendor/autoload.php';

foreach (\ccxt\pro\Exchange::$exchanges as $id) {
    $exchange = '\\ccxt\\pro\\' . $id;
    $exchanges[$id] = new $exchange (array ('verbose' => false));
}
