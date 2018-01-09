<?php

include_once 'ccxt.php';

foreach (\ccxt\Exchange::$exchanges as $id) {
    $exchange = '\\ccxt\\' . $id;
    $exchanges[$id] = new $exchange (array ('verbose' => false));
}

