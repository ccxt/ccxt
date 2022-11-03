<?php

namespace ccxt\pro;

// rounding mode duplicated from CCXT
// const TRUNCATE = 0;
// const ROUND = 1;
// const ROUND_UP = 2;
// const ROUND_DOWN = 3;

class Exchange extends \ccxt\async\Exchange {

    use ClientTrait;

    public static $exchanges = array();
}

// the override below is technically an error
// todo: fix the conflict of ccxt.exchanges vs ccxtpro.exchanges

Exchange::$exchanges = array(
    'aax',
    'ascendex',
    'bequant',
    'binance',
    'binancecoinm',
    'binanceus',
    'binanceusdm',
    'bitcoincom',
    'bitfinex',
    'bitfinex2',
    'bitmart',
    'bitmex',
    'bitopro',
    'bitstamp',
    'bittrex',
    'bitvavo',
    'bybit',
    'coinbaseprime',
    'coinbasepro',
    'coinex',
    'cryptocom',
    'currencycom',
    'deribit',
    'exmo',
    'ftx',
    'ftxus',
    'gate',
    'gateio',
    'hitbtc',
    'hollaex',
    'huobi',
    'huobijp',
    'huobipro',
    'idex',
    'kraken',
    'kucoin',
    'mexc',
    'ndax',
    'okcoin',
    'okex',
    'okx',
    'phemex',
    'ripio',
    'upbit',
    'whitebit',
    'zb',
    'zipmex',
);

