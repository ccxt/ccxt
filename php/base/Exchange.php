<?php

namespace ccxtpro;

// rounding mode duplicated from CCXT
const TRUNCATE = 0;
const ROUND = 1;
const ROUND_UP = 2;
const ROUND_DOWN = 3;

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
    'bitvavo',
    'coinbaseprime',
    'coinbasepro',
    'currencycom',
    'ftx',
    'gateio',
    'hitbtc',
    'huobijp',
    'huobipro',
    'huobiru',
    'idex2',
    'kraken',
    'kucoin',
    'okcoin',
    'okex',
    'phemex',
    'poloniex',
    'ripio',
    'upbit',
);

