<?php

echo "Checking PHP Syntax...\n\n";
echo "If it fails, follow the below rules:\n\n";
echo "- https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md\n";
echo "\n";

function on_error ($errno, $message, $file, $line) {
    $message = "$message in $file on line $line";
    throw new ErrorException ($message, $errno);
}

set_error_handler ('on_error');

include_once 'ccxt.php';

foreach (\ccxt\Exchange::$exchanges as $id) {
    $exchange = '\\ccxt\\' . $id;
    $exchanges[$id] = new $exchange (array ('verbose' => false));
}
