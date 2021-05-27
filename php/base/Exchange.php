<?php

namespace ccxtpro;

// rounding mode duplicated from CCXT
const TRUNCATE = 0;
const ROUND = 1;
const ROUND_UP = 2;
const ROUND_DOWN = 3;

class Exchange extends \ccxt\async\Exchange {

    // todo: fix version numbers in php

    public static $VERSION = 'undefined';

    use ClientTrait;
}

// the override below is technically an error
// todo: fix the conflict of ccxt.exchanges vs ccxtpro.exchanges

Exchange::$exchanges = array(
    'aax',
    'bequant',
    'binance',
    'binancecoinm',
    'binanceus',
    'binanceusdm',
    'bitcoincom',
    'bitfinex',
    'bitmex',
    'bitstamp',
    'bittrex',
    'bitvavo',
    'cdax',
    'coinbaseprime',
    'coinbasepro',
    'currencycom',
    'ftx',
    'gateio',
    'gopax',
    'hitbtc',
    'huobijp',
    'huobipro',
    'idex',
    'kraken',
    'kucoin',
    'ndax',
    'okcoin',
    'okex',
    'phemex',
    'poloniex',
    'ripio',
    'upbit',
);

