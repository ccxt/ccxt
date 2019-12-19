<?php

namespace ccxtpro;

// use \ccxtpro\ClientTrait;

$version = 'undefined';

class Exchange extends \ccxt\Exchange {

    public static $VERSION = 'undefined';
    use ClientTrait;
}

// the override below is technically an error
// todo: fix the conflict of ccxt.exchanges vs ccxtpro.exchanges

Exchange::$exchanges = array(
    'binance',
    'bitfinex',
    'bitmex',
    'kraken',
    'poloniex',
);

