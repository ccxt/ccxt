<?php

namespace ccxtpro;

$version = 'undefined';

class Exchange extends \ccxt\Exchange {

    // todo: fix version numbers in php

    public static $VERSION = 'undefined';

    use ClientTrait;
}

// the override below is technically an error
// todo: fix the conflict of ccxt.exchanges vs ccxtpro.exchanges

Exchange::$exchanges = array(
    'binance',
    'binanceje',
    'binanceus',
    'bitfinex',
    'bitmex',
    'bittrex',
    'coinbaseprime',
    'coinbasepro',
    'gateio',
    'huobipro',
    'kraken',
    'kucoin',
    'poloniex',
);

