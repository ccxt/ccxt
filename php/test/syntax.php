<?php

echo "Checking PHP Syntax...\n\n";
echo "ATTENTION!\n\n";
echo "If it fails, make sure to clean up the code as outlined in CONTRIBUTING.md document.\n\n";
echo "Read these rules very carefully and follow them LITERALLY:\n\n";
echo "- https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code\n";
echo "- https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#derived-exchange-classes\n";

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
