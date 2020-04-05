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
    'bequant',
    'binance',
    'binanceje',
    'binanceus',
    'bitfinex',
    'bitmex',
    'bitstamp',
    'bittrex',
    'coinbaseprime',
    'coinbasepro',
    'ftx',
    'gateio',
    'hitbtc',
    'huobipro',
    'huobiru',
    'kraken',
    'kucoin',
    'okcoin',
    'okex',
    'poloniex',
    'upbit',
);

